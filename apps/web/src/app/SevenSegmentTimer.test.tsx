import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SevenSegmentTimer } from './SevenSegmentTimer';

describe('SevenSegmentTimer', () => {
  it('renders angular segment polygons and a digital decimal point for 00.00', () => {
    const { container } = render(<SevenSegmentTimer value="00.00" />);
    const digits = [...container.querySelectorAll<SVGSVGElement>('.timer-page__digit')];
    const decimal = container.querySelector('.timer-page__decimal');

    expect(digits).toHaveLength(4);
    expect(container.querySelectorAll('.timer-page__digit-segment')).toHaveLength(28);
    expect(container.querySelectorAll('.timer-page__digit-segment[opacity="1"]')).toHaveLength(24);
    expect(container.querySelectorAll('.timer-page__digit-segment[opacity="0"]')).toHaveLength(4);
    expect(container.querySelector('.timer-page__digit-segment')).toHaveAttribute('points', expect.stringContaining(','));
    expect(decimal?.querySelector('circle')).toHaveAttribute('cx', '12');
    expect(decimal?.querySelector('circle')).toHaveAttribute('cy', '98');
  });

  it('keeps decimal placement and digit order consistent as integer width changes', () => {
    const { container, rerender } = render(<SevenSegmentTimer value="00.00" />);
    const display = container.querySelector('.timer-page__seven-segment');
    const initialDigits = [...container.querySelectorAll<SVGSVGElement>('.timer-page__digit')];
    const initialDecimal = container.querySelector('.timer-page__decimal');
    expect(initialDigits.map((digit) => digit.dataset.digit)).toEqual(['0', '0', '0', '0']);
    expect([...display!.children].indexOf(initialDecimal!)).toBe(2);

    rerender(<SevenSegmentTimer value="100.00" />);
    const expandedDigits = [...container.querySelectorAll<SVGSVGElement>('.timer-page__digit')];
    const expandedDecimal = container.querySelector('.timer-page__decimal');
    expect(expandedDigits.map((digit) => digit.dataset.digit)).toEqual(['1', '0', '0', '0', '0']);
    expect([...display!.children].indexOf(expandedDecimal!)).toBe(3);
    expect(display).toBeInTheDocument();
  });
});
