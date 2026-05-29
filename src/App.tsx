import Entry from './components/Entry/Entry';
import './App.css';
import { useEffect, useState } from 'react';
import {
  addEntry,
  removeEntry,
  renameEntry,
  applyFileVisibility,
  applyDateFilter
} from './utils/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ENTRY_TYPES } from './constants/entryTypes';
import type { EntryType } from './constants/entryTypes';
import { sanitizeTree, sanitizeName, MAX_NAME_LENGTH } from './utils/sanitize';
import type { TreeEntry } from './types';

function App() {
  const [allItems, setAllItems] = useState<TreeEntry[]>(() => {
    try {
      const saved = localStorage.getItem('keepit-tree');
      return saved ? sanitizeTree(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [showFoldersOnly, setShowFoldersOnly] = useState<boolean>(
    () => localStorage.getItem('keepit-folders-only') === 'true'
  );

  const [filterDate, setFilterDate] = useState<number>(Date.now());
  const [items, setItems] = useState<TreeEntry[]>(allItems);

  const handleCreate = (type: EntryType, id?: number): void => {
    const raw = prompt(
      `Please provide the name of new ${type === ENTRY_TYPES.DIR ? 'folder' : 'file'}`
    );
    const name = sanitizeName(raw ?? '');
    if (!name) return;
    const newEntry: TreeEntry = { id: Date.now(), type, name, subCategories: [] };
    const parentId = id ?? 'root';
    setItems((prev) => addEntry(prev, newEntry, parentId));
    setAllItems((prev) => addEntry(prev, newEntry, parentId));
  };

  const handleDelete = (id: number): void => {
    setItems((prev) => removeEntry(id, prev));
    setAllItems((prev) => removeEntry(id, prev));
  };

  const handleRename = (id: number): void => {
    const raw = prompt(`Please provide the new name (max ${MAX_NAME_LENGTH} chars)`);
    const name = sanitizeName(raw ?? '');
    if (!name) return;
    setItems((prev) => renameEntry(id, prev, name));
    setAllItems((prev) => renameEntry(id, prev, name));
  };

  useEffect(() => {
    try {
      localStorage.setItem('keepit-tree', JSON.stringify(allItems));
    } catch {
      console.warn('localStorage quota exceeded — tree not persisted.');
    }
  }, [allItems]);

  useEffect(() => {
    localStorage.setItem('keepit-folders-only', String(showFoldersOnly));
  }, [showFoldersOnly]);

  useEffect(() => {
    setItems(applyFileVisibility(allItems, ENTRY_TYPES.FILE, showFoldersOnly, allItems));
  }, [showFoldersOnly]);

  useEffect(() => {
    setItems(applyDateFilter(allItems, filterDate));
  }, [filterDate]);

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <span className="header-brand">KeepIt</span>
          <div className="header-sep" />
          <button className="btn btn-primary" onClick={() => handleCreate(ENTRY_TYPES.DIR)}>
            📁 New Folder
          </button>
          <button className="btn" onClick={() => handleCreate(ENTRY_TYPES.FILE)}>
            📄 New File
          </button>
        </div>

        <div className="header-right">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={showFoldersOnly}
              onChange={() => setShowFoldersOnly((prev) => !prev)}
            />
            show folders only
          </label>
          <DatePicker
            dateFormat="Pp"
            selected={filterDate}
            onChange={(date: Date | null) => {
              if (date) setFilterDate(date.getTime());
            }}
          />
        </div>
      </header>

      <main className="page-body">
        <div className="tree-card">
          <div className="tree-card-header">Files &amp; Folders</div>
          {items.length === 0 ? (
            <div className="tree-empty">
              <span className="tree-empty-icon">🗂️</span>
              No items yet — create a folder or file to get started.
            </div>
          ) : (
            items.map((item) => (
              <Entry
                key={item.id}
                entry={item}
                depth={0}
                onCreate={handleCreate}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
