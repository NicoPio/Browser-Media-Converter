# DaisyUI 5+ Theme Switching and Dark Mode Implementation Guide

## Overview

DaisyUI 5.5.14 provides a comprehensive theming system with 37 built-in themes. The library uses CSS variables and the `data-theme` HTML attribute for dynamic theme switching without page reloads.

**Key Version**: DaisyUI 5.5.14 (current in project)
**Tailwind CSS**: v4.1.7 with vite plugin
**CSS Format**: Native CSS with @import and @plugin directives

---

## 1. How Theme Switching Works

### Core Mechanism

DaisyUI watches for the `data-theme` attribute on any HTML element:

```html
<!-- Set theme on HTML root -->
<html data-theme="dark">

<!-- Or on any container element -->
<div data-theme="cupcake">
  <!-- Everything inside has cupcake theme -->
</div>
```

**CSS-Only Switching**: Theme switching happens entirely through CSS - no JavaScript required for basic switching, though localStorage persistence needs JS.

---

## 2. Built-in Themes (37 Total)

### Light & Dark Variants
- **light** - Clean, bright default
- **dark** - Inverse of light

### Vibrant Themes
- cupcake, bumblebee, emerald, corporate, synthwave, retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe

### Bold Themes
- black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter, dim

### Modern Themes
- nord, sunset, caramellatte (NEW in v5), abyss (NEW in v5), silk (NEW in v5)

All themes use updated colors with improved contrast in DaisyUI 5.

---

## 3. Configuration in CSS

### Current Project Setup

The project uses modern Tailwind CSS 4 with native CSS:

```css
/* src/index.css */
@import "tailwindcss";
@plugin "daisyui";

@theme {
  /* Custom color palette (OKLCH format) */
  --color-primary: oklch(0.65 0.25 240);
  --color-secondary: oklch(0.70 0.20 280);
  --color-accent: oklch(0.75 0.22 160);
  --color-success: oklch(0.70 0.18 142);
  --color-warning: oklch(0.80 0.15 80);
  --color-error: oklch(0.65 0.25 25);
}

@plugin "daisyui";
```

### Enable Specific Themes with Flags

Add theme configuration directly in CSS:

```css
@import "tailwindcss";

@plugin "daisyui" {
  themes: light --default, dark --prefersdark, cupcake, fantasy, night;
}

@theme {
  /* Custom colors */
}
```

**Available Flags**:
- `--default`: Makes this theme active by default on page load
- `--prefersdark`: Sets as default when user's OS is in dark mode (respects `prefers-color-scheme: dark`)

### Enable All Built-in Themes

```css
@plugin "daisyui" {
  themes: all;
}
```

Or disable themes entirely:
```css
@plugin "daisyui" {
  themes: false;
}
```

---

## 4. Theme Switching with JavaScript

### Basic Theme Switching

```javascript
// Set theme immediately
document.documentElement.setAttribute('data-theme', 'dark');

// Get current theme
const currentTheme = document.documentElement.getAttribute('data-theme');

// Remove theme (falls back to default)
document.documentElement.removeAttribute('data-theme');
```

### Persist Theme Choice with localStorage

```javascript
// Save user's theme preference
function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('theme-preference', themeName);
}

// Apply saved theme on page load
function initTheme() {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

// Run on app initialization
initTheme();
```

### Detect System Preference (Light/Dark)

```javascript
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function initThemeWithFallback() {
  const savedTheme = localStorage.getItem('theme-preference');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // Fallback to system preference (if configured with --prefersdark)
    const systemTheme = getSystemTheme();
    document.documentElement.setAttribute('data-theme', systemTheme);
  }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // Only apply if no user preference saved
  if (!localStorage.getItem('theme-preference')) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
  }
});
```

---

## 5. DaisyUI Theme Controller Component

### CSS-Only Implementation (Recommended for Simple Cases)

DaisyUI provides the `theme-controller` class that automatically handles theme switching:

#### Checkbox Toggle

```html
<label class="flex cursor-pointer gap-2">
  <span class="label-text">Light</span>
  <input
    type="checkbox"
    value="synthwave"
    class="toggle theme-controller"
  />
  <span class="label-text">Synthwave</span>
</label>
```

**How it works**:
- When the checkbox is checked, its `value` attribute becomes the active theme
- When unchecked, the theme reverts to the default
- Pure CSS - no JavaScript required

#### Radio Button Group

