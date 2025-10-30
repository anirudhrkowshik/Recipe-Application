import { useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { pauseSession, resumeSession, endSession, tick } from '@/store/sessionSlice';
import { useInterval } from '@/hooks/useInterval';
import { formatTime } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, X, Expand } from 'lucide-react';

const MiniCookPlayer = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const activeRecipeId = useSelector((state: RootState) => state.session.activeRecipeId);
  const session = useSelector((state: RootState) => activeRecipeId ? state.session.byRecipeId[activeRecipeId] : null);
  const recipe = useSelector((state: RootState) => 
    state.recipes.recipes.find(r => r.id === activeRecipeId)
  );

  useInterval(() => {
    if (recipe && session?.isRunning) {
      dispatch(tick({ recipe }));
    }
  }, session?.isRunning ? 1000 : null);

  if (!recipe || !session || location.pathname.startsWith('/cook/')) {
    return null;
  }

  const currentStep = recipe.steps[session.currentStepIndex];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold truncate pr-2">{recipe.title}</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dispatch(endSession())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mb-1">
            Step {session.currentStepIndex + 1}: {currentStep.description}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold tracking-tighter">
              {formatTime(session.stepRemainingSec)}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                onClick={() => dispatch(session.isRunning ? pauseSession() : resumeSession())}
              >
                {session.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="outline" asChild>
                <Link to={`/cook/${recipe.id}`}>
                  <Expand className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MiniCookPlayer;