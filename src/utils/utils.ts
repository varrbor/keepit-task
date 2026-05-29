import type { EntryType } from '../constants/entryTypes';
import type { TreeEntry } from '../types';

export const addEntry = (
  entries: TreeEntry[],
  newEntry: TreeEntry,
  parentId: number | 'root'
): TreeEntry[] => {
  if (parentId === 'root') return [...entries, newEntry];
  return entries.map((entry) => addEntryRecursive(entry, newEntry, parentId));
};

const addEntryRecursive = (entry: TreeEntry, newEntry: TreeEntry, parentId: number): TreeEntry => {
  if (entry.id === parentId) return { ...entry, subCategories: [...entry.subCategories, newEntry] };
  return {
    ...entry,
    subCategories: entry.subCategories.map((e) => addEntryRecursive(e, newEntry, parentId)),
  };
};

export const removeEntry = (id: number, entries: TreeEntry[]): TreeEntry[] => {
  if (entries.some((entry) => entry.id === id)) return entries.filter((entry) => entry.id !== id);
  return entries.map((entry) => removeEntryRecursive(entry, id));
};

const removeEntryRecursive = (entry: TreeEntry, id: number): TreeEntry => {
  if (entry.subCategories.some((e) => e.id === id))
    return { ...entry, subCategories: entry.subCategories.filter((e) => e.id !== id) };
  return {
    ...entry,
    subCategories: entry.subCategories.map((e) => removeEntryRecursive(e, id)),
  };
};

export const renameEntry = (id: number, entries: TreeEntry[], name: string): TreeEntry[] => {
  if (entries.some((entry) => entry.id === id))
    return entries.map((entry) => (entry.id === id ? { ...entry, name } : entry));
  return entries.map((entry) => renameEntryRecursive(entry, id, name));
};

const renameEntryRecursive = (entry: TreeEntry, id: number, name: string): TreeEntry => {
  if (entry.subCategories.some((e) => e.id === id))
    return {
      ...entry,
      subCategories: entry.subCategories.map((e) => (e.id === id ? { ...e, name } : e)),
    };
  return {
    ...entry,
    subCategories: entry.subCategories.map((e) => renameEntryRecursive(e, id, name)),
  };
};

export const applyFileVisibility = (
  entries: TreeEntry[],
  type: EntryType,
  showFoldersOnly: boolean
): TreeEntry[] => {
  if (!showFoldersOnly) return entries;
  return entries
    .filter((entry) => entry.type !== type)
    .map((entry) => applyFileVisibilityRecursive(entry, type));
};

const applyFileVisibilityRecursive = (entry: TreeEntry, type: EntryType): TreeEntry => ({
  ...entry,
  subCategories: entry.subCategories
    .filter((e) => e.type !== type)
    .map((e) => applyFileVisibilityRecursive(e, type)),
});

export const applyDateFilter = (entries: TreeEntry[], filterDate: number): TreeEntry[] =>
  entries
    .filter((entry) => entry.createdAt < filterDate)
    .map((entry) => applyDateFilterRecursive(entry, filterDate));

const applyDateFilterRecursive = (entry: TreeEntry, date: number): TreeEntry => ({
  ...entry,
  subCategories: entry.subCategories
    .filter((e) => e.createdAt < date)
    .map((e) => applyDateFilterRecursive(e, date)),
});

export const applyNameFilter = (entries: TreeEntry[], query: string): TreeEntry[] => {
  const q = query.toLowerCase();
  return entries.reduce<TreeEntry[]>((acc, entry) => {
    const matchesSelf = entry.name.toLowerCase().includes(q);
    const filteredChildren = applyNameFilter(entry.subCategories, query);
    if (matchesSelf || filteredChildren.length > 0) {
      acc.push({ ...entry, subCategories: filteredChildren });
    }
    return acc;
  }, []);
};
