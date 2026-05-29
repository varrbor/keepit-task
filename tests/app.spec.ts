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
  page.once('dialog', (d) => d.accept(name));
  await page.click(btn);
  await page.waitForSelector(`.entry-name:text("${name}")`);
}

async function hoverEntry(page: Page, name: string) {
  await page.hover(`.entry-row:has(.entry-name:text("${name}"))`);
}

async function clickAction(page: Page, name: string, action: string) {
  await hoverEntry(page, name);
  await page.click(`.entry-row:has(.entry-name:text("${name}")) .entry-btn:text("${action}")`);
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
    await page.click('.entry-chevron');
    page.once('dialog', (d) => d.accept('Work'));
    await hoverEntry(page, 'Projects');
    await page.click('.entry-row:has(.entry-name:text("Projects")) .entry-btn:text("+ folder")');
    await expect(page.locator('.entry-name:text("Work")')).toBeVisible();
  });

  test('creates a file inside a folder', async ({ page }) => {
    await createItem(page, 'folder', 'Projects');
    await page.click('.entry-chevron');
    page.once('dialog', (d) => d.accept('notes.txt'));
    await hoverEntry(page, 'Projects');
    await page.click('.entry-row:has(.entry-name:text("Projects")) .entry-btn:text("+ file")');
    await expect(page.locator('.entry-name:text("notes.txt")')).toBeVisible();
  });

  test('cancelling the prompt does not create an item', async ({ page }) => {
    page.once('dialog', (d) => d.dismiss());
    await page.click('.btn-primary');
    await page.waitForTimeout(300);
    await expect(page.locator('.tree-empty')).toBeVisible();
  });
});

test.describe('Delete', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('deletes a file', async ({ page }) => {
    await createItem(page, 'file', 'temp.txt');
    await clickAction(page, 'temp.txt', 'delete');
    await expect(page.locator('.entry-name:text("temp.txt")')).not.toBeVisible();
    await expect(page.locator('.tree-empty')).toBeVisible();
  });

  test('deletes a folder and all its children', async ({ page }) => {
    await createItem(page, 'folder', 'ToDelete');
    // expand and add a child
    await page.click('.entry-chevron');
    page.once('dialog', (d) => d.accept('child.txt'));
    await hoverEntry(page, 'ToDelete');
    await page.click('.entry-row:has(.entry-name:text("ToDelete")) .entry-btn:text("+ file")');
    await expect(page.locator('.entry-name:text("child.txt")')).toBeVisible();
    // delete parent
    await clickAction(page, 'ToDelete', 'delete');
    await expect(page.locator('.entry-name:text("ToDelete")')).not.toBeVisible();
    await expect(page.locator('.entry-name:text("child.txt")')).not.toBeVisible();
    await expect(page.locator('.tree-empty')).toBeVisible();
  });
});

test.describe('Rename', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('renames a file', async ({ page }) => {
    await createItem(page, 'file', 'old.txt');
    page.once('dialog', (d) => d.accept('new.txt'));
    await clickAction(page, 'old.txt', 'rename');
    await expect(page.locator('.entry-name:text("new.txt")')).toBeVisible();
    await expect(page.locator('.entry-name:text("old.txt")')).not.toBeVisible();
  });

  test('renames a folder', async ({ page }) => {
    await createItem(page, 'folder', 'OldName');
    page.once('dialog', (d) => d.accept('NewName'));
    await clickAction(page, 'OldName', 'rename');
    await expect(page.locator('.entry-name:text("NewName")')).toBeVisible();
    await expect(page.locator('.entry-name:text("OldName")')).not.toBeVisible();
  });
});

test.describe('Expand / Collapse', () => {
  test.beforeEach(({ page }) => clearStorage(page));

  test('expands a folder to show children', async ({ page }) => {
    await createItem(page, 'folder', 'MyFolder');
    // add child before expanding via hover action
    await page.click('.entry-chevron');
    page.once('dialog', (d) => d.accept('inside.txt'));
    await hoverEntry(page, 'MyFolder');
    await page.click('.entry-row:has(.entry-name:text("MyFolder")) .entry-btn:text("+ file")');
    await expect(page.locator('.entry-name:text("inside.txt")')).toBeVisible();
  });

  test('collapses a folder to hide children', async ({ page }) => {
    await createItem(page, 'folder', 'MyFolder');
    await page.click('.entry-chevron');
    page.once('dialog', (d) => d.accept('hidden.txt'));
    await hoverEntry(page, 'MyFolder');
    await page.click('.entry-row:has(.entry-name:text("MyFolder")) .entry-btn:text("+ file")');
    // collapse
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
    // actions hidden by default
    await expect(
      page.locator('.entry-row:has(.entry-name:text("test.txt")) .entry-actions')
    ).toHaveCSS('opacity', '0');
    // visible on hover
    await hoverEntry(page, 'test.txt');
    await expect(
      page.locator('.entry-row:has(.entry-name:text("test.txt")) .entry-actions')
    ).toHaveCSS('opacity', '1');
  });
});
