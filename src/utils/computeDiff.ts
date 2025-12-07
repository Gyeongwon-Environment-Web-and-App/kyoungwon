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
  address?: string;
  coordinates?: {
    x_coord: number;
    y_coord: number;
  };
  datetime?: string;
  phone_no?: string;
  content?: string;
  type?: string;
  route?: string;
  status?: boolean | null;
  source?: {
    phone_no: string;
    bad: boolean;
  };
  categories?: string[];
  presigned_links?: PresignedLink[];
}

/**
 * Current complaint data structure (from form)
 */
export interface CurrentComplaintData {
  address?: string;
  coordinates?: {
    x_coord: number;
    y_coord: number;
  };
  datetime?: string;
  phone_no?: string;
  content?: string;
  type?: string;
  route?: string;
  status?: boolean | null;
  source?: {
    phone_no: string;
    bad: boolean;
  };
  categories?: string[];
  objectInfos?: ObjectInfo[];
}

/**
 * Complaint patch payload (what gets sent to API)
 */
export interface ComplaintPatchPayload {
  address?: string;
  coordinates?: {
    x_coord: number;
    y_coord: number;
  };
  datetime?: string;
  phone_no?: string;
  content?: string;
  type?: string;
  route?: string;
  status?: boolean;
  source?: {
    phone_no: string;
    bad: boolean;
  };
  categories?: string[];
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
 * Compares two coordinate objects
 */
function areCoordinatesEqual(
  coord1?: { x_coord: number; y_coord: number },
  coord2?: { x_coord: number; y_coord: number }
): boolean {
  if (!coord1 && !coord2) return true;
  if (!coord1 || !coord2) return false;
  return coord1.x_coord === coord2.x_coord && coord1.y_coord === coord2.y_coord;
}

/**
 * Compares two source objects
 */
function areSourcesEqual(
  source1?: { phone_no: string; bad: boolean },
  source2?: { phone_no: string; bad: boolean }
): boolean {
  if (!source1 && !source2) return true;
  if (!source1 || !source2) return false;
  return source1.phone_no === source2.phone_no && source1.bad === source2.bad;
}

/**
 * Compares two category arrays (order-independent)
 */
function areCategoriesEqual(arr1?: string[], arr2?: string[]): boolean {
  const cat1 = arr1 || [];
  const cat2 = arr2 || [];
  if (cat1.length !== cat2.length) return false;
  const sorted1 = [...cat1].sort().join(',');
  const sorted2 = [...cat2].sort().join(',');
  return sorted1 === sorted2;
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

  // Handle address
  if (current.address !== undefined && current.address !== original.address) {
    payload.address = current.address;
  }

  // Handle coordinates
  if (current.coordinates !== undefined) {
    if (!areCoordinatesEqual(original.coordinates, current.coordinates)) {
      payload.coordinates = current.coordinates;
    }
  }

  // Handle datetime
  if (current.datetime !== undefined && current.datetime !== original.datetime) {
    payload.datetime = current.datetime;
  }

  // Handle phone_no (top-level)
  if (current.phone_no !== undefined && current.phone_no !== original.phone_no) {
    payload.phone_no = current.phone_no;
  }

  // Handle simple fields
  const simpleFields = ['content', 'type', 'route'] as const;
  for (const field of simpleFields) {
    if (current[field] !== undefined && current[field] !== original[field]) {
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

  // Handle source
  if (current.source !== undefined) {
    if (!areSourcesEqual(original.source, current.source)) {
      payload.source = current.source;
    }
  }

  // Handle categories
  if (current.categories !== undefined) {
    if (!areCategoriesEqual(original.categories, current.categories)) {
      payload.categories = current.categories;
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

/**
 * Notice presigned link structure (from API)
 */
export interface NoticePresignedLink {
  url: string;
  key: string;
}

/**
 * Original notice data structure (from API)
 */
export interface OriginalNoticeData {
  title?: string;
  post_type?: string;
  content?: string;
  presigned_links?: NoticePresignedLink[];
  team_categories?: string[];
}

/**
 * Current notice data structure (from form, converted to API format)
 */
export interface CurrentNoticeData {
  title?: string;
  post_type?: string;
  content?: string;
  team_categories?: string[];
  objectInfos?: ObjectInfo[];
}

/**
 * Notice patch payload (what gets sent to API)
 */
export interface NoticePatchPayload {
  title?: string;
  post_type?: string;
  content?: string;
  team_categories?: string[];
  objectInfos?: ObjectInfo[];
}

/**
 * Converts notice presigned_links to objectInfos format for comparison
 */
function convertNoticePresignedLinksToObjectInfos(
  presignedLinks?: NoticePresignedLink[]
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
 * Computes the difference between original and current notice data
 * Returns only changed fields in the format required for PATCH /post/edit/{id}
 *
 * @param original - Original notice data (from API, with presigned_links)
 * @param current - Current notice data (from form, with objectInfos)
 * @returns Partial object with only changed fields in API patch format
 */
export function computeNoticeDiff(
  original: OriginalNoticeData,
  current: CurrentNoticeData
): NoticePatchPayload {
  const payload: NoticePatchPayload = {};

  // Compare simple fields (title, post_type, content)
  if (current.title !== undefined && current.title !== original.title) {
    payload.title = current.title;
  }

  if (
    current.post_type !== undefined &&
    current.post_type !== original.post_type
  ) {
    payload.post_type = current.post_type;
  }

  if (current.content !== undefined && current.content !== original.content) {
    payload.content = current.content;
  }

  // Handle team_categories separately (array comparison)
  if (current.team_categories !== undefined) {
    const originalCategories = original.team_categories || [];
    const currentCategories = current.team_categories || [];

    // Check if arrays are different (order-independent comparison)
    const originalSorted = [...originalCategories].sort().join(',');
    const currentSorted = [...currentCategories].sort().join(',');

    if (originalSorted !== currentSorted) {
      // Only include if array is not empty
      if (currentCategories.length > 0) {
        payload.team_categories = currentCategories;
      }
    }
  }

  // Handle objectInfos with special comparison logic
  if (current.objectInfos !== undefined) {
    const currentObjectInfos = current.objectInfos;
    const originalObjectInfos = convertNoticePresignedLinksToObjectInfos(
      original.presigned_links
    );

    if (!areObjectInfosEqual(originalObjectInfos, currentObjectInfos)) {
      // Only include if array is not empty
      if (currentObjectInfos.length > 0) {
        payload.objectInfos = currentObjectInfos;
      }
    }
  }

  return payload;
}
