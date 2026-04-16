const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

export function normalisePostcode(postcode: string): string {
  return postcode.replace(/\s+/g, '').toUpperCase();
}

export function isValidUKPostcode(postcode: string): boolean {
  return UK_POSTCODE_REGEX.test(postcode.trim());
}
