import Entry from './components/Entry/Entry';
import './App.css';
import { useEffect, useState } from 'react';
import { createCategory, deleteCategory, updateCategory, hideCategory } from './utils/utils';

function App() {
  const [entities, setEntities] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [cache, setCache] = useState([]);

  const createCategoryHandler = (type, id) => {
    let uname = prompt(`Please provide the name of new ${type === 'dir' ? `folder` : `file`} `);
    const newCategory = {
      id: Date.now(),
      type: type,
      name: uname,
      subCategories: []
    };
    if (id === undefined) {
      setEntities((prevCategories) => createCategory(prevCategories, newCategory, 'root'));
      setCache((prevCategories) => createCategory(prevCategories, newCategory, 'root'));
    } else {
      setEntities((prevCategories) => createCategory(prevCategories, newCategory, id));
      setCache((prevCategories) => createCategory(prevCategories, newCategory, id));
    }
  };

  const deleteCategoryHandler = (id) => {
    setEntities((prev) => deleteCategory(id, prev));
    setCache((prev) => deleteCategory(id, prev));
  };

  const updateCategoryHandler = (id) => {
    let uname = prompt(`Please provide the new name`);
    setEntities((prev) => updateCategory(id, prev, uname));
    setCache((prev) => updateCategory(id, prev, uname));
  };

  const hideCategoryHandler = () => {
    setEntities((prev) => hideCategory(prev, 'file', isChecked, cache));
  };

  const checkHandler = () => {
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    hideCategoryHandler();
  }, [isChecked]);

  return (
    <div className="App">
      <div className="header">
        <button className="header-button" style={{}} onClick={() => createCategoryHandler('dir')}>
          create folder
        </button>
        <button className="header-button" onClick={() => createCategoryHandler('file')}>
          create file
        </button>
        <div>
          <label htmlFor="button"> show folders only</label>
          <input checked={isChecked} onChange={checkHandler} type="checkbox"></input>
        </div>
      </div>

      {entities.map((entry) => (
        <Entry
          key={entry.id}
          entry={entry}
          depth={1}
          createCategoryHandler={createCategoryHandler}
          deleteCategoryHandler={deleteCategoryHandler}
          updateCategoryHandler={updateCategoryHandler}
        />
      ))}
    </div>
  );
}

export default App;
