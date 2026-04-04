# Theme System Documentation

## Overview

This locomotive telemetry dashboard supports both light and dark themes with a centralized theming system using CSS custom properties (CSS variables).

## Theme Variables

All theme-specific colors are defined in `/src/styles/theme.css` with the `--dash-*` prefix:

### Background Colors
- `--dash-bg-page`: Main page background
- `--dash-bg-surface`: Surface background (toggles, cards)
- `--dash-bg-card`: Card background
- `--dash-bg-cell`: Inner cell background (metrics, motors)
- `--dash-bg-hover`: Hover state background

### Text Colors
- `--dash-text-primary`: Primary text color
- `--dash-text-secondary`: Secondary text (labels, descriptions)
- `--dash-text-muted`: Muted text (timestamps, hints)

### Border Colors
- `--dash-border`: Default border color
- `--dash-border-light`: Light border for separators

### Accent & Interactive
- `--dash-accent`: Primary accent color (buttons, progress)
- `--dash-accent-hover`: Hover state for accent elements

### Status Colors
- `--dash-status-ok`: Success/normal state (green)
- `--dash-status-warn`: Warning state (amber/orange)
- `--dash-status-crit`: Critical/error state (red)

### Special Components
- `--dash-ai-purple-bg`: AI panel background
- `--dash-ai-purple-border`: AI panel border
- `--dash-ai-purple-text`: AI panel text

- `--dash-alert-bg`: Alert card background
- `--dash-alert-border`: Alert card border
- `--dash-alert-text`: Alert card text

- `--dash-predictive-bg`: Predictive alert background
- `--dash-predictive-border`: Predictive alert border

### Shadows
- `--dash-shadow`: Default shadow (light theme only)
- `--dash-shadow-lg`: Large shadow (light theme only)

## Usage

### In Components

Use CSS variables with inline styles:

```tsx
<div style={{ backgroundColor: 'var(--dash-bg-card)' }}>
  <span style={{ color: 'var(--dash-text-primary)' }}>Text</span>
</div>
```

### For Dynamic Colors

When using libraries like recharts that don't support CSS variables directly, use the computed value pattern:

```tsx
const [color, setColor] = useState('');

useEffect(() => {
  const computed = getComputedStyle(document.documentElement)
    .getPropertyValue('--dash-status-ok')
    .trim();
  setColor(computed);
}, []);
```

## Theme Switching

The theme is managed by `ThemeContext` in `/src/app/contexts/ThemeContext.tsx`:

```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'dark' ? 'light' : 'dark'} mode
    </button>
  );
}
```

## Persistence

The selected theme is automatically saved to `localStorage` under the key `locomotive-theme` and restored on app load.

## Transitions

Smooth transitions between themes are enabled globally in `/src/styles/index.css` with a 0.2s ease transition on background-color, border-color, and color properties.

## Light vs Dark Theme

### Light Theme
- Clean, minimal design with soft shadows
- High contrast for readability
- Background: #F7F9FC (light blue-gray)
- Cards: #FFFFFF (white)
- Borders: #E5E7EB (light gray)

### Dark Theme
- Industrial, calm appearance
- No shadows, subtle glows on active elements
- Background: #0d0f12 (very dark blue)
- Cards: #141820 (dark gray-blue)
- Borders: #2a3040 (medium gray-blue)

## Best Practices

1. **Always use CSS variables** for colors - never hardcode hex values
2. **Use semantic names** - refer to purpose (e.g., `--dash-text-primary`) not appearance (e.g., `--dash-gray-900`)
3. **Test in both themes** - ensure adequate contrast in both light and dark modes
4. **Maintain WCAG AA compliance** - minimum contrast ratio of 4.5:1 for normal text
5. **Use computed colors** for third-party libraries that don't support CSS variables
