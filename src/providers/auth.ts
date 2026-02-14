import { AuthProvider } from "@refinedev/core";
import { API_URL } from "./constants";
import { kyInstance } from "./data";

let sessionPromise: Promise<any> | null = null;
let cachedSession: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds

const SESSION_KEY = "auth_session";

const getSession = async () => {
  const now = Date.now();
  if (cachedSession && now - lastFetchTime < CACHE_TTL) {
    return cachedSession;
  }

  if (sessionPromise) {
    return sessionPromise;
  }

  // Try to recover from localStorage if cache is empty (e.g. after HMR)
  if (!cachedSession) {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Optional: Add expiration check here if session has an 'exp' field
        cachedSession = parsed;
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }

  sessionPromise = kyInstance
    .get("auth/get-session")
    .json<any>()
    .then((session) => {
      cachedSession = session;
      lastFetchTime = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionPromise = null;
      return session;
    })
    .catch((error) => {
      console.error("getSession error:", error);
      // If API fails, try to return cached/stored session if available, 
      // but otherwise throw to trigger logout.
      // For HMR stability, if we have a stored session, we might want to return it 
      // even if the verification fails momentarily, but that's risky.
      // Better to rely on the localStorage recovery above to set cachedSession BEFORE the promise.

      cachedSession = null;
      sessionPromise = null;
      // Remove from storage only on definitiveauth failure (401/403), handled in onError. 
      // But if getSession fails generally (e.g. network), do we logout?
      // The original code throws, triggering check() -> false.
      throw error;
    });

  return sessionPromise;
};

export const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    // Clear cache on login attempt
    cachedSession = null;
    lastFetchTime = 0;

    if (providerName) {
      // Social login redirection
      window.location.href = `${API_URL}/auth/signin/${providerName}?callbackURL=${window.location.origin}`;
      return {
        success: true,
      };
    }

    try {
      const response = await kyInstance.post("auth/sign-in/email", {
        json: { email, password },
      });

      if (response.ok) {
        return {
          success: true,
          redirectTo: "/",
        };
      }
    } catch {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid email or password",
        },
      };
    }

    return {
      success: false,
    };
  },
  logout: async () => {
    cachedSession = null;
    lastFetchTime = 0;
    try {
      await kyInstance.post("auth/sign-out");
    } catch {
      // Ignore logout error
    }
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      cachedSession = null;
      lastFetchTime = 0;
      return {
        logout: true,
        redirectTo: "/login",
      };
    }

    return { error };
  },
  check: async () => {
    try {
      const session = await getSession();
      if (session && session.user && session.user.role === "admin") {
        return {
          authenticated: true,
        };
      }
    } catch {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    try {
      const session = await getSession();
      if (session && session.user && session.user.role === "admin") {
        return {
          id: session.user.id,
          name: session.user.name,
          avatar: session.user.image,
          role: session.user.role,
        };
      }
    } catch {
      return null;
    }
    return null;
  },
};
