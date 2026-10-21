/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tokensCss = readFileSync(resolve(process.cwd(), 'src/shared/styles/tokens.css'), 'utf8');
const appCss = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

describe('design theme tokens', () => {
  it('provides the light semantic palette by default', () => {
    expect(tokensCss).toContain('--color-background: #f5f6f8;');
    expect(tokensCss).toContain('--color-text: #172033;');
    expect(tokensCss).toContain('--color-accent: #604bd8;');
    expect(tokensCss).toContain(':root[data-theme="light"]');
  });

  it('provides an explicit dark palette without changing semantic names', () => {
    expect(tokensCss).toContain(':root[data-theme="dark"]');
    expect(tokensCss).toContain('--color-background: #0c0e12;');
    expect(tokensCss).toContain('--color-text: #f0f0f4;');
    expect(tokensCss).toContain('--color-accent: #b5a8ff;');
    expect(tokensCss).toContain(':root[data-theme="system"]');
    expect(tokensCss).toContain('@media (prefers-color-scheme: dark)');
  });

  it('uses vivid semantic success and danger colors in both themes', () => {
    expect(tokensCss).toContain('--color-success: #166534;');
    expect(tokensCss).toContain('--color-danger: #b42318;');
    expect(tokensCss).toContain('--color-success: #4ade80;');
    expect(tokensCss).toContain('--color-danger: #ff6b6b;');
  });

  it('keeps the timer display responsive and the comparison slot reserved beside it', () => {
    expect(appCss).toContain('.timer-page__timing-display');
    expect(appCss).toContain('grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);');
    expect(appCss).toContain('height: clamp(5rem, 16vw, 14rem);');
    expect(appCss).toContain('height: clamp(4rem, 21vw, 6.5rem);');
  });

  it('keeps named breakpoints and the minimum supported viewport tokenized', () => {
    expect(tokensCss).toContain('--breakpoint-sm: 40rem;');
    expect(tokensCss).toContain('--layout-content-max: 72rem;');
    expect(appCss).toContain('min-width: 320px;');
    expect(appCss).toContain('@media (max-width: 30rem)');
  });
});
