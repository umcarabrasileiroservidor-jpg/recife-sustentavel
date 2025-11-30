import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { CheckCircle2, Lock, Trophy } from 'lucide-react';
import { Progress } from '../ui/progress';

interface WeeklyGoalProps {
  currentProgress: number; // Ex: 1 (fez 1 descarte)
  goalTarget: number;      // Ex: 3 (meta é 3)
  hasDiscardedToday: boolean; // Se já fez hoje
}

export function WeeklyGoal({ currentProgress, goalTarget, hasDiscardedToday }: WeeklyGoalProps) {
  const progressPercentage = Math.min((currentProgress / goalTarget) * 100, 100);
  const isGoalMet = currentProgress >= goalTarget;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 overflow-hidden relative">
        {/* Fundo decorativo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-xl" />

        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Meta Semanal
              </h3>
              <p className="text-sm text-muted-foreground">
                Faça {goalTarget} descartes em dias diferentes
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{currentProgress}/{goalTarget}</span>
              <p className="text-xs text-muted-foreground">dias</p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="relative mb-4">
            <Progress value={progressPercentage} className="h-3 bg-muted" />
            
            {/* Marcadores visuais na barra (opcional) */}
            <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1 pointer-events-none">
               {/* Apenas visual, para dar ideia de "steps" */}
            </div>
          </div>

          {/* Status do Dia Atual */}
          <div className="flex items-center gap-3 bg-card/50 p-3 rounded-lg border border-border/50">
            {hasDiscardedToday ? (
              <>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700">Descarte de hoje feito!</p>
                  <p className="text-xs text-muted-foreground">Volte amanhã para continuar.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700">Disponível para hoje</p>
                  <p className="text-xs text-muted-foreground">Faça seu descarte para pontuar.</p>
                </div>
              </>
            )}
          </div>

          {isGoalMet && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 bg-primary text-primary-foreground p-3 rounded-lg text-center shadow-lg shadow-primary/20"
            >
              <p className="font-bold">🎉 Meta Atingida!</p>
              <p className="text-sm opacity-90">+500 Capivaras liberadas</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}