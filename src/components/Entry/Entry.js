import { useState } from 'react';
import './Entry.css';
function Entry({
  entry,
  depth,
  createCategoryHandler,
  deleteCategoryHandler,
  updateCategoryHandler
}) {
  const [isExpanded, setExpandable] = useState(false);
  function onCreateSubfolder(type) {
    createCategoryHandler(type, entry.id);
  }
  function onDeleteSubfolder() {
    deleteCategoryHandler(entry.id);
  }

  function onUpdateSubfolder() {
    updateCategoryHandler(entry.id);
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
            <button onClick={() => onUpdateSubfolder('file')}> rename folder</button>
          </div>
        </div>
      ) : (
        <div className="main">
          {entry.name}
          <div className="handlers">
            <button onClick={() => onDeleteSubfolder('file')}> delete file</button>
            <button onClick={() => onUpdateSubfolder('file')}> rename file</button>
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
                updateCategoryHandler={updateCategoryHandler}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default Entry;
