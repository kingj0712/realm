import { test, expect, type Page } from '@playwright/test';

// Realm renders inside an open Shadow DOM under <realm-panel>. Playwright's
// default CSS engine pierces open shadow roots, so locator() calls work as
// usual; we only need the helper below to wait for the panel itself to mount.
async function gotoFresh(page: Page, hash = '#/') {
  await page.addInitScript(() => {
    try { window.localStorage.clear(); } catch {}
  });
  await page.goto(`/${hash}`);
  // The panel custom element is upgraded as soon as the module evaluates.
  // Wait for its shadow root to host the REALM brand text before continuing.
  await expect(page.locator('text=REALM').first()).toBeVisible();
}

test.describe('Realm dashboard — smoke', () => {
  test('renders the app shell with Overview and Components nav links', async ({ page }) => {
    await gotoFresh(page);
    // Header chrome
    await expect(page.locator('.shell__mark')).toHaveText(/REALM/);
    await expect(page.locator('.shell__nav-link', { hasText: 'Overview' })).toBeVisible();
    await expect(page.locator('.shell__nav-link', { hasText: 'Components' })).toBeVisible();
  });

  test('fresh install shows Welcome and Showcase tabs', async ({ page }) => {
    await gotoFresh(page);
    const tabs = page.locator('.tab-bar__tab');
    await expect(tabs).toHaveCount(2);
    await expect(page.locator('.tab-bar__label', { hasText: 'Welcome' })).toBeVisible();
    await expect(page.locator('.tab-bar__label', { hasText: 'Showcase' })).toBeVisible();
  });

  test('Components route renders the static tile catalog', async ({ page }) => {
    await gotoFresh(page);
    await page.locator('.shell__nav-link', { hasText: 'Components' }).click();
    // The components page lists tile sections with headings; just confirm
    // we're no longer on Overview by checking the active nav link.
    await expect(page.locator('.shell__nav-link--active', { hasText: 'Components' })).toBeVisible();
  });

  test('entering edit mode shows the grouped banner with all action clusters', async ({ page }) => {
    await gotoFresh(page);
    // Pencil button. aria-label flips between edit/exit so target by class.
    await page.locator('.shell__edit-toggle').click();
    const banner = page.locator('[data-testid="edit-banner"]');
    await expect(banner).toBeVisible();
    // Each cluster is present
    await expect(banner.locator('.edit-banner__group-label', { hasText: 'ADD' })).toBeVisible();
    await expect(banner.locator('.edit-banner__group-label', { hasText: 'CONFIGURE' })).toBeVisible();
    await expect(banner.locator('.edit-banner__group-label', { hasText: 'BACKUP' })).toBeVisible();
    await expect(banner.locator('.edit-banner__group-label', { hasText: 'DANGER' })).toBeVisible();
    // Done button distinct
    await expect(page.locator('[data-testid="edit-done"]')).toBeVisible();
  });

  test('keyboard E toggles edit mode', async ({ page }) => {
    await gotoFresh(page);
    await page.keyboard.press('e');
    await expect(page.locator('[data-testid="edit-banner"]')).toBeVisible();
    await page.keyboard.press('e');
    await expect(page.locator('[data-testid="edit-banner"]')).toHaveCount(0);
  });

  test('Palette modal opens and closes', async ({ page }) => {
    await gotoFresh(page);
    await page.locator('.shell__edit-toggle').click();
    await page.locator('[data-testid="edit-add-tile"]').click();
    const palette = page.locator('.palette');
    await expect(palette).toBeVisible();
    await expect(palette.locator('.palette__title')).toHaveText(/Add Tile/);
    // Backdrop click closes
    await page.locator('.palette-backdrop').click({ position: { x: 5, y: 5 } });
    await expect(palette).toHaveCount(0);
  });

  test('Templates modal opens and lists Showcase', async ({ page }) => {
    await gotoFresh(page);
    await page.locator('.shell__edit-toggle').click();
    await page.locator('[data-testid="edit-templates"]').click();
    await expect(page.locator('.tile-modal__title', { hasText: 'TEMPLATES' })).toBeVisible();
    await expect(page.locator('.sample-browser__name', { hasText: 'Showcase' })).toBeVisible();
    await page.locator('.tile-modal__close').click();
    await expect(page.locator('.tile-modal__title', { hasText: 'TEMPLATES' })).toHaveCount(0);
  });

  test('Snapshots modal opens', async ({ page }) => {
    await gotoFresh(page);
    await page.locator('.shell__edit-toggle').click();
    await page.locator('[data-testid="edit-snapshots"]').click();
    await expect(page.locator('.tile-modal__title', { hasText: 'Layout Snapshots' })).toBeVisible();
  });

  test('Remap modal opens', async ({ page }) => {
    await gotoFresh(page);
    await page.locator('.shell__edit-toggle').click();
    await page.locator('[data-testid="edit-remap"]').click();
    await expect(page.locator('.tile-modal__title', { hasText: 'Remap Entities' })).toBeVisible();
  });

  test('Build from HA modal opens', async ({ page }) => {
    await gotoFresh(page);
    await page.locator('.shell__edit-toggle').click();
    await page.locator('[data-testid="edit-build-from-ha"]').click();
    await expect(page.locator('.tile-modal__title', { hasText: 'Build from my HA' })).toBeVisible();
  });

  test('clicking the Showcase tab swaps content and shows Showcase tiles', async ({ page }) => {
    await gotoFresh(page);
    await page.locator('.tab-bar__label', { hasText: 'Showcase' }).click();
    // Showcase has a HeaderTile with "ENVIRONMENT" as the first section
    await expect(page.locator('text=ENVIRONMENT').first()).toBeVisible();
  });

  test('no top-level page error and Overview rendered', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (e) => consoleErrors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await gotoFresh(page);
    await expect(page.locator('.overview')).toBeVisible();
    // Filter known dev-only noise (Vite HMR, font CSP, etc.) — we only fail
    // on actual React/runtime errors.
    const real = consoleErrors.filter((e) =>
      !/preload|font|hmr|vite|google|favicon|net::err_|cors|sourcemap/i.test(e),
    );
    expect(real, real.join('\n')).toEqual([]);
  });
});
