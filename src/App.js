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

function App() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [showFoldersOnly, setShowFoldersOnly] = useState(false);
  const [filterDate, setFilterDate] = useState(Date.now());

  const handleCreate = (type, id) => {
    const name = prompt(`Please provide the name of new ${type === 'dir' ? 'folder' : 'file'}`);
    if (!name?.trim()) return;
    const newEntry = { id: Date.now(), type, name: name.trim(), subCategories: [] };
    const parentId = id ?? 'root';
    setItems((prev) => addEntry(prev, newEntry, parentId));
    setAllItems((prev) => addEntry(prev, newEntry, parentId));
  };

  const handleDelete = (id) => {
    setItems((prev) => removeEntry(id, prev));
    setAllItems((prev) => removeEntry(id, prev));
  };

  const handleRename = (id) => {
    const name = prompt('Please provide the new name');
    if (!name?.trim()) return;
    setItems((prev) => renameEntry(id, prev, name.trim()));
    setAllItems((prev) => renameEntry(id, prev, name.trim()));
  };

  useEffect(() => {
    setItems(applyFileVisibility(allItems, 'file', showFoldersOnly, allItems));
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
          <button className="btn btn-primary" onClick={() => handleCreate('dir')}>
            📁 New Folder
          </button>
          <button className="btn" onClick={() => handleCreate('file')}>
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
            Folders only
          </label>
          <DatePicker
            dateFormat="Pp"
            selected={filterDate}
            onChange={(date) => setFilterDate(Date.parse(date))}
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
