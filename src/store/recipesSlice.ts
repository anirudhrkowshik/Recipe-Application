import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface RecipesState {
  recipes: Recipe[];
}

const RECIPES_STORAGE_KEY = 'recipes:v1';

const loadRecipesFromStorage = (): Recipe[] => {
  try {
    const serializedState = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load recipes from local storage", err);
    return [];
  }
};

const initialState: RecipesState = {
  recipes: loadRecipesFromStorage(),
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    addRecipe: (state, action: PayloadAction<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date().toISOString();
      const newRecipe: Recipe = {
        id: uuidv4(),
        ...action.payload,
        createdAt: now,
        updatedAt: now,
      };
      state.recipes.push(newRecipe);
    },
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.recipes.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.recipes[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(r => r.id !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const recipe = state.recipes.find(r => r.id === action.payload);
      if (recipe) {
        recipe.isFavorite = !recipe.isFavorite;
      }
    },
  },
});

export const { addRecipe, updateRecipe, deleteRecipe, toggleFavorite } = recipesSlice.actions;

export default recipesSlice.reducer;