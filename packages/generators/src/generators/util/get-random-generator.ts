import { alea } from 'seedrandom';

export default (seed?: string) => {
  const s: string = seed || Math.random().toString();

  return alea(s);
};
