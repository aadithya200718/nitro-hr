import Fuse from 'fuse.js';

/**
 * Fuzzy Search Utility
 *
 * Provides a reusable fuzzy-matching helper using Fuse.js,
 * mirroring the Python difflib-based search from the original system.
 */
export function fuzzySearchByName<T extends { name: string }>(
  items: T[],
  query: string,
  threshold: number = 0.4
): T[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const fuse = new Fuse(items, {
    keys: ['name'],
    threshold,
    includeScore: true,
    ignoreLocation: true,
  });

  return fuse.search(query).map((result) => result.item);
}
