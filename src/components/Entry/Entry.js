import { useState } from 'react';

function Entry({ entry, depth, createSubfolder }) {
  const [isExpanded, setExpandable] = useState(false);
  function onCreateSubfolder() {
    var subfolderName = prompt('Please provide the name of new folder');
    createSubfolder(subfolderName);
  }
  return (
    <div>
      {entry.children ? (
        <>
          {' '}
          <button onClick={() => setExpandable(!isExpanded)}>
            {isExpanded ? '- ' : '+ '}
            {entry.name}
          </button>
          <button onClick={() => onCreateSubfolder()}>create subfolder</button>
        </>
      ) : (
        <div>{entry.name}</div>
      )}

      {isExpanded && (
        <div style={{ paddingLeft: `${depth * 10}px` }}>
          {entry.children &&
            entry.children.map((entry) => (
              <Entry key={entry.name} entry={entry} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

export default Entry;
