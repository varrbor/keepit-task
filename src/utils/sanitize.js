import { ENTRY_TYPES } from '../constants/entryTypes';

export const MAX_NAME_LENGTH = 255;
const MAX_TREE_DEPTH = 20;
const VALID_TYPES = new Set(Object.values(ENTRY_TYPES));

export const sanitizeName = (name) =>
  String(name).trim().slice(0, MAX_NAME_LENGTH);

function sanitizeEntry(raw, depth = 0) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (!Number.isFinite(raw.id)) return null;
  if (!VALID_TYPES.has(raw.type)) return null;
  if (typeof raw.name !== 'string' || !raw.name.trim()) return null;

  const subCategories =
    depth < MAX_TREE_DEPTH && Array.isArray(raw.subCategories)
      ? raw.subCategories.map((e) => sanitizeEntry(e, depth + 1)).filter(Boolean)
      : [];

  // Explicitly pick only known fields — drops __proto__ or any injected keys
  return {
    id: raw.id,
    type: raw.type,
    name: raw.name.slice(0, MAX_NAME_LENGTH),
    subCategories
  };
}

export const sanitizeTree = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((e) => sanitizeEntry(e)).filter(Boolean);
};
