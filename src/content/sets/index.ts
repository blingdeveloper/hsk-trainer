import type { PracticeSet } from '../types';
import { SET_A } from './set-a';
import { SET_B } from './set-b';
import { SET_C } from './set-c';
import { PICTURES_A } from './pictures-a';

export const SETS: PracticeSet[] = [SET_A, SET_B, SET_C];

/** Reading Part 1 picture sets: separate papers, so the practice sets and mocks keep their shape. */
export const PICTURE_SETS: PracticeSet[] = [PICTURES_A];
