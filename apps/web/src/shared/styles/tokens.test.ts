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
    expect(tokensCss).toContain('--color-accent: #174ea6;');
    expect(tokensCss).toContain(':root[data-theme="light"]');
  });

  it('provides an explicit dark palette without changing semantic names', () => {
    expect(tokensCss).toContain(':root[data-theme="dark"]');
    expect(tokensCss).toContain('--color-background: #101828;');
    expect(tokensCss).toContain('--color-text: #f1f5f9;');
    expect(tokensCss).toContain('--color-accent: #a9c7ff;');
    expect(tokensCss).toContain(':root[data-theme="system"]');
    expect(tokensCss).toContain('@media (prefers-color-scheme: dark)');
  });

  it('keeps named breakpoints and the minimum supported viewport tokenized', () => {
    expect(tokensCss).toContain('--breakpoint-sm: 40rem;');
    expect(tokensCss).toContain('--layout-content-max: 72rem;');
    expect(appCss).toContain('min-width: 320px;');
    expect(appCss).toContain('@media (max-width: 30rem)');
  });
});
