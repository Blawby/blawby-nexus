export const formatDate = (value: string | null | undefined) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const firstPresent = <TValue>(
  ...values: Array<TValue | null | undefined>
) => {
  return values.find((value): value is TValue => value !== null && value !== undefined);
};
