import { vec3 } from 'gl-matrix';

/**
 * createRing - creates a ring of points around the unit circle
 *
 * @returns {vec3[]} an array of points
 */
export default function(
  {
    plane = 'xz',
  }: {
    plane: 'xz' | 'xy' | 'yz';
  } = { plane: 'xz' },
): vec3[] {
  const segments = 10;
  const segmentAngle = (Math.PI * 2) / segments;
  return Array.from({ length: segments }).map((_x, i) => {
    const a = segmentAngle * i;

    switch (plane) {
      case 'xy':
        return vec3.fromValues(Math.cos(a), Math.sin(a), 0);
      case 'xz':
        return vec3.fromValues(Math.cos(a), 0, Math.sin(a));
      case 'yz':
        return vec3.fromValues(0, Math.cos(a), Math.sin(a));
      default:
        throw new Error(`Invalid plane ${plane}`);
    }
  });
}
