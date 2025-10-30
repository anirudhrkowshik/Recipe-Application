import { z } from 'zod';

const cookSettingsSchema = z.object({
  temperature: z.coerce.number().min(40, "Must be ≥ 40").max(200, "Must be ≤ 200"),
  speed: z.coerce.number().min(1, "Must be ≥ 1").max(5, "Must be ≤ 5"),
});

export const ingredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().positive("Must be > 0"),
  unit: z.string().min(1, "Unit is required"),
});

export const recipeStepSchema = z.object({
  id: z.string(),
  description: z.string().min(3, "Description is required"),
  type: z.enum(['cooking', 'instruction']),
  durationMinutes: z.coerce.number().int().positive("Must be > 0"),
  cookingSettings: cookSettingsSchema.optional(),
  ingredientIds: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'cooking') {
    if (!data.cookingSettings) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Settings are required",
        path: ['cookingSettings'],
      });
    }
    if (data.ingredientIds && data.ingredientIds.length > 0) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingredients not allowed for cooking steps",
        path: ['ingredientIds'],
      });
    }
  }
  if (data.type === 'instruction') {
    if (!data.ingredientIds || data.ingredientIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one ingredient",
        path: ['ingredientIds'],
      });
    }
     if (data.cookingSettings) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Settings not allowed for instruction steps",
        path: ['cookingSettings'],
      });
    }
  }
});

export const recipeFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  cuisine: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], { required_error: "Difficulty is required" }),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
  steps: z.array(recipeStepSchema).min(1, "At least one step is required"),
});

export type RecipeFormData = z.infer<typeof recipeFormSchema>;