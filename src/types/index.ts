import type { EntryType } from '../constants/entryTypes';

export interface TreeEntry {
  id: number;
  type: EntryType;
  name: string;
  subCategories: TreeEntry[];
}
