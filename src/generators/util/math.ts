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
