import { useState } from 'react';
import './App.css';

function App() {
  const files = {
    children: [
      {
        name: 'node_modules',
        children: [
          {
            name: 'joi',
            children: [
              {
                name: 'package.json'
              },
              {
                name: 'vite.config.ts'
              }
            ]
          }
        ]
      },
      {
        name: 'package.json'
      },
      {
        name: 'vite.config.ts'
      }
    ]
  };
  function Entry({ entry, depth }) {
    const [isExpanded, setExpandable] = useState(false);
    return (
      <div>
        {entry.children ? (
          <button onClick={() => setExpandable(!isExpanded)}>
            {isExpanded ? '- ' : '+ '}
            {entry.name}
          </button>
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
  return (
    <div className="App">
      {files.children.map((entry) => (
        <Entry key={entry.name} entry={entry} depth={1} />
      ))}
    </div>
  );
}

export default App;
