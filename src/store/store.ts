import { configureStore } from '@reduxjs/toolkit';
import recipesReducer from './recipesSlice';
import sessionReducer from './sessionSlice';

const saveRecipesMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  if (action.type.startsWith('recipes/')) {
    const recipesState = store.getState().recipes;
    try {
      const serializedState = JSON.stringify(recipesState.recipes);
      localStorage.setItem('recipes:v1', serializedState);
    } catch (err) {
      console.error("Could not save recipes to local storage", err);
    }
  }
  return result;
};

export const store = configureStore({
  reducer: {
    recipes: recipesReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saveRecipesMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;