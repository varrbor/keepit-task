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
    const newEntry = {
      id: Date.now(),
      type,
      name,
      subCategories: []
    };
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
    setItems((prev) => renameEntry(id, prev, name));
    setAllItems((prev) => renameEntry(id, prev, name));
  };

  useEffect(() => {
    setItems(applyFileVisibility(allItems, 'file', showFoldersOnly, allItems));
  }, [showFoldersOnly]);

  useEffect(() => {
    setItems(applyDateFilter(allItems, filterDate));
  }, [filterDate]);

  return (
    <div className="App">
      <div className="header">
        <button className="header-button" onClick={() => handleCreate('dir')}>
          create folder
        </button>
        <button className="header-button" onClick={() => handleCreate('file')}>
          create file
        </button>
        <div>
          <label htmlFor="show-folders-only">show folders only</label>
          <input
            id="show-folders-only"
            checked={showFoldersOnly}
            onChange={() => setShowFoldersOnly((prev) => !prev)}
            type="checkbox"
          />
          <DatePicker
            dateFormat="Pp"
            selected={filterDate}
            onChange={(date) => setFilterDate(Date.parse(date))}
          />
        </div>
      </div>

      {items.map((item) => (
        <Entry
          key={item.id}
          entry={item}
          depth={1}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      ))}
    </div>
  );
}

export default App;
