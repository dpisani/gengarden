import { prng } from 'seedrandom';

export const clamp = (x: number, min: number, max: number): number =>
  Math.min(Math.max(x, min), max);

// Returns a random integer in the range of [min, max)
export const getRandomInt = (min: number, max: number, rng: prng) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(rng() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

export const lerp = (a: number, b: number, t: number): number =>
  a + t * (b - a);

// Divides a range into a set of points spaced across the interval [a, b].
// A custom point lookup function can be provided which should be a mapping from [0,1] => [0,1]. Defaults to the identity function
export const subdivideInterval = (
  a: number,
  b: number,
  steps: number,
  lookupFn?: (t: number) => number,
): number[] => {
  const lookup = lookupFn || (x => x);

  const range = b - a;

  if (steps < 2) {
    return [a + lookup(0) * range];
  }

  const stepSize = 1 / (steps - 1);
  const points: number[] = [];

  for (let i = 0; i < steps; i++) {
    points[i] = a + lookup(i * stepSize) * range;
  }

  return points;
};
