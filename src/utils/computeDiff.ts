import type { PresignedLink } from '@/types/complaint';

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

/**
 * Object info structure for complaint API
 */
export interface ObjectInfo {
  objectKey: string;
  filenameOriginal: string;
}

/**
 * Original complaint data structure (from API)
 */
export interface OriginalComplaintData {
  phone_no?: string;
  content?: string;
  type?: string;
  route?: string;
  status?: boolean | null;
  presigned_links?: PresignedLink[];
}

/**
 * Current complaint data structure (from form)
 */
export interface CurrentComplaintData {
  phone_no?: string;
  content?: string;
  type?: string;
  route?: string;
  status?: boolean | null;
  objectInfos?: ObjectInfo[];
}

/**
 * Complaint patch payload (what gets sent to API)
 */
export interface ComplaintPatchPayload {
  phone_no?: string;
  content?: string;
  type?: string;
  route?: string;
  status?: boolean;
  objectInfos?: ObjectInfo[];
}

/**
 * Converts presigned_links to objectInfos format for comparison
 */
function convertPresignedLinksToObjectInfos(
  presignedLinks?: PresignedLink[]
): ObjectInfo[] {
  if (!presignedLinks || presignedLinks.length === 0) {
    return [];
  }

  return presignedLinks.map((link) => ({
    objectKey: link.key,
    filenameOriginal: link.key.split('/').pop() || 'file',
  }));
}

/**
 * Compares two objectInfos arrays (order-independent)
 */
function areObjectInfosEqual(arr1: ObjectInfo[], arr2: ObjectInfo[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Check if every item in arr1 exists in arr2
  const allInArr2 = arr1.every((obj1) =>
    arr2.some(
      (obj2) =>
        obj2.objectKey === obj1.objectKey &&
        obj2.filenameOriginal === obj1.filenameOriginal
    )
  );

  // Check if every item in arr2 exists in arr1
  const allInArr1 = arr2.every((obj2) =>
    arr1.some(
      (obj1) =>
        obj1.objectKey === obj2.objectKey &&
        obj1.filenameOriginal === obj2.filenameOriginal
    )
  );

  return allInArr1 && allInArr2;
}

/**
 * Computes the difference between original and current complaint data
 * Returns only changed fields in the format required for PATCH /complaint/edit/{id}
 *
 * @param original - Original complaint data (from API, with presigned_links)
 * @param current - Current complaint data (from form, with objectInfos)
 * @returns Partial object with only changed fields in API patch format
 */
export function computeComplaintDiff(
  original: OriginalComplaintData,
  current: CurrentComplaintData
): ComplaintPatchPayload {
  const payload: ComplaintPatchPayload = {};

  // Compare simple fields using computeDiff
  const simpleFields = ['phone_no', 'content', 'type', 'route'] as const;
  const simpleDiff = computeDiff(original, current);

  for (const field of simpleFields) {
    if (field in simpleDiff && current[field] !== undefined) {
      payload[field] = current[field] as string;
    }
  }

  // Handle status separately (convert null to false for API)
  if (current.status !== undefined && current.status !== null) {
    const originalStatus = original.status ?? false;
    if (current.status !== originalStatus) {
      payload.status = current.status;
    }
  }

  // Handle objectInfos with special comparison logic
  if (current.objectInfos !== undefined) {
    const currentObjectInfos = current.objectInfos;
    const originalObjectInfos = convertPresignedLinksToObjectInfos(
      original.presigned_links
    );

    if (!areObjectInfosEqual(originalObjectInfos, currentObjectInfos)) {
      payload.objectInfos = currentObjectInfos;
    }
  }

  return payload;
}
