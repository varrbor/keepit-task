import { useState } from 'react';
import './Entry.css';

function Entry({ entry, depth, onCreate, onDelete, onRename }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDir = entry.type === 'dir';

  return (
    <div>
      <div className="entry-row" style={{ paddingLeft: `${16 + depth * 20}px` }}>
        {isDir ? (
          <button
            className={`entry-chevron${isExpanded ? ' open' : ''}`}
            onClick={() => setIsExpanded((v) => !v)}
          >
            ▶
          </button>
        ) : (
          <span className="entry-chevron-gap" />
        )}

        <span className="entry-icon">{isDir ? '📁' : '📄'}</span>
        <span className={`entry-name${isDir ? ' is-dir' : ''}`}>{entry.name}</span>

        <div className="entry-actions">
          {isDir && (
            <>
              <button className="entry-btn" onClick={() => onCreate('dir', entry.id)}>
                + folder
              </button>
              <button className="entry-btn" onClick={() => onCreate('file', entry.id)}>
                + file
              </button>
            </>
          )}
          <button className="entry-btn" onClick={() => onRename(entry.id)}>
            rename
          </button>
          <button className="entry-btn danger" onClick={() => onDelete(entry.id)}>
            delete
          </button>
        </div>
      </div>

      {isDir && isExpanded && entry.subCategories?.length > 0 && (
        <div className="entry-children">
          {entry.subCategories.map((sub) => (
            <Entry
              key={sub.id}
              entry={sub}
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
