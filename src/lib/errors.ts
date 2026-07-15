const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong."
) => {
  const response = isRecord(error) ? error.response : undefined;
  const responseStatus = isRecord(response) ? response.status : undefined;
  const responseStatusText = isRecord(response) ? response.statusText : undefined;
  const errorStatus = isRecord(error) ? error.status : undefined;
  const errorMessage = isRecord(error) ? error.message : undefined;
  const status =
    typeof responseStatus === "number"
      ? responseStatus
      : typeof errorStatus === "number"
        ? errorStatus
        : undefined;
  const statusText =
    typeof responseStatusText === "string" ? responseStatusText : undefined;
  const message = typeof errorMessage === "string" ? errorMessage : undefined;

  if (status && statusText) {
    return `${status} ${statusText}`;
  }

  if (status) {
    return `Request failed with status ${status}`;
  }

  return message || fallback;
};
