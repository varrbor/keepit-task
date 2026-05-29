import { useState } from 'react';
import './Entry.css';

function Entry({ entry, depth, onCreate, onDelete, onRename }) {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleCreate(type) {
    onCreate(type, entry.id);
  }

  function handleDelete() {
    onDelete(entry.id);
  }

  function handleRename() {
    onRename(entry.id);
  }

  return (
    <div>
      {entry.type === 'dir' ? (
        <div className="main">
          <button className="dir" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? '- ' : '+ '}
            {entry.name}
          </button>
          <div className="handlers">
            <button onClick={() => handleCreate('dir')}>create subfolder</button>
            <button onClick={() => handleCreate('file')}>create file</button>
            <button onClick={handleDelete}>delete folder</button>
            <button onClick={handleRename}>rename folder</button>
          </div>
        </div>
      ) : (
        <div className="main">
          {entry.name}
          <div className="handlers">
            <button onClick={handleDelete}>delete file</button>
            <button onClick={handleRename}>rename file</button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div style={{ paddingLeft: `${depth * 10}px` }}>
          {entry.subCategories &&
            entry.subCategories.map((subEntry) => (
              <Entry
                key={subEntry.id}
                entry={subEntry}
                depth={depth + 1}
                onCreate={onCreate}
                onDelete={onDelete}
                onRename={onRename}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default Entry;
