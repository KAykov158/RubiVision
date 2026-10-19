export type CubeNetLoader = (notation: string) => Promise<SVGSVGElement>;

export async function buildCubeNetSvg(notation: string): Promise<SVGSVGElement> {
  const [{ Alg }, { cube3x3x3 }] = await Promise.all([import('cubing/alg'), import('cubing/puzzles')]);
  const [svgSource, kpuzzle] = await Promise.all([cube3x3x3.svg(), cube3x3x3.kpuzzle()]);
  const pattern = kpuzzle.defaultPattern().applyAlg(Alg.fromString(notation));
  const document = new DOMParser().parseFromString(svgSource, 'image/svg+xml');
  const svg = document.querySelector('svg');
  if (!svg || document.querySelector('parsererror')) throw new Error('Could not create the cube net.');

  // cubing.js' net SVG includes a wide canvas around its drawing. Crop that
  // whitespace so a compact statistics card can use its available width.
  // Keep a 1 px margin for sticker strokes and orientation hints.
  svg.setAttribute('viewBox', '8 15 506 406');

  const stickers = new Map(Array.from(svg.querySelectorAll<SVGUseElement>('[id]'), (sticker) => [sticker.id, sticker]));
  const solvedColors = new Map(Array.from(stickers, ([id, sticker]) => [id, sticker.style.fill]));
  const currentColors = new Map<string, string>();
  for (const orbit of kpuzzle.definition.orbits) {
    const orbitPattern = pattern.patternData[orbit.orbitName];
    if (!orbitPattern) continue;
    for (let location = 0; location < orbit.numPieces; location++) {
      for (let orientation = 0; orientation < orbit.numOrientations; orientation++) {
        const destination = `${orbit.orbitName}-l${location}-o${orientation}`;
        const sourceOrientation = (orbit.numOrientations - orbitPattern.orientation[location]! + orientation) % orbit.numOrientations;
        const source = `${orbit.orbitName}-l${orbitPattern.pieces[location]}-o${sourceOrientation}`;
        const color = solvedColors.get(source);
        if (color) currentColors.set(destination, color);
      }
    }
  }
  for (const [id, color] of currentColors) {
    const sticker = stickers.get(id);
    if (sticker) sticker.style.fill = color;
  }
  for (const hint of svg.querySelectorAll<SVGUseElement>('[data-copy-id]')) {
    const copyId = hint.getAttribute('data-copy-id');
    const color = copyId ? currentColors.get(copyId) : undefined;
    if (color) hint.style.fill = color;
  }
  return svg as unknown as SVGSVGElement;
}