```html
<div class="flex gap-2">
  <label class="label cursor-pointer">
    <input
      type="radio"
      name="theme-radios"
      class="radio theme-controller"
      value="light"
      defaultChecked
    />
    <span class="label-text ml-2">Light</span>
  </label>

  <label class="label cursor-pointer">
    <input
      type="radio"
      name="theme-radios"
      class="radio theme-controller"
      value="dark"
    />
    <span class="label-text ml-2">Dark</span>
  </label>

  <label class="label cursor-pointer">
    <input
      type="radio"
      name="theme-radios"
      class="radio theme-controller"
      value="synthwave"
    />
    <span class="label-text ml-2">Synthwave</span>
  </label>
</div>
```

#### Dropdown Menu

```html
<div class="dropdown dropdown-end">
  <button class="btn btn-outline">
    Theme
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-5 w-5 stroke-current">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
    </svg>
  </button>

  <ul class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow">
    <li>
      <label class="label cursor-pointer justify-start">
        <input
          type="radio"
          name="theme-dropdown"
          class="radio theme-controller"
          value="light"
          defaultChecked
        />
        <span class="label-text">Light</span>
      </label>
    </li>
    <li>
      <label class="label cursor-pointer justify-start">
        <input
          type="radio"
          name="theme-dropdown"
          class="radio theme-controller"
          value="dark"
        />
        <span class="label-text">Dark</span>
      </label>
    </li>
    <li>
      <label class="label cursor-pointer justify-start">
        <input
          type="radio"
          name="theme-dropdown"
          class="radio theme-controller"
          value="synthwave"
        />
        <span class="label-text">Synthwave</span>
      </label>
    </li>
  </ul>
</div>
```

---

## 6. React Implementation with localStorage

### Complete Theme Provider Hook

```typescript
// hooks/useTheme.ts
import { useEffect, useState, useCallback } from 'react';

type ThemeName =
  | 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald' | 'corporate'
  | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden'
  | 'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'wireframe' | 'black'
  | 'luxury' | 'dracula' | 'cmyk' | 'autumn' | 'business' | 'acid' | 'lemonade'
  | 'night' | 'coffee' | 'winter' | 'dim' | 'nord' | 'sunset' | 'caramellatte'
  | 'abyss' | 'silk';

const DEFAULT_THEME: ThemeName = 'light';
const THEME_STORAGE_KEY = 'theme-preference';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    const initTheme = () => {
      // Try to get saved preference
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;

      if (saved) {
        setThemeState(saved);
        applyTheme(saved);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme: ThemeName = prefersDark ? 'dark' : DEFAULT_THEME;

        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }

      setIsLoading(false);
    };

    initTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === null) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply if user hasn't explicitly set a preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        const newTheme: ThemeName = e.matches ? 'dark' : DEFAULT_THEME;
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (themeName: ThemeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const setTheme = useCallback((themeName: ThemeName) => {
    setThemeState(themeName);
    applyTheme(themeName);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, []);

  const resetTheme = useCallback(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme: ThemeName = prefersDark ? 'dark' : DEFAULT_THEME;
    setThemeState(systemTheme);
    applyTheme(systemTheme);
  }, []);

  return {
    theme: theme || DEFAULT_THEME,
    setTheme,
    resetTheme,
    isLoading,
  };
}
```

### React Component: Theme Selector

