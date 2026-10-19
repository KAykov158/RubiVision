const segmentPoints = {
  a: '12,4 54,4 59,9 54,14 12,14 7,9',
  b: '55,12 60,17 60,47 55,52 50,47 50,17',
  c: '55,56 60,61 60,91 55,96 50,91 50,61',
  d: '12,94 54,94 59,99 54,104 12,104 7,99',
  e: '11,56 16,61 16,91 11,96 6,91 6,61',
  f: '11,12 16,17 16,47 11,52 6,47 6,17',
  g: '12,49 54,49 59,54 54,59 12,59 7,54',
} as const;

const digitSegments: Record<string, readonly (keyof typeof segmentPoints)[]> = {
  '-': ['g'],
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'd', 'e', 'g'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['b', 'c', 'f', 'g'],
  '5': ['a', 'c', 'd', 'f', 'g'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

function Digit({ value, index }: { value: string; index: number }) {
  const active = new Set(digitSegments[value] ?? []);
  return (
    <svg aria-hidden="true" className="timer-page__digit" data-digit={value || 'blank'} height="108" key={index} viewBox="0 0 66 108" width="66">
      {(Object.entries(segmentPoints) as [keyof typeof segmentPoints, string][]).map(([name, points]) => (
        <polygon
          key={name}
          className="timer-page__digit-segment"
          data-segment={name}
          fill="currentColor"
          opacity={value && active.has(name) ? 1 : 0}
          points={points}
        />
      ))}
    </svg>
  );
}

/** Locally rendered seven-segment digits. The whole changing-width row stays centered by its parent. */
export function SevenSegmentTimer({ value }: { value: string }) {
  const [integerPart = '00', fractionPart = '00'] = value.split('.');
  return (
    <span aria-hidden="true" className="timer-page__seven-segment">
      {[...integerPart].map((digit, index) => <Digit index={index} key={`integer-${index}`} value={digit} />)}
      <svg aria-hidden="true" className="timer-page__decimal" height="108" viewBox="0 0 24 108" width="24">
        <circle cx="12" cy="98" fill="currentColor" r="5.5" />
      </svg>
      {[...fractionPart].map((digit, index) => <Digit index={index} key={`fraction-${index}`} value={digit} />)}
    </span>
  );
}
