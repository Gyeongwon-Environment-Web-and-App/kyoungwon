/**
 * Computes the difference between original and current data
 * Returns only changed fields, including empty arrays for cleared fields
 *
 * @param original - Original data object
 * @param current - Current data object
 * @returns Partial object with only changed fields
 */
export function computeDiff<T>(original: T, current: T): Partial<T> {
  const changes: Partial<T> = {};
  const originalObj = original as Record<string, unknown>;
  const currentObj = current as Record<string, unknown>;

  // Iterate through all keys in current data
  for (const key in currentObj) {
    if (!(key in currentObj)) continue;

    const originalValue = originalObj[key];
    const currentValue = currentObj[key];

    // Handle arrays - check if content changed or if cleared (empty array)
    if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
      const originalArray = Array.isArray(originalValue) ? originalValue : [];
      const currentArray = Array.isArray(currentValue) ? currentValue : [];

      // Check if arrays are different (order-independent comparison)
      const originalSorted = [...originalArray].sort().join(',');
      const currentSorted = [...currentArray].sort().join(',');

      if (originalSorted !== currentSorted) {
        // Include empty array if cleared, or new array if changed
        changes[key as keyof T] = currentArray as T[keyof T];
      }
    }
    // Handle primitive values (string, number, boolean)
    else if (originalValue !== currentValue) {
      changes[key as keyof T] = currentValue as T[keyof T];
    }
  }

  return changes;
}

/**
 * Computes diff for nested objects with field mapping
 * Useful when form data structure differs from API structure
 *
 * @param original - Original data object
 * @param current - Current data object
 * @param fieldMap - Mapping from form field names to API field names
 * @returns Partial object with only changed fields (using API field names)
 */
export function computeDiffWithMapping<TForm, TApi>(
  original: TForm,
  current: TForm,
  fieldMap: Partial<Record<keyof TForm, keyof TApi>>
): Partial<TApi> {
  const changes: Partial<TApi> = {};
  const originalObj = original as Record<string, unknown>;
  const currentObj = current as Record<string, unknown>;

  for (const formKey in currentObj) {
    if (!(formKey in currentObj)) continue;

    const apiKey = fieldMap[formKey as keyof TForm];
    if (!apiKey) continue;

    const originalValue = originalObj[formKey];
    const currentValue = currentObj[formKey];

    // Handle arrays
    if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
      const originalArray = Array.isArray(originalValue) ? originalValue : [];
      const currentArray = Array.isArray(currentValue) ? currentValue : [];

      const originalSorted = [...originalArray].sort().join(',');
      const currentSorted = [...currentArray].sort().join(',');

      if (originalSorted !== currentSorted) {
        changes[apiKey] = currentArray as unknown as TApi[keyof TApi];
      }
    }
    // Handle primitive values
    else if (originalValue !== currentValue) {
      changes[apiKey] = currentValue as unknown as TApi[keyof TApi];
    }
  }

  return changes;
}
