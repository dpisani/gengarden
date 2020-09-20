import { cloneDeep } from "lodash";

export type ParticleManipulator<P> = (particle: P) => Partial<P>;

type ParticleStream<P> = [P, number][];

export class ParticleSystem<P> {
  private manipulators: ParticleManipulator<P>[];

  constructor({ manipulators }: { manipulators: ParticleManipulator<P>[] }) {
    this.manipulators = manipulators;
  }

  simulate = (initialParticles: P[], steps: number): ParticleStream<P>[] => {
    if (steps < 0) {
      throw new Error('Cannot have a negative number of steps!');
    }
    let particles = initialParticles.slice();
    const streams: ParticleStream<P>[] = [];

    for (let step = 0; step <= steps; step++) {
      // Take snapshot of current state
      particles.forEach((p, i) => {
        streams[i] = streams[i] ?? []
        
        streams[i].push([cloneDeep(p), step])
      });

      if (step === steps) {
        break; // If we're at the end we don't need to calculate the next state
      }

      // Apply all the manipulation functions
      particles = particles.map(p => {
        return this.manipulators.reduce((acc, manipulator) => ({...acc, ...manipulator(p)}), p)
      })
    }

    return streams;
  };
}
