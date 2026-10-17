# RubiVision design tokens and UI primitives

**Visual redesign update:** The original Prompt 4 values and contrast table in this document record the first palette and are superseded by the reference-led RubiVision redesign. The active colors are `#0c0e12` / `#14171c` / `#1a1d23` and violet `#b5a8ff` in dark mode, and `#f5f6f8` / white surfaces with violet `#604bd8` in light mode. The semantic token names, theme provider, and primitive contracts remain unchanged.

Prompt 4 establishes a semantic CSS token layer and reusable, accessible React primitives. It contains no feature screens, data services, storage, authentication, or persistence. Supabase PostgreSQL remains the only planned persistent application database; this UI foundation introduces no database code.

## Theme and tokens

`apps/web/src/shared/styles/tokens.css` defines semantic colors for background, surfaces, text, borders, accent, focus, and status tones. It also defines spacing, radii, elevation, font sizes, line heights, content width, and named breakpoint values. Use semantic color names in components instead of assigning palette colors directly.

The default theme follows `prefers-color-scheme`. Set `data-theme="light"` or `data-theme="dark"` on the document root to select an explicit palette; `data-theme="system"` returns to system selection. The theme control and preference service boundary are described in [theme and localization](theme-and-localization.md). Preferences do not persist when a cloud preference adapter is unavailable.

Breakpoint custom properties are documented for design reference, but CSS custom properties cannot be used in media query conditions. The responsive rules in `styles.css` use literal values that mirror the `--breakpoint-*` tokens; update both together if a breakpoint changes.

## Primitive usage

Import components from `src/shared/components/primitives`:

```tsx
import { Button, Card, Field, PageContainer, Select } from './shared/components/primitives';

<PageContainer>
  <Card>
    <Field id="session-name" label="Session name" value={name} onChange={onNameChange} />
    <Select label="Puzzle" value={puzzle} onChange={onPuzzleChange}>
      <option value="333">3×3×3</option>
    </Select>
    <Button type="submit">Save</Button>
  </Card>
</PageContainer>
```

- `Button` defaults to `type="button"` and supports primary, secondary, quiet, and danger variants. Disabled behavior stays native.
- `IconButton` requires an explicit `aria-label`.
- `Card` is a labeled-capable section. `PageContainer` is the page-level `main` landmark; render it once per page.
- `Field` renders a labeled input and associates optional hint/error text. `Input` is also available standalone for custom compositions.
- `Select` renders a native select with a visible label and optional error.
- `Dialog` is controlled with `open` and `onClose`, uses the native modal dialog, closes on Escape, and returns focus to the previously active element.
- `Badge` communicates a text status with a semantic tone. `Spinner` announces loading, while `Skeleton` is hidden from assistive technology.
- `EmptyState` and `ErrorState` display content states; error state uses `role="alert"`.

All controls use visible keyboard focus styles, native keyboard behavior, and token-based disabled/hover/pressed states. Motion is reduced when the user requests reduced motion. Forced-colors mode retains system foreground, background, border, and focus indicators.

## Contrast review

The selected foreground/background pairs were checked using the WCAG sRGB contrast calculation against WCAG 2.2 AA's 4.5:1 threshold for normal text:

| Pair | Ratio |
|---|---:|
| Light body `#172033` on `#f5f6f8` | 15.04:1 |
| Light muted `#475569` on `#ffffff` | 7.58:1 |
| Light accent text `#ffffff` on `#604bd8` | 6.01:1 |
| Light success `#17633c` on `#ffffff` | 7.28:1 |
| Light warning `#744210` on `#ffffff` | 8.30:1 |
| Light danger `#a12222` on `#ffffff` | 7.59:1 |
| Dark body `#f0f0f4` on `#14171c` | 15.80:1 |
| Dark muted `#b0b1bc` on `#14171c` | 8.43:1 |
| Dark accent `#b5a8ff` on `#14171c` | 8.56:1 |
| Dark accent `#b5a8ff` on `#29243d` | 7.08:1 |
| Dark success `#8fd0ab` on `#14171c` | 10.07:1 |
| Dark warning `#f2c878` on `#14171c` | 11.38:1 |
| Dark danger `#ff929b` on `#14171c` | 8.41:1 |

These palette pairs exceed the AA threshold. Status tones are foreground text colors and should be used on their corresponding theme surface; do not use color alone to convey a status.

## Responsive behavior and verification limits

The shared content routes use a bounded reading width; the Timer workspace may use the full width remaining after the navigation rail so its center stage and session overview can coexist. At narrow widths, content gutters and card/state padding shrink, and dialogs cap their width to the viewport. No feature chart or video functionality is introduced here. Browser verification of the redesign is recorded in the current UI implementation handoff rather than inferred from jsdom.
