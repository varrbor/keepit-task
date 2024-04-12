import Entry from './components/Entry/Entry';
import './App.css';
import { useState } from 'react';

export const createCategory = (categories, newCategory, parentId) => {
  if (parentId === 'root') {
    return [...categories, newCategory];
  }
  return categories.map((category) => createCategoryRecursion(category, newCategory, parentId));
};

const createCategoryRecursion = (currentCategory, newCategory, parentId) => {
  if (currentCategory.id === parentId)
    return {
      ...currentCategory,
      subCategories: [...currentCategory.subCategories, newCategory]
    };
  return {
    ...currentCategory,
    subCategories: currentCategory.subCategories.map((c) =>
      createCategoryRecursion(c, newCategory, parentId)
    )
  };
};

export const deleteCategory = (id, categories) => {
  if (categories.map((category) => category.id).includes(id)) {
    return categories.filter((category) => category.id !== id);
  }
  return categories.map((category) => deleteCategoryRecursion(category, id));
};

export const updateCategory = (id, categories, name) => {
  if (categories.map((category) => category.id).includes(id)) {
    return categories.map((category) => {
      if (category.id === id) {
        return { ...category, name };
      }
      return category;
    });
  }
  return categories.map((category) => updateCategoryRecursion(category, id, name));
};

function updateCategoryRecursion(category, id, name) {
  if (category.subCategories.map((c) => c.id).includes(id))
    return {
      ...category,
      subCategories: category.subCategories.map((category) => {
        if (category.id === id) {
          return { ...category, name };
        }
        return category;
      })
    };
  return {
    ...category,
    subCategories: category.subCategories.map((c) => updateCategoryRecursion(c, id, name))
  };
}

function deleteCategoryRecursion(tree, id) {
  if (tree.subCategories.map((c) => c.id).includes(id))
    return {
      ...tree,
      subCategories: tree.subCategories.filter((c) => c.id !== id)
    };
  return {
    ...tree,
    subCategories: tree.subCategories.map((c) => deleteCategoryRecursion(c, id))
  };
}

function App() {
  const [entities, setEntities] = useState([]);

  const createCategoryHandler = (type, id) => {
    console.log(id);
    var uname = prompt(`Please provide the name of new ${type === 'dir' ? `folder` : `file`} `);
    const newCategory = {
      id: Date.now(),
      type: type,
      name: uname,
      subCategories: []
    };
    if (id === undefined) {
      setEntities((prevCategories) => createCategory(prevCategories, newCategory, 'root'));
    } else {
      setEntities((prevCategories) => createCategory(prevCategories, newCategory, id));
    }
  };

  const deleteCategoryHandler = (id) => {
    setEntities((prev) => deleteCategory(id, prev));
  };

  const updateCategoryHandler = (id) => {
    var uname = prompt(`Please provide the new name`);
    setEntities((prev) => updateCategory(id, prev, uname));
    // setUpdateInputVisiblity(false);
  };

  return (
    <div className="App">
      <div className="header">
        <button className="header-button" style={{}} onClick={() => createCategoryHandler('dir')}>
          create folder
        </button>
        <button className="header-button" onClick={() => createCategoryHandler('file')}>
          create file
        </button>
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
