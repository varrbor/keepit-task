export const addEntry = (entries, newEntry, parentId) => {
  if (parentId === 'root') {
    return [...entries, newEntry];
  }
  return entries.map((entry) => addEntryRecursive(entry, newEntry, parentId));
};

const addEntryRecursive = (entry, newEntry, parentId) => {
  if (entry.id === parentId)
    return {
      ...entry,
      subCategories: [...entry.subCategories, newEntry]
    };
  return {
    ...entry,
    subCategories: entry.subCategories.map((e) => addEntryRecursive(e, newEntry, parentId))
  };
};

export const removeEntry = (id, entries) => {
  if (entries.map((entry) => entry.id).includes(id)) {
    return entries.filter((entry) => entry.id !== id);
  }
  return entries.map((entry) => removeEntryRecursive(entry, id));
};

export const renameEntry = (id, entries, name) => {
  if (entries.map((entry) => entry.id).includes(id)) {
    return entries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, name };
      }
      return entry;
    });
  }
  return entries.map((entry) => renameEntryRecursive(entry, id, name));
};

function renameEntryRecursive(entry, id, name) {
  if (entry.subCategories.map((e) => e.id).includes(id))
    return {
      ...entry,
      subCategories: entry.subCategories.map((e) => {
        if (e.id === id) {
          return { ...e, name };
        }
        return e;
      })
    };
  return {
    ...entry,
    subCategories: entry.subCategories.map((e) => renameEntryRecursive(e, id, name))
  };
}

function removeEntryRecursive(entry, id) {
  if (entry.subCategories.map((e) => e.id).includes(id))
    return {
      ...entry,
      subCategories: entry.subCategories.filter((e) => e.id !== id)
    };
  return {
    ...entry,
    subCategories: entry.subCategories.map((e) => removeEntryRecursive(e, id))
  };
}

export const applyFileVisibility = (entries, type, showFoldersOnly, allItems) => {
  if (showFoldersOnly) {
    return entries
      .filter((entry) => entry.type !== type)
      .map((entry) => applyFileVisibilityRecursive(entry, type));
  } else {
    return allItems.map((entry) => cloneRecursive(entry));
  }
};

export const applyDateFilter = (entries, filterDate) => {
  if (!filterDate) return;

  return entries
    .filter((entry) => entry.id < filterDate)
    .map((entry) => applyDateFilterRecursive(entry, filterDate));
};

function applyDateFilterRecursive(entry, date) {
  if (!entry) return;
  return {
    ...entry,
    subCategories: entry.subCategories
      .filter((e) => e.id < date)
      .map((e) => cloneRecursive(e))
  };
}

function applyFileVisibilityRecursive(entry, type) {
  if (!entry) return;
  return {
    ...entry,
    subCategories: entry.subCategories
      .filter((e) => e.type !== type)
      .map((e) => applyFileVisibilityRecursive(e, type))
  };
}

function cloneRecursive(entry) {
  if (!entry) return;
  return {
    ...entry,
    subCategories: entry.subCategories.map((e) => cloneRecursive(e))
  };
}
