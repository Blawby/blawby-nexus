import type { AuthProvider } from "@refinedev/core";
import { API_URL } from "./constants";
import { kyInstance } from "./data";

type DashboardUser = {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
};

type DashboardSession = {
  user?: DashboardUser | null;
} | null;

type DashboardSessionEnvelope = {
  data?: DashboardSession;
  session?: DashboardSession;
  user?: DashboardUser | null;
};

let sessionPromise: Promise<DashboardSession> | null = null;
let cachedSession: DashboardSession = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds

const SESSION_KEY = "dashboard_session";

const clearSessionCache = () => {
  cachedSession = null;
  sessionPromise = null;
  lastFetchTime = 0;
  localStorage.removeItem(SESSION_KEY);
};

const signOutSilently = async () => {
  try {
    await kyInstance.post("auth/sign-out");
  } catch {
    // Ignore logout error
  } finally {
    clearSessionCache();
  }
};

const isDashboardSession = (value: unknown): value is DashboardSession => {
  if (value === null || typeof value !== "object") {
    return value === null;
  }

  return "user" in value;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getErrorStatus = (error: unknown) => {
  if (!isRecord(error)) {
    return undefined;
  }

  const response = error.response;
  if (isRecord(response) && typeof response.status === "number") {
    return response.status;
  }

  return typeof error.status === "number" ? error.status : undefined;
};

const toDashboardSession = (value: unknown): DashboardSession => {
  if (isDashboardSession(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  const envelope: DashboardSessionEnvelope = value;

  if (isDashboardSession(envelope.data)) {
    return envelope.data;
  }

  if (isDashboardSession(envelope.session)) {
    return envelope.session;
  }

  if (envelope.user) {
    return { user: envelope.user };
  }

  return null;
};

const getStoredSession = () => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    return isDashboardSession(parsed) ? parsed : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const getSession = async (): Promise<DashboardSession> => {
  const now = Date.now();
  if (cachedSession && now - lastFetchTime < CACHE_TTL) {
    return cachedSession;
  }

  if (sessionPromise) {
    return sessionPromise;
  }

  // Try to recover from localStorage if cache is empty (e.g. after HMR)
  if (!cachedSession) {
    cachedSession = getStoredSession();
  }

  sessionPromise = kyInstance
    .get("auth/get-session")
    .json<unknown>()
    .then((response) => {
      const session = toDashboardSession(response);

      if (!session?.user) {
        throw new Error("Session response did not include a user.");
      }

      cachedSession = session;
      lastFetchTime = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionPromise = null;
      return session;
    })
    .catch((error) => {
      cachedSession = null;
      sessionPromise = null;
      throw error;
    });

  return sessionPromise;
};

const getDashboardAccessErrorMessage = (error: unknown) => {
  const status = getErrorStatus(error);

  if (status === 403) {
    return "This account does not have dashboard access.";
  }

  if (status === 401) {
    return "Invalid email or password.";
  }

  return "Dashboard access could not be verified.";
};

export const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    // Clear cache on login attempt
    clearSessionCache();

    if (providerName) {
      // Social login redirection
      const searchParams = new URLSearchParams({
        provider: providerName,
        callbackURL: window.location.origin,
      });
      window.location.href = `${API_URL}/auth/sign-in/social?${searchParams}`;
      return {
        success: true,
      };
    }

    try {
      await kyInstance.post("auth/dashboard/sign-in/email", {
        json: { email, password },
      });
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: getDashboardAccessErrorMessage(error),
        },
      };
    }

    try {
      await getSession();

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      await signOutSilently();

      return {
        success: false,
        error: {
          name: "AccessDenied",
          message: getDashboardAccessErrorMessage(error),
        },
      };
    }
  },
  logout: async () => {
    await signOutSilently();
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    return { error };
  },
  check: async () => {
    try {
      await getSession();
      return {
        authenticated: true,
      };
    } catch {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    try {
      const session = await getSession();
      const user = session?.user;
      if (user) {
        return {
          id: user.id,
          name: user.name,
          avatar: user.image,
          email: user.email,
        };
      }
    } catch {
      return null;
    }
    return null;
  },
};
