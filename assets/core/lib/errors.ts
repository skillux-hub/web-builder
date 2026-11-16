export class BusinessError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function text(value: unknown, label: string, max = 200): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new BusinessError(`Invalid ${label}`);
  return value.trim();
}
export function integer(value: unknown, label: string, max = 100000000): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > max) throw new BusinessError(`Invalid ${label}`);
  return value;
}
