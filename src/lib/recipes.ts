import { Recipe, Difficulty } from '@/types';

export const calculateTotalTime = (recipe: Recipe): number => {
  if (!recipe || !recipe.steps) return 0;
  return recipe.steps.reduce((total, step) => total + step.durationMinutes, 0);
};

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};