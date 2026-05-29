import { test, expect, Page } from '@playwright/test';

// ── Helpers ────────────────────────────────────────────────

async function clearStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.tree-card');
}

async function createItem(page: Page, type: 'folder' | 'file', name: string) {
  const btn = type === 'folder' ? '.btn-primary' : '.btn:not(.btn-primary)';
  await page.click(btn);
  await page.waitForSelector('.inline-input');
  await page.fill('.inline-input', name);
  await page.keyboard.press('Enter');
  await page.waitForSelector(`.entry-name:text("${name}")`);
}

async function hoverEntry(page: Page, name: string) {
  await page.hover(`.entry-row:has(.entry-name:text("${name}"))`);
}

async function clickAction(page: Page, name: string, action: string) {
  await hoverEntry(page, name);
  await page.click(`.entry-row:has(.entry-name:text("${name}")) .entry-btn:text("${action}")`);
}

async function deleteItem(page: Page, name: string) {
  await clickAction(page, name, 'delete');
  await page.click(`.entry-row:has(.entry-confirm-label) .entry-btn:text("yes")`);
}

// ── Tests ──────────────────────────────────────────────────

test.describe('Empty state', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('shows empty placeholder when no items exist', async ({ page }) => {
    await expect(page.locator('.tree-empty')).toBeVisible();
    await expect(page.locator('.tree-empty')).toContainText('No items yet');
  });
});

test.describe('Create', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('creates a root folder', async ({ page }) => {
    await createItem(page, 'folder', 'Documents');
    await expect(page.locator('.entry-name:text("Documents")')).toBeVisible();
    await expect(page.locator('.tree-empty')).not.toBeVisible();
  });

  test('creates a root file', async ({ page }) => {
    await createItem(page, 'file', 'readme.txt');
    await expect(page.locator('.entry-name:text("readme.txt")')).toBeVisible();
  });

  test('creates a subfolder inside a folder', async ({ page }) => {
    await createItem(page, 'folder', 'Projects');
    await hoverEntry(page, 'Projects');
    await page.click('.entry-row:has(.entry-name:text("Projects")) .entry-btn:text("+ folder")');
    await page.waitForSelector('.inline-input');
    await page.fill('.inline-input', 'Work');
    await page.keyboard.press('Enter');
    await expect(page.locator('.entry-name:text("Work")')).toBeVisible();
  });

  test('creates a file inside a folder', async ({ page }) => {
    await createItem(page, 'folder', 'Projects');
    await hoverEntry(page, 'Projects');
    await page.click('.entry-row:has(.entry-name:text("Projects")) .entry-btn:text("+ file")');
    await page.waitForSelector('.inline-input');
    await page.fill('.inline-input', 'notes.txt');
    await page.keyboard.press('Enter');
    await expect(page.locator('.entry-name:text("notes.txt")')).toBeVisible();
  });

  test('pressing Escape does not create an item', async ({ page }) => {
    await page.click('.btn-primary');
    await page.waitForSelector('.inline-input');
    await page.keyboard.press('Escape');
    await expect(page.locator('.tree-empty')).toBeVisible();
  });
});

