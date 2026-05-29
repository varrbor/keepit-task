import { ENTRY_TYPES } from '../constants/entryTypes';
import type { TreeEntry } from '../types';

export const MAX_NAME_LENGTH = 255;
const MAX_TREE_DEPTH = 20;
const VALID_TYPES: Set<string> = new Set(Object.values(ENTRY_TYPES));

export const sanitizeName = (name: string): string => String(name).trim().slice(0, MAX_NAME_LENGTH);

function sanitizeEntry(raw: unknown, depth = 0): TreeEntry | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const node = raw as Record<string, unknown>;

  if (!Number.isFinite(node.id)) return null;
  if (!VALID_TYPES.has(node.type as string)) return null;
  if (typeof node.name !== 'string' || !node.name.trim()) return null;

  const subCategories =
    depth < MAX_TREE_DEPTH && Array.isArray(node.subCategories)
      ? node.subCategories
          .map((e) => sanitizeEntry(e, depth + 1))
          .filter((e): e is TreeEntry => e !== null)
      : [];

  // Explicitly pick only known fields — drops __proto__ or any injected keys
  return {
    id: node.id as number,
    type: node.type as TreeEntry['type'],
    name: (node.name as string).slice(0, MAX_NAME_LENGTH),
    subCategories
  };
}

export const sanitizeTree = (data: unknown): TreeEntry[] => {
  if (!Array.isArray(data)) return [];
  return data.map((e) => sanitizeEntry(e)).filter((e): e is TreeEntry => e !== null);
};
