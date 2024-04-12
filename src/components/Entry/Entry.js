import { useState } from 'react';
import './Entry.css';
function Entry({ entry, depth, createCategoryHandler, deleteCategoryHandler }) {
  console.log(1111, entry);
  const [isExpanded, setExpandable] = useState(false);
  function onCreateSubfolder(type) {
    createCategoryHandler(type, entry.id);
  }
  function onDeleteSubfolder(type) {
    deleteCategoryHandler(entry.id);
  }
  return (
    <div>
      {entry.type === 'dir' ? (
        <div className="main">
          <button className="dir" onClick={() => setExpandable(!isExpanded)}>
            {isExpanded ? '- ' : '+ '}
            {entry.name}
          </button>
          <div className="handlers">
            <button onClick={() => onCreateSubfolder('dir')}>create subfolder</button>
            <button onClick={() => onCreateSubfolder('file')}>create file</button>
            <button onClick={() => onDeleteSubfolder('file')}> delete folder</button>
          </div>
        </div>
      ) : (
        <div className="main">
          {entry.name}
          <div className="handlers">
            <button onClick={() => onDeleteSubfolder('file')}> delete file</button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div style={{ paddingLeft: `${depth * 10}px` }}>
          {entry.subCategories &&
            entry.subCategories.map((entry) => (
              <Entry
                key={entry.id}
                entry={entry}
                depth={depth + 1}
                createCategoryHandler={createCategoryHandler}
                deleteCategoryHandler={deleteCategoryHandler}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default Entry;