test.describe('Delete', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('shows confirmation before deleting', async ({ page }) => {
    await createItem(page, 'file', 'temp.txt');
    await clickAction(page, 'temp.txt', 'delete');
    await expect(page.locator('.entry-confirm-label')).toBeVisible();
    await expect(page.locator('.entry-name:text("temp.txt")')).toBeVisible();
  });

  test('"no" cancels the delete', async ({ page }) => {
    await createItem(page, 'file', 'keep.txt');
    await clickAction(page, 'keep.txt', 'delete');
    await page.click(`.entry-row:has(.entry-confirm-label) .entry-btn:text("no")`);
    await expect(page.locator('.entry-name:text("keep.txt")')).toBeVisible();
    await expect(page.locator('.entry-confirm-label')).not.toBeVisible();
  });

  test('deletes a file', async ({ page }) => {
    await createItem(page, 'file', 'temp.txt');
    await deleteItem(page, 'temp.txt');
    await expect(page.locator('.entry-name:text("temp.txt")')).not.toBeVisible();
    await expect(page.locator('.tree-empty')).toBeVisible();
  });

  test('deletes a folder and all its children', async ({ page }) => {
    await createItem(page, 'folder', 'ToDelete');
    await hoverEntry(page, 'ToDelete');
    await page.click('.entry-row:has(.entry-name:text("ToDelete")) .entry-btn:text("+ file")');
    await page.waitForSelector('.inline-input');
    await page.fill('.inline-input', 'child.txt');
    await page.keyboard.press('Enter');
    await expect(page.locator('.entry-name:text("child.txt")')).toBeVisible();
    await deleteItem(page, 'ToDelete');
    await expect(page.locator('.entry-name:text("ToDelete")')).not.toBeVisible();
    await expect(page.locator('.entry-name:text("child.txt")')).not.toBeVisible();
    await expect(page.locator('.tree-empty')).toBeVisible();
  });
});

test.describe('Rename', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('renames a file', async ({ page }) => {
    await createItem(page, 'file', 'old.txt');
    await clickAction(page, 'old.txt', 'rename');
    await page.waitForSelector('.inline-input');
    await page.fill('.inline-input', 'new.txt');
    await page.keyboard.press('Enter');
    await expect(page.locator('.entry-name:text("new.txt")')).toBeVisible();
    await expect(page.locator('.entry-name:text("old.txt")')).not.toBeVisible();
  });

  test('renames a folder', async ({ page }) => {
    await createItem(page, 'folder', 'OldName');
    await clickAction(page, 'OldName', 'rename');
    await page.waitForSelector('.inline-input');
    await page.fill('.inline-input', 'NewName');
    await page.keyboard.press('Enter');
    await expect(page.locator('.entry-name:text("NewName")')).toBeVisible();
    await expect(page.locator('.entry-name:text("OldName")')).not.toBeVisible();
  });
});

test.describe('Expand / Collapse', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('expands a folder to show children', async ({ page }) => {
    await createItem(page, 'folder', 'MyFolder');
    await hoverEntry(page, 'MyFolder');
    await page.click('.entry-row:has(.entry-name:text("MyFolder")) .entry-btn:text("+ file")');
    await page.waitForSelector('.inline-input');
    await page.fill('.inline-input', 'inside.txt');
    await page.keyboard.press('Enter');
    await expect(page.locator('.entry-name:text("inside.txt")')).toBeVisible();
  });

  test('collapses a folder to hide children', async ({ page }) => {
    await createItem(page, 'folder', 'MyFolder');
    await hoverEntry(page, 'MyFolder');
    await page.click('.entry-row:has(.entry-name:text("MyFolder")) .entry-btn:text("+ file")');
    await page.waitForSelector('.inline-input');
    await page.fill('.inline-input', 'hidden.txt');
    await page.keyboard.press('Enter');
    await expect(page.locator('.entry-name:text("hidden.txt")')).toBeVisible();
    await page.click('.entry-chevron.open');
    await expect(page.locator('.entry-name:text("hidden.txt")')).not.toBeVisible();
  });
});

test.describe('Folders-only filter', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('hides files when "show folders only" is checked', async ({ page }) => {
    await createItem(page, 'folder', 'Docs');
    await createItem(page, 'file', 'readme.txt');
    await page.check('.filter-checkbox input[type="checkbox"]');
    await expect(page.locator('.entry-name:text("Docs")')).toBeVisible();
    await expect(page.locator('.entry-name:text("readme.txt")')).not.toBeVisible();
  });

  test('restores files when unchecked', async ({ page }) => {
    await createItem(page, 'folder', 'Docs');
    await createItem(page, 'file', 'readme.txt');
    await page.check('.filter-checkbox input[type="checkbox"]');
    await page.uncheck('.filter-checkbox input[type="checkbox"]');
    await expect(page.locator('.entry-name:text("readme.txt")')).toBeVisible();
  });
});

