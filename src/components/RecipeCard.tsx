import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { toggleFavorite, deleteRecipe } from '@/store/recipesSlice';
import { Recipe } from '@/types';
import { calculateTotalTime } from '@/lib/recipes';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Edit, Trash2, Soup } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { showSuccess } from '@/utils/toast';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const totalTime = calculateTotalTime(recipe);

  const handleDelete = () => {
    dispatch(deleteRecipe(recipe.id));
    showSuccess("Recipe deleted successfully.");
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold pr-2">{recipe.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={() => dispatch(toggleFavorite(recipe.id))}
          >
            <Star className={`h-5 w-5 ${recipe.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="mr-2 h-4 w-4" />
          <span>{totalTime} minutes</span>
        </div>
        <div>
          <Badge variant={recipe.difficulty === 'Easy' ? 'default' : recipe.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
            {recipe.difficulty}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild>
          <Link to={`/cook/${recipe.id}`}>
            <Soup className="mr-2 h-4 w-4" />
            Cook
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to={`/edit/${recipe.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the recipe "{recipe.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;