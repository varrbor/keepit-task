export const ENTRY_TYPES = {
  DIR: 'dir',
  FILE: 'file'
} as const;

export type EntryType = (typeof ENTRY_TYPES)[keyof typeof ENTRY_TYPES];
