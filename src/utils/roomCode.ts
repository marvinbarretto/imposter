/**
 * Generates a random 4-digit room code
 * @param randomFn - Injectable random function for testing (defaults to Math.random)
 */
export function generateRoomCode(randomFn: () => number = Math.random): string {
  const code = Math.floor(randomFn() * 10000);
  return code.toString().padStart(4, '0');
}

/**
 * Validates that a string is a valid 4-digit room code
 */
export function isValidRoomCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}
