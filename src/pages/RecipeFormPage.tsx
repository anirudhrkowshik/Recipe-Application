import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, AppDispatch } from '@/store/store';
import { addRecipe, updateRecipe } from '@/store/recipesSlice';
import { Recipe, Difficulty } from '@/types';
import { recipeFormSchema, RecipeFormData } from '@/lib/validations';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, ArrowUp, ArrowDown, PlusCircle, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const StepItem = ({ form, stepIndex, removeStep, swapSteps, ingredients }: any) => {
  const stepType = useWatch({
    control: form.control,
    name: `steps.${stepIndex}.type`,
  });

  const selectedIngredientIds = useWatch({
    control: form.control,
    name: `steps.${stepIndex}.ingredientIds`,
    defaultValue: []
  });

  return (
    <div className="p-4 border rounded-lg space-y-4 relative">
      <div className="flex justify-between items-start">
        <p className="font-semibold">Step {stepIndex + 1}</p>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={() => swapSteps(stepIndex, stepIndex - 1)} disabled={stepIndex === 0}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => swapSteps(stepIndex, stepIndex + 1)} disabled={stepIndex === form.getValues('steps').length - 1}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(stepIndex)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name={`steps.${stepIndex}.description`}
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel>Description</FormLabel>
              <FormControl><Input {...field} placeholder="e.g., Sauté onions" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`steps.${stepIndex}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Step Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="instruction">Instruction</SelectItem>
                  <SelectItem value="cooking">Cooking</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`steps.${stepIndex}.durationMinutes`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl><Input type="number" {...field} placeholder="e.g., 5" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {stepType === 'cooking' && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <FormField
            control={form.control}
            name={`steps.${stepIndex}.cookingSettings.temperature`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl><Input type="number" {...field} placeholder="40-200" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`steps.${stepIndex}.cookingSettings.speed`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Speed (1-5)</FormLabel>
                <FormControl><Input type="number" {...field} placeholder="1-5" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {stepType === 'instruction' && (
        <FormField
          control={form.control}
          name={`steps.${stepIndex}.ingredientIds`}
          render={() => (
            <FormItem>
              <FormLabel>Ingredients</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      {selectedIngredientIds?.length > 0
                        ? `${selectedIngredientIds.length} ingredient(s) selected`
                        : "Select ingredients"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <div className="p-2 space-y-1">
                    {ingredients.map((ingredient: any) => (
                      <FormField
                        key={ingredient.id}
                        control={form.control}
                        name={`steps.${stepIndex}.ingredientIds`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(ingredient.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), ingredient.id])
                                    : field.onChange(field.value?.filter((id: string) => id !== ingredient.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal w-full">{ingredient.name}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};


const RecipeFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const recipeToEdit = useSelector((state: RootState) => state.recipes.recipes.find(r => r.id === id));
  const isEditing = !!recipeToEdit;

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      cuisine: '',
      difficulty: undefined,
      ingredients: [],
      steps: [],
    },
  });

  useEffect(() => {
    if (isEditing) {
      form.reset(recipeToEdit);
    }
  }, [isEditing, recipeToEdit, form]);

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const { fields: stepFields, append: appendStep, remove: removeStep, swap: swapSteps } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const ingredients = useWatch({ control: form.control, name: 'ingredients' });

  const onSubmit = (data: RecipeFormData) => {
    try {
      if (isEditing) {
        const updatedRecipe: Recipe = { ...recipeToEdit, ...data };
        dispatch(updateRecipe(updatedRecipe));
        showSuccess('Recipe updated successfully!');
      } else {
        dispatch(addRecipe(data));
        showSuccess('Recipe created successfully!');
      }
      navigate('/recipes');
    } catch (e) {
      showError('Failed to save recipe.');
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" asChild className="mb-4 -ml-4">
        <Link to="/recipes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Classic Spaghetti Bolognese" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., Italian" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <FormMessage>{form.formState.errors.ingredients?.root?.message}</FormMessage>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="grid grid-cols-3 gap-2 flex-grow">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input {...field} placeholder="Name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input type="number" {...field} placeholder="Quantity" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
      
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input {...field} placeholder="Unit (g, ml, pcs)" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeIngredient(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendIngredient({ id: uuidv4(), name: '', quantity: 0, unit: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Steps</CardTitle>
              <FormMessage>{form.formState.errors.steps?.root?.message}</FormMessage>
            </CardHeader>
            <CardContent className="space-y-4">
              {stepFields.map((field, index) => (
                <StepItem key={field.id} form={form} stepIndex={index} removeStep={removeStep} swapSteps={swapSteps} ingredients={ingredients} />
              ))}
              <Button type="button" variant="outline" onClick={() => appendStep({ id: uuidv4(), description: '', type: 'instruction', durationMinutes: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Step
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">{isEditing ? 'Save Changes' : 'Create Recipe'}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RecipeFormPage;