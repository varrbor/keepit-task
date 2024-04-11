import Entry from './components/Entry/Entry';
import './App.css';
import { useState } from 'react';

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

function App() {
  const [entities, setEntities] = useState(files.children);

  function createFolder(name) {
    var uname = prompt('Please provide the name of new folder');
    console.log(name);

    setEntities([...entities, { name: uname, children: [] }]);
  }

  function createFile(name) {
    var uname = prompt('Please provide the name of new file');
    console.log(name);

    setEntities([...entities, { name: uname }]);
  }

  return (
    <div className="App">
      <button onClick={() => createFolder()}>create folder</button>
      <button onClick={() => createFile()}>create file</button>
      {entities.map((entry) => (
        <Entry key={entry.name} entry={entry} depth={1} />
      ))}
    </div>
  );
}

export default App;
