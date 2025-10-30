import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const RecipesListPage = () => {
  const recipes = useSelector((state: RootState) => state.recipes.recipes);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <Button asChild>
          <Link to="/create">Create Recipe</Link>
        </Button>
      </div>
      {recipes.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">No Recipes Yet!</h2>
          <p className="text-gray-500 mt-2">Get started by creating your first recipe.</p>
          <Button asChild className="mt-4">
            <Link to="/create">Create Recipe</Link>
          </Button>
        </div>
      ) : (
        <div>
          <p>Your saved recipes will be displayed here.</p>
          {/* Recipe list, filters, and sorting will be implemented here */}
        </div>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default RecipesListPage;