test.describe('Search filter', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('filters entries by name', async ({ page }) => {
    await createItem(page, 'folder', 'Alpha');
    await createItem(page, 'folder', 'Beta');
    await page.fill('.search-input', 'Alpha');
    await expect(page.locator('.entry-name:text("Alpha")')).toBeVisible();
    await expect(page.locator('.entry-name:text("Beta")')).not.toBeVisible();
  });

  test('clearing search restores all entries', async ({ page }) => {
    await createItem(page, 'folder', 'Alpha');
    await createItem(page, 'folder', 'Beta');
    await page.fill('.search-input', 'Alpha');
    await page.fill('.search-input', '');
    await expect(page.locator('.entry-name:text("Alpha")')).toBeVisible();
    await expect(page.locator('.entry-name:text("Beta")')).toBeVisible();
  });
});

test.describe('Filter composition', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('search and folders-only both apply simultaneously', async ({ page }) => {
    await createItem(page, 'folder', 'Alpha');
    await createItem(page, 'folder', 'Beta');
    await createItem(page, 'file', 'readme.txt');

    // enable folders-only — readme hidden
    await page.check('.filter-checkbox input[type="checkbox"]');
    await expect(page.locator('.entry-name:text("readme.txt")')).not.toBeVisible();

    // also search "Alpha" — Beta now hidden too, readme still hidden
    await page.fill('.search-input', 'Alpha');
    await expect(page.locator('.entry-name:text("Alpha")')).toBeVisible();
    await expect(page.locator('.entry-name:text("Beta")')).not.toBeVisible();
    await expect(page.locator('.entry-name:text("readme.txt")')).not.toBeVisible();

    // disable folders-only — readme still hidden by search, Beta still hidden
    await page.uncheck('.filter-checkbox input[type="checkbox"]');
    await expect(page.locator('.entry-name:text("Alpha")')).toBeVisible();
    await expect(page.locator('.entry-name:text("Beta")')).not.toBeVisible();
    await expect(page.locator('.entry-name:text("readme.txt")')).not.toBeVisible();

    // clear search — all three visible
    await page.fill('.search-input', '');
    await expect(page.locator('.entry-name:text("Alpha")')).toBeVisible();
    await expect(page.locator('.entry-name:text("Beta")')).toBeVisible();
    await expect(page.locator('.entry-name:text("readme.txt")')).toBeVisible();
  });
});

test.describe('localStorage persistence', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('persists the tree across page reloads', async ({ page }) => {
    await createItem(page, 'folder', 'Persistent');
    await createItem(page, 'file', 'data.txt');
    await page.reload();
    await page.waitForSelector('.tree-card');
    await expect(page.locator('.entry-name:text("Persistent")')).toBeVisible();
    await expect(page.locator('.entry-name:text("data.txt")')).toBeVisible();
  });

  test('persists the folders-only toggle across reloads', async ({ page }) => {
    await createItem(page, 'file', 'temp.txt');
    await page.check('.filter-checkbox input[type="checkbox"]');
    await page.reload();
    await page.waitForSelector('.tree-card');
    await expect(page.locator('.filter-checkbox input[type="checkbox"]')).toBeChecked();
  });
});

test.describe('Header actions', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('action buttons are visible on hover and hidden otherwise', async ({ page }) => {
    await createItem(page, 'file', 'test.txt');
    await expect(
      page.locator('.entry-row:has(.entry-name:text("test.txt")) .entry-actions')
    ).toHaveCSS('opacity', '0');
    await hoverEntry(page, 'test.txt');
    await expect(
      page.locator('.entry-row:has(.entry-name:text("test.txt")) .entry-actions')
    ).toHaveCSS('opacity', '1');
  });
});
