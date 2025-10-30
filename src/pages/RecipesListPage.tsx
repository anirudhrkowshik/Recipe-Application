import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Recipe, Difficulty } from '@/types';
import { calculateTotalTime } from '@/lib/recipes';

import { Button } from '@/components/ui/button';
import { MadeWithDyad } from "@/components/made-with-dyad";
import RecipeCard from '@/components/RecipeCard';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

const RecipesListPage = () => {
  const recipes = useSelector((state: RootState) => state.recipes.recipes);
  
  const [difficultyFilters, setDifficultyFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = [...recipes];

    if (difficultyFilters.length > 0) {
      filtered = filtered.filter(recipe => difficultyFilters.includes(recipe.difficulty));
    }

    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const timeA = calculateTotalTime(a);
      const timeB = calculateTotalTime(b);
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [recipes, difficultyFilters, sortOrder, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <Button asChild>
          <Link to="/create">Create New Recipe</Link>
        </Button>
      </div>

      {recipes.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Difficulty</label>
              <ToggleGroup 
                type="multiple" 
                variant="outline"
                value={difficultyFilters}
                onValueChange={(value) => setDifficultyFilters(value)}
                className="w-full justify-start"
              >
                <ToggleGroupItem value="Easy">Easy</ToggleGroupItem>
                <ToggleGroupItem value="Medium">Medium</ToggleGroupItem>
                <ToggleGroupItem value="Hard">Hard</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort by Total Time</label>
              <Select onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)} defaultValue={sortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <label className="text-sm font-medium mb-2 block">Search by Title</label>
              <Input 
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {recipes.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">No Recipes Yet!</h2>
          <p className="text-gray-500 mt-2">Get started by creating your first recipe.</p>
          <Button asChild className="mt-4">
            <Link to="/create">Create Recipe</Link>
          </Button>
        </div>
      ) : filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600">No recipes match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default RecipesListPage;