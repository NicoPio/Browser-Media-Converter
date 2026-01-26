import { test, expect } from '@playwright/test';

test.describe('Media Converter App', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should display the app title', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Media Converter');
	});

	test('should show privacy message', async ({ page }) => {
		await expect(page.getByText(/100% private/i)).toBeVisible();
	});

	test('should display file drop zone when no file is selected', async ({ page }) => {
		const dropZone = page.locator('[role="button"]').filter({ hasText: /drop/i });
		await expect(dropZone).toBeVisible();
		await expect(page.getByText('MP4, MOV, WebM, MKV, WAV, MP3, Ogg, FLAC')).toBeVisible();
	});
});

test.describe('File Upload', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should accept file via file input', async ({ page }) => {
		const fileInput = page.locator('input[type="file"]');

		await fileInput.setInputFiles({
			name: 'test-video.mp4',
			mimeType: 'video/mp4',
			buffer: Buffer.alloc(1024),
		});

		await expect(page.getByText('test-video.mp4')).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Format Selection', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles({
			name: 'test-video.mp4',
			mimeType: 'video/mp4',
			buffer: Buffer.alloc(1024),
		});

		await page.waitForSelector('text=test-video.mp4', { timeout: 10000 });
	});

	test('should display format selector after file upload', async ({ page }) => {
		const selector = page.locator('select').or(page.locator('[class*="format"]'));
		await expect(selector.first()).toBeVisible();
	});

	test('should show convert button', async ({ page }) => {
		const convertButton = page.locator('button').filter({ hasText: /convert/i });
		await expect(convertButton).toBeVisible();
	});
});

test.describe('Responsive Design', () => {
	test('should work on mobile viewport', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expect(page.locator('h1')).toContainText('Media Converter');
		const dropZone = page.locator('[role="button"]').filter({ hasText: /drop/i });
		await expect(dropZone).toBeVisible();
	});

	test('should work on tablet viewport', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await expect(page.locator('h1')).toContainText('Media Converter');
	});
});

test.describe('Theme', () => {
	test('should have default theme applied', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const html = page.locator('html');
		const dataTheme = await html.getAttribute('data-theme');
		expect(dataTheme).toBeTruthy();
	});
});

test.describe('Accessibility', () => {
	test('should have proper ARIA attributes on drop zone', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const dropZone = page.locator('[role="button"]').filter({ hasText: /drop/i });
		await expect(dropZone).toHaveAttribute('aria-label');
	});

	test('should be keyboard navigable', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		await page.keyboard.press('Tab');
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();
	});
});

test.describe('Error Handling', () => {
	test('should show error for empty file', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles({
			name: 'empty.mp4',
			mimeType: 'video/mp4',
			buffer: Buffer.alloc(0),
		});

		await expect(page.getByText(/empty|0 bytes/i)).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Reset Functionality', () => {
	test('should clear file on reset', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles({
			name: 'test-video.mp4',
			mimeType: 'video/mp4',
			buffer: Buffer.alloc(1024),
		});

		await page.waitForSelector('text=test-video.mp4', { timeout: 10000 });

		const clearButton = page.locator('button[aria-label="Clear"]').or(
			page.locator('button').filter({ hasText: /clear/i })
		);

		if (await clearButton.isVisible()) {
			await clearButton.click();
			const dropZone = page.locator('[role="button"]').filter({ hasText: /drop/i });
			await expect(dropZone).toBeVisible({ timeout: 5000 });
		}
	});
});
