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

export const hideCategory = (categories, type, isChecked, cache) => {
  if (isChecked) {
    return categories
      .filter((category) => category.type !== type)
      .map((category) => hideCategoryRecursion(category, type));
  } else {
    return cache.map((category) => updateStateRecursion(category));
  }
};

export const filterCategory = (categories, startDate) => {
  if (!startDate) return;

  return categories
    .filter((category) => category.id < startDate)
    .map((category) => filterRecursion(category, startDate));
};

function filterRecursion(tree, date) {
  if (!tree) return;
  return {
    ...tree,
    subCategories: tree.subCategories
      .filter((category) => category.id < date)
      .map((c) => updateStateRecursion(c))
  };
}

function hideCategoryRecursion(tree, type) {
  if (!tree) return;
  return {
    ...tree,
    subCategories: tree.subCategories
      .filter((category) => category.type !== type)
      .map((c) => hideCategoryRecursion(c, type))
  };
}

function updateStateRecursion(tree) {
  if (!tree) return;
  return {
    ...tree,
    subCategories: tree.subCategories.map((c) => updateStateRecursion(c))
  };
}
