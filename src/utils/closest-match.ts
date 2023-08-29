import similarity, { compareTwoStrings } from 'string-similarity';

function normalizedName(inputStr) {
  // Normalize the string to remove diacritics
  let normalized = inputStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Convert to lowercase and replace spaces with underscores
  return normalized.toLowerCase().toLowerCase();
}

async function sanitizeString(str: string): Promise<string> {
  return await normalizedName(str.trim());
}

export async function findClosestMatchInObjects<T>(
  targetString: string,
  objects: T[],
  propertyExtractor: (obj: T) => string,
  ratio = 0.8,
): Promise<T | null> {
  const sanitizedTarget = await sanitizeString(targetString);
  let bestMatchObject: T | null = null;
  let bestMatchRating = 0;

  for (const obj of objects) {
    const objectString = await sanitizeString(propertyExtractor(obj));
    const matchRating = compareTwoStrings(sanitizedTarget, objectString);

    if (matchRating > bestMatchRating) {
      bestMatchRating = matchRating;
      bestMatchObject = obj;
    }
  }

  return bestMatchRating > ratio ? bestMatchObject : null;
}
