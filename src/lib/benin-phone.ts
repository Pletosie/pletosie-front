export function beninNationalNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return (digits.startsWith("229") ? digits.slice(3) : digits).slice(0, 10);
}
