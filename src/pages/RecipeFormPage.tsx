import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const RecipeFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/recipes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
      </h1>
      <p>The recipe form will be implemented here.</p>
    </div>
  );
};

export default RecipeFormPage;