```typescript
// components/ThemeSelector.tsx
import { useTheme } from '../hooks/useTheme';

const THEMES: Array<{ name: string; value: ThemeName }> = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Cupcake', value: 'cupcake' },
  { name: 'Bumblebee', value: 'bumblebee' },
  { name: 'Emerald', value: 'emerald' },
  { name: 'Corporate', value: 'corporate' },
  { name: 'Synthwave', value: 'synthwave' },
  { name: 'Retro', value: 'retro' },
  { name: 'Cyberpunk', value: 'cyberpunk' },
  { name: 'Valentine', value: 'valentine' },
  { name: 'Halloween', value: 'halloween' },
  { name: 'Garden', value: 'garden' },
  { name: 'Forest', value: 'forest' },
  { name: 'Aqua', value: 'aqua' },
  { name: 'Lofi', value: 'lofi' },
  { name: 'Pastel', value: 'pastel' },
  { name: 'Fantasy', value: 'fantasy' },
  { name: 'Wireframe', value: 'wireframe' },
  { name: 'Black', value: 'black' },
  { name: 'Luxury', value: 'luxury' },
  { name: 'Dracula', value: 'dracula' },
  { name: 'CMYK', value: 'cmyk' },
  { name: 'Autumn', value: 'autumn' },
  { name: 'Business', value: 'business' },
  { name: 'Acid', value: 'acid' },
  { name: 'Lemonade', value: 'lemonade' },
  { name: 'Night', value: 'night' },
  { name: 'Coffee', value: 'coffee' },
  { name: 'Winter', value: 'winter' },
  { name: 'Dim', value: 'dim' },
  { name: 'Nord', value: 'nord' },
  { name: 'Sunset', value: 'sunset' },
  { name: 'Caramellatte', value: 'caramellatte' },
  { name: 'Abyss', value: 'abyss' },
  { name: 'Silk', value: 'silk' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <button
        className="btn btn-outline gap-2"
        aria-label="Theme selector"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-5 w-5 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        Theme
      </button>

      <ul
        className="dropdown-content menu bg-base-100 rounded-box z-50 w-72 p-2 shadow-lg"
        role="listbox"
      >
        {THEMES.map(({ name, value }) => (
          <li key={value}>
            <button
              onClick={() => setTheme(value)}
              className={`${theme === value ? 'active' : ''}`}
              aria-selected={theme === value}
            >
              {name}
              {theme === value && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Simple Toggle Button

```typescript
// components/ThemeToggle.tsx
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark' || theme === 'night' || theme === 'dim';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="btn btn-ghost btn-circle"
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4.22 4.22a1 1 0 011.415 0l.707.707a1 1 0 01-1.415 1.415l-.707-.707a1 1 0 010-1.415zm11.313 0a1 1 0 010 1.415l-.707.707a1 1 0 01-1.415-1.415l.707-.707a1 1 0 011.415 0zM10 7a3 3 0 100 6 3 3 0 000-6zm-7 3a1 1 0 11-2 0 1 1 0 012 0zm14 0a1 1 0 11-2 0 1 1 0 012 0zm-1.22 4.78a1 1 0 011.415 0l.707.707a1 1 0 01-1.415 1.415l-.707-.707a1 1 0 010-1.415zm-11.313 0a1 1 0 010 1.415l-.707.707a1 1 0 01-1.415-1.415l.707-.707a1 1 0 011.415 0zM10 18a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}
```

---

## 7. Integration with Project's SettingsMenu

### Current Implementation

The project has a `SettingsMenu` component at `/Volumes/ExternalMac/Dev/mediabunny/src/components/SettingsMenu.tsx` that can be enhanced with theme switching.

### Enhanced SettingsMenu with Theme Support

```typescript
// components/SettingsMenu.tsx
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

interface SettingsMenuProps {
  autoCleanupAfterDownload: boolean;
  showOnboardingHints: boolean;
  onAutoCleanupChange: (enabled: boolean) => void;
  onShowHintsChange: (enabled: boolean) => void;
}

const THEMES = ['light', 'dark', 'cupcake', 'fantasy', 'night'];

