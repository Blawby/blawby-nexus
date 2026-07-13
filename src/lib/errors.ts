type ErrorWithResponse = {
  response?: {
    status?: number;
    statusText?: string;
  };
  status?: number;
  message?: string;
};

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong."
) => {
  const typedError = error as ErrorWithResponse | undefined;
  const status = typedError?.response?.status ?? typedError?.status;
  const statusText = typedError?.response?.statusText;
  const message = typedError?.message;

  if (status && statusText) {
    return `${status} ${statusText}`;
  }

  if (status) {
    return `Request failed with status ${status}`;
  }

  return message || fallback;
};
