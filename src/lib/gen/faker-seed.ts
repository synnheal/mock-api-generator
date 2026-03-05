import { faker } from '@faker-js/faker';

let currentSeed = Date.now();
let rngState = currentSeed;

export function setSeed(seed: number): void {
  currentSeed = seed;
  rngState = seed;
  faker.seed(seed);
}

export function getSeed(): number {
  return currentSeed;
}

export function randomizeSeed(): number {
  const newSeed = Date.now();
  setSeed(newSeed);
  return newSeed;
}

function mulberry32(a: number): () => number {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let rng = mulberry32(currentSeed);

export function resetRng(): void {
  rng = mulberry32(currentSeed);
}

export function random(): number {
  return rng();
}

export function randInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number): number {
  return random() * (max - min) + min;
}

export function randPick<T>(array: T[]): T {
  return array[randInt(0, array.length - 1)];
}

export function randShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function randBoolean(probability: number = 0.5): boolean {
  return random() < probability;
}

export function randDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(randInt(startTime, endTime));
}

export { faker };
