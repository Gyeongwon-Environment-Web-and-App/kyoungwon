/**
 * Validation utilities for form inputs
 */

/**
 * Checks if the input string contains dashes
 * @param input - The string to check
 * @returns true if the input contains '-', false otherwise
 */
export const hasDashes = (input: string): boolean => {
  return input.includes('-');
};

/**
 * Removes all dashes from the input string
 * @param input - The string to clean
 * @returns The string with all dashes removed
 */
export const removeDashes = (input: string): string => {
  return input.replace(/-/g, '');
};

/**
 * Validates phone number format (checks for dashes)
 * @param phone - The phone number to validate
 * @returns An object with isValid boolean and optional error message
 */
export const validatePhoneNumber = (
  phone: string
): { isValid: boolean; message?: string } => {
  if (hasDashes(phone)) {
    return { isValid: false, message: "'-'를 빼고 입력해주세요." };
  }
  return { isValid: true };
};

export const formatPhoneNumber = (phoneNum: string) => {
  if (!phoneNum) return '';
  const cleaned = phoneNum.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phoneNum;
}