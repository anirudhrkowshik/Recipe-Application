import { Recipe } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const sampleRecipes: Recipe[] = [
  {
    id: uuidv4(),
    title: 'Classic Tomato Soup',
    cuisine: 'Italian',
    difficulty: 'Easy',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ingredients: [
      { id: uuidv4(), name: 'Tomatoes', quantity: 800, unit: 'g' },
      { id: uuidv4(), name: 'Onion', quantity: 1, unit: 'pcs' },
      { id: uuidv4(), name: 'Garlic', quantity: 2, unit: 'cloves' },
      { id: uuidv4(), name: 'Vegetable Broth', quantity: 500, unit: 'ml' },
      { id: uuidv4(), name: 'Heavy Cream', quantity: 100, unit: 'ml' },
      { id: uuidv4(), name: 'Fresh Basil', quantity: 1, unit: 'bunch' },
    ],
    steps: [
      {
        id: uuidv4(),
        description: 'Chop onion and garlic.',
        type: 'instruction',
        durationMinutes: 5,
        ingredientIds: [
          // IDs will be dynamically assigned below
        ],
      },
      {
        id: uuidv4(),
        description: 'Sauté onion and garlic.',
        type: 'cooking',
        durationMinutes: 5,
        cookingSettings: { temperature: 120, speed: 2 },
      },
      {
        id: uuidv4(),
        description: 'Add tomatoes and broth.',
        type: 'instruction',
        durationMinutes: 2,
        ingredientIds: [
          // IDs will be dynamically assigned below
        ],
      },
      {
        id: uuidv4(),
        description: 'Simmer the soup.',
        type: 'cooking',
        durationMinutes: 20,
        cookingSettings: { temperature: 100, speed: 1 },
      },
      {
        id: uuidv4(),
        description: 'Blend, then stir in cream and basil.',
        type: 'instruction',
        durationMinutes: 3,
        ingredientIds: [
          // IDs will be dynamically assigned below
        ],
      },
    ],
  },
  {
    id: uuidv4(),
    title: 'Spicy Chicken Stir-fry',
    cuisine: 'Asian',
    difficulty: 'Medium',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ingredients: [
      { id: uuidv4(), name: 'Chicken Breast', quantity: 500, unit: 'g' },
      { id: uuidv4(), name: 'Bell Pepper', quantity: 2, unit: 'pcs' },
      { id: uuidv4(), name: 'Broccoli', quantity: 1, unit: 'head' },
      { id: uuidv4(), name: 'Soy Sauce', quantity: 60, unit: 'ml' },
      { id: uuidv4(), name: 'Ginger', quantity: 1, unit: 'tbsp' },
      { id: uuidv4(), name: 'Sriracha', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      {
        id: uuidv4(),
        description: 'Slice chicken, chop vegetables and grate ginger.',
        type: 'instruction',
        durationMinutes: 10,
        ingredientIds: [
          // IDs will be dynamically assigned below
        ],
      },
      {
        id: uuidv4(),
        description: 'Stir-fry chicken until cooked.',
        type: 'cooking',
        durationMinutes: 7,
        cookingSettings: { temperature: 140, speed: 3 },
      },
      {
        id: uuidv4(),
        description: 'Add vegetables and stir-fry for 3-4 minutes.',
        type: 'instruction',
        durationMinutes: 4,
        ingredientIds: [
          // IDs will be dynamically assigned below
        ],
      },
      {
        id: uuidv4(),
        description: 'Add soy sauce, ginger, and sriracha. Mix well.',
        type: 'instruction',
        durationMinutes: 2,
        ingredientIds: [
          // IDs will be dynamically assigned below
        ],
      },
      {
        id: uuidv4(),
        description: 'Simmer for 2 minutes to combine flavors.',
        type: 'cooking',
        durationMinutes: 2,
        cookingSettings: { temperature: 110, speed: 2 },
      },
    ],
  },
];

// Assign ingredient IDs to steps dynamically
sampleRecipes[0].steps[0].ingredientIds = [sampleRecipes[0].ingredients[1].id, sampleRecipes[0].ingredients[2].id];
sampleRecipes[0].steps[2].ingredientIds = [sampleRecipes[0].ingredients[0].id, sampleRecipes[0].ingredients[3].id];
sampleRecipes[0].steps[4].ingredientIds = [sampleRecipes[0].ingredients[4].id, sampleRecipes[0].ingredients[5].id];

sampleRecipes[1].steps[0].ingredientIds = [sampleRecipes[1].ingredients[0].id, sampleRecipes[1].ingredients[1].id, sampleRecipes[1].ingredients[2].id, sampleRecipes[1].ingredients[4].id];
sampleRecipes[1].steps[2].ingredientIds = [sampleRecipes[1].ingredients[1].id, sampleRecipes[1].ingredients[2].id];
sampleRecipes[1].steps[3].ingredientIds = [sampleRecipes[1].ingredients[3].id, sampleRecipes[1].ingredients[4].id, sampleRecipes[1].ingredients[5].id];