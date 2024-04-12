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