export function SettingsMenu({
  autoCleanupAfterDownload,
  showOnboardingHints,
  onAutoCleanupChange,
  onShowHintsChange,
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <button
        className="btn btn-ghost btn-sm btn-circle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open settings menu"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="dropdown-content menu bg-base-100 rounded-box z-50 w-72 p-4 shadow-xl border border-base-300 mt-2"
          role="menu"
        >
          <h3 className="font-bold text-lg mb-4">Settings</h3>

          {/* Theme Selection */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Theme</span>
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeName)}
              className="select select-bordered select-sm"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="divider my-2"></div>

          {/* Auto-cleanup setting */}
          <div className="form-control mb-3">
            <label className="label cursor-pointer justify-start gap-3" htmlFor="auto-cleanup">
              <input
                id="auto-cleanup"
                type="checkbox"
                className="toggle toggle-primary"
                checked={autoCleanupAfterDownload}
                onChange={(e) => onAutoCleanupChange(e.target.checked)}
                aria-label="Auto-cleanup after download"
              />
              <div className="flex-1">
                <span className="label-text font-medium">Auto-cleanup downloads</span>
                <p className="text-xs text-base-content/60 mt-1">
                  Automatically remove completed conversions after downloading
                </p>
              </div>
            </label>
          </div>

          {/* Show hints setting */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3" htmlFor="show-hints">
              <input
                id="show-hints"
                type="checkbox"
                className="toggle toggle-primary"
                checked={showOnboardingHints}
                onChange={(e) => onShowHintsChange(e.target.checked)}
                aria-label="Show onboarding hints"
              />
              <div className="flex-1">
                <span className="label-text font-medium">Show helpful hints</span>
                <p className="text-xs text-base-content/60 mt-1">
                  Display tooltips and guidance for first-time users
                </p>
              </div>
            </label>
          </div>

          <div className="divider my-2"></div>

          <button
            className="btn btn-ghost btn-sm w-full justify-start"
            onClick={() => setIsOpen(false)}
            aria-label="Close settings menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 8. CSS Dark Mode with Tailwind's `dark:` Prefix

### Integration with DaisyUI

While DaisyUI uses the `data-theme` attribute, you can still use Tailwind's `dark:` prefix if configured:

```css
/* src/index.css */
@import "tailwindcss";

/* Map DaisyUI themes to Tailwind dark: prefix */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dim], [data-theme=night], [data-theme=coffee], [data-theme=dracula], [data-theme=abyss], [data-theme=black], [data-theme=nord] *));

@plugin "daisyui";
```

This allows you to use both:
```html
<!-- DaisyUI approach (recommended) -->
<div class="text-base-content">Content</div>

<!-- Tailwind dark: prefix (works if custom-variant configured) -->
<div class="text-black dark:text-white">Content</div>
```

---

## 9. Best Practices

### 1. **Initialize Theme Early**
```typescript
// App.tsx root level
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, isLoading } = useTheme();

  if (isLoading) return <LoadingSpinner />;

  return (
    // App content
  );
}
```

### 2. **Respect User Preferences**
- Check `prefers-color-scheme` as fallback
- Save user choice in localStorage
- Listen for system preference changes

### 3. **Use Semantic Colors**
```typescript
// Use DaisyUI color classes
<div className="bg-base-100 text-base-content">
  <button className="btn btn-primary">Action</button>
</div>

// NOT custom colors that don't adapt
<div className="bg-blue-500 text-white">  {/* Won't change with theme */}</div>
```

### 4. **Performance Considerations**
- Theme switching is CSS-based, no re-renders needed
- localStorage read is synchronous (minimal impact)
- Use React memo for theme-independent components

### 5. **Accessibility**
- Ensure sufficient contrast in all themes
- Test with DevTools contrast checker
- Consider `prefers-color-scheme` for auto-switching
- Provide user control via UI

### 6. **Testing Themes**
```typescript
// Test hook
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

it('should persist theme to localStorage', () => {
  const { result } = renderHook(() => useTheme());

  act(() => {
    result.current.setTheme('dark');
  });

  expect(localStorage.getItem('theme-preference')).toBe('dark');
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});
```

---

## 10. Project Files to Modify

For implementing theme switching in the browser-media-converter:

### Files to Create:
1. `/Volumes/ExternalMac/Dev/mediabunny/src/hooks/useTheme.ts` - Theme hook

### Files to Update:
1. `/Volumes/ExternalMac/Dev/mediabunny/src/components/SettingsMenu.tsx` - Add theme selector
2. `/Volumes/ExternalMac/Dev/mediabunny/src/App.tsx` - Initialize theme
3. `/Volumes/ExternalMac/Dev/mediabunny/src/main.tsx` - Wrap with theme initialization

### Optional Files:
1. `/Volumes/ExternalMac/Dev/mediabunny/src/components/ThemeSelector.tsx` - Standalone theme selector
2. `/Volumes/ExternalMac/Dev/mediabunny/src/components/ThemeToggle.tsx` - Simple toggle button

---

## 11. Configuration Reference

### DaisyUI 5.5.14 CSS Variables

All themes use consistent CSS variable names:

```css
/* Colors (OKLCH format) */
--color-primary
--color-primary-content
--color-secondary
--color-secondary-content
--color-accent
--color-accent-content
--color-neutral
--color-neutral-content
--color-base-100
--color-base-200
--color-base-300
--color-base-content
--color-success
--color-warning
--color-error
--color-info

/* Effects (new in v5) */
--depth: 1
--noise: 0
--rounded-box: 1rem
--rounded-btn: 0.5rem
```

---

## 12. Useful Links

- **Official Docs**: https://daisyui.com/docs/themes/
- **Theme Controller**: https://daisyui.com/components/theme-controller/
- **Config Reference**: https://daisyui.com/docs/config/
- **DaisyUI v5 Release**: https://daisyui.com/docs/v5/
- **Theme Generator**: https://daisyui.com/theme-generator/
- **GitHub Discussions**: https://github.com/saadeghi/daisyui/discussions

---

## Summary

**Key Takeaways**:
1. **Mechanism**: DaisyUI uses `data-theme` HTML attribute (not CSS class)
2. **37 Themes Available**: Light/dark + 35 unique themes
3. **No Extra Setup**: Works out of the box with Tailwind 4 + DaisyUI
4. **localStorage Persistence**: Simple JavaScript needed for user preference
5. **React Integration**: Custom hook pattern recommended for state management
6. **Performance**: CSS-based switching, zero JS overhead for theme changes
7. **Best Practice**: Respect `prefers-color-scheme` with user override option

The project is already configured correctly. Just add a `useTheme` hook and update `SettingsMenu` component to enable full theme switching functionality.
