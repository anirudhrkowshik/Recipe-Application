import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionState, Recipe } from '@/types';

const initialState: SessionState = {
  activeRecipeId: null,
  byRecipeId: {},
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<Recipe>) => {
        const recipe = action.payload;
        if (state.activeRecipeId !== null && state.activeRecipeId !== recipe.id) {
            console.warn("Another session is already active.");
            return;
        }

        const totalDurationSec = recipe.steps.reduce((sum, step) => sum + step.durationMinutes * 60, 0);
        
        state.activeRecipeId = recipe.id;
        state.byRecipeId[recipe.id] = {
            currentStepIndex: 0,
            isRunning: true,
            stepRemainingSec: recipe.steps[0]?.durationMinutes * 60 || 0,
            overallRemainingSec: totalDurationSec,
            lastTickTs: Date.now(),
        };
    },
    pauseSession: (state) => {
        if (state.activeRecipeId && state.byRecipeId[state.activeRecipeId]) {
            state.byRecipeId[state.activeRecipeId].isRunning = false;
        }
    },
    resumeSession: (state) => {
        if (state.activeRecipeId && state.byRecipeId[state.activeRecipeId]) {
            state.byRecipeId[state.activeRecipeId].isRunning = true;
            state.byRecipeId[state.activeRecipeId].lastTickTs = Date.now();
        }
    },
    stopCurrentStep: (state, action: PayloadAction<{ recipe: Recipe }>) => {
        if (!state.activeRecipeId) return;
        const session = state.byRecipeId[state.activeRecipeId];
        if (!session) return;

        const { recipe } = action.payload;
        
        session.overallRemainingSec -= session.stepRemainingSec;

        if (session.currentStepIndex >= recipe.steps.length - 1) {
            state.activeRecipeId = null;
            delete state.byRecipeId[recipe.id];
        } else {
            session.currentStepIndex++;
            const nextStep = recipe.steps[session.currentStepIndex];
            session.stepRemainingSec = nextStep.durationMinutes * 60;
            session.lastTickTs = Date.now();
        }
    },
    tick: (state, action: PayloadAction<{ recipe: Recipe }>) => {
        if (!state.activeRecipeId) return;
        const session = state.byRecipeId[state.activeRecipeId];
        if (!session || !session.isRunning) return;

        const { recipe } = action.payload;
        const now = Date.now();
        const delta = now - (session.lastTickTs || now);
        const deltaSec = Math.round(delta / 1000);

        if (deltaSec < 1) return;

        session.lastTickTs = now;
        session.stepRemainingSec -= deltaSec;
        session.overallRemainingSec -= deltaSec;

        if (session.stepRemainingSec <= 0) {
            if (session.currentStepIndex >= recipe.steps.length - 1) {
                state.activeRecipeId = null;
                delete state.byRecipeId[recipe.id];
            } else {
                session.currentStepIndex++;
                const nextStep = recipe.steps[session.currentStepIndex];
                session.stepRemainingSec = (nextStep.durationMinutes * 60) + session.stepRemainingSec;
            }
        }
    },
    endSession: (state) => {
        if (state.activeRecipeId) {
            delete state.byRecipeId[state.activeRecipeId];
        }
        state.activeRecipeId = null;
    }
  },
});

export const { startSession, pauseSession, resumeSession, stopCurrentStep, tick, endSession } = sessionSlice.actions;
export default sessionSlice.reducer;