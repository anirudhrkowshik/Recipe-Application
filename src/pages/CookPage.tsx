import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, store } from '@/store/store';
import { startSession, pauseSession, resumeSession, stopCurrentStep, tick, endSession } from '@/store/sessionSlice';
import { toggleFavorite } from '@/store/recipesSlice';
import { useInterval } from '@/hooks/useInterval';
import { calculateTotalTime } from '@/lib/recipes';
import { formatTime, cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CircularProgress from '@/components/CircularProgress';
import { ArrowLeft, Star, Play, Pause, Square, Thermometer, Wind, CheckCircle, Circle, Dot } from 'lucide-react';

const CookPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const recipe = useSelector((state: RootState) => state.recipes.recipes.find(r => r.id === id));
  const session = useSelector((state: RootState) => id ? state.session.byRecipeId[id] : undefined);
  const isActiveSession = useSelector((state: RootState) => state.session.activeRecipeId === id);

  useInterval(() => {
    if (recipe && isActiveSession) {
      dispatch(tick({ recipe }));
    }
  }, session?.isRunning ? 1000 : null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isActiveSession) {
        event.preventDefault();
        dispatch(session?.isRunning ? pauseSession() : resumeSession());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isActiveSession, session?.isRunning]);

  if (!recipe) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Recipe not found</h2>
        <Button asChild variant="link"><Link to="/recipes">Return to recipes</Link></Button>
      </div>
    );
  }

  const totalDurationSec = calculateTotalTime(recipe) * 60;
  const currentStep = session ? recipe.steps[session.currentStepIndex] : null;
  const stepDurationSec = currentStep ? currentStep.durationMinutes * 60 : 0;

  const stepElapsedSec = session ? Math.max(0, stepDurationSec - session.stepRemainingSec) : 0;
  const stepProgressPercent = stepDurationSec > 0 ? Math.round((stepElapsedSec / stepDurationSec) * 100) : 0;
  
  const overallElapsedSec = session ? totalDurationSec - session.overallRemainingSec : 0;
  const overallProgressPercent = totalDurationSec > 0 ? Math.round((overallElapsedSec / totalDurationSec) * 100) : 0;

  const isComplete = !isActiveSession && session;

  const handleStart = () => {
    const activeId = store.getState().session.activeRecipeId;
    if (activeId && activeId !== recipe.id) {
      showError("Another cooking session is already in progress.");
    } else {
      dispatch(startSession(recipe));
    }
  };

  const handleStop = () => {
    if (recipe) {
      dispatch(stopCurrentStep({ recipe }));
      showSuccess("Step ended.");
    }
  };

  const handleEndSession = () => {
    dispatch(endSession());
    navigate('/recipes');
  }

  const renderControls = () => {
    if (!isActiveSession) {
      return <Button size="lg" onClick={handleStart} className="w-full md:w-auto"><Play className="mr-2 h-5 w-5" /> Start Session</Button>;
    }
    if (session) {
      return (
        <div className="flex gap-4">
          <Button size="lg" onClick={() => dispatch(session.isRunning ? pauseSession() : resumeSession())} className="w-full">
            {session.isRunning ? <><Pause className="mr-2 h-5 w-5" /> Pause</> : <><Play className="mr-2 h-5 w-5" /> Resume</>}
          </Button>
          <Button size="lg" variant="destructive" onClick={handleStop} className="w-full">
            <Square className="mr-2 h-5 w-5" /> STOP
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" asChild className="-ml-4">
            <Link to="/recipes"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Recipes</Link>
          </Button>
          <h1 className="text-3xl font-bold mt-2">{recipe.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <Badge>{recipe.difficulty}</Badge>
            <span>Total Time: {calculateTotalTime(recipe)} min</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => dispatch(toggleFavorite(recipe.id))}>
          <Star className={cn("h-6 w-6", recipe.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400")} />
        </Button>
      </div>

      {isComplete ? (
        <Card className="text-center p-8 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold">Recipe Complete!</h2>
            <p className="text-muted-foreground mt-2">Well done! You've finished cooking "{recipe.title}".</p>
            <Button onClick={handleEndSession} className="mt-6">Back to All Recipes</Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isActiveSession && currentStep ? `Step ${session.currentStepIndex + 1} of ${recipe.steps.length}` : "Ready to Cook"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isActiveSession && currentStep ? (
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0">
                        <CircularProgress progress={stepProgressPercent}>
                          <div className="text-center">
                            <div className="text-3xl font-bold tracking-tighter">
                              {formatTime(session?.stepRemainingSec ?? stepDurationSec)}
                            </div>
                            <div className="text-sm text-muted-foreground">remaining</div>
                          </div>
                        </CircularProgress>
                      </div>
                      <div className="w-full">
                        <p className="text-lg font-medium">{currentStep.description}</p>
                        {currentStep.type === 'cooking' && currentStep.cookingSettings && (
                          <div className="flex gap-4 mt-3">
                            <Badge variant="secondary"><Thermometer className="mr-1.5 h-4 w-4" /> {currentStep.cookingSettings.temperature}°C</Badge>
                            <Badge variant="secondary"><Wind className="mr-1.5 h-4 w-4" /> Speed {currentStep.cookingSettings.speed}</Badge>
                          </div>
                        )}
                        {currentStep.type === 'instruction' && currentStep.ingredientIds && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {currentStep.ingredientIds.map(id => {
                              const ing = recipe.ingredients.find(i => i.id === id);
                              return ing ? <Badge key={id} variant="outline">{ing.name}</Badge> : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                     <div className="text-center py-8">
                        <p className="text-lg text-muted-foreground">Press 'Start Session' to begin cooking.</p>
                     </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex justify-center">{renderControls()}</div>
            </div>

            <Card>
              <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {recipe.steps.map((step, index) => {
                  const isCompleted = isActiveSession && session.currentStepIndex > index;
                  const isCurrent = isActiveSession && session.currentStepIndex === index;
                  const Icon = isCompleted ? CheckCircle : isCurrent ? Circle : Dot;
                  return (
                    <div key={step.id} className={cn("flex items-center gap-3 text-sm", isCurrent && "font-bold", isCompleted && "text-muted-foreground line-through")}>
                      <Icon className={cn("h-5 w-5 flex-shrink-0", isCurrent && "text-primary")} />
                      <span className="flex-grow truncate">{step.description}</span>
                      <span className="flex-shrink-0">{step.durationMinutes} min</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {isActiveSession && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span className="text-muted-foreground">
                    Overall remaining: {formatTime(session.overallRemainingSec)}
                  </span>
                </div>
                <Progress value={overallProgressPercent} aria-label={`${overallProgressPercent}% complete`} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CookPage;