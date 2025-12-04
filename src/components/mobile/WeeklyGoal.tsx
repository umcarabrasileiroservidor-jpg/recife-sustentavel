import { motion } from 'motion/react';
import { CheckCircle2, Lock, Trophy } from 'lucide-react';

interface WeeklyGoalProps {
  currentProgress: number;
  goalTarget: number;
  hasDiscardedToday: boolean;
}

export function WeeklyGoal({ currentProgress, goalTarget, hasDiscardedToday }: WeeklyGoalProps) {
  const progressPercentage = Math.min((currentProgress / goalTarget) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-xl border border-green-100 overflow-hidden relative shadow-sm"
      style={{ background: 'linear-gradient(to bottom right, #ffffff, #f0fdf4)' }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#1e293b' }}>
              <Trophy className="w-5 h-5 text-amber-500" />
              Meta Semanal
            </h3>
            <p className="text-sm text-gray-500">
              Faça {goalTarget} descartes em dias diferentes
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-green-600">{currentProgress}/{goalTarget}</span>
            <p className="text-xs text-gray-400">dias</p>
          </div>
        </div>

        {/* Barra de Progresso Manual */}
        <div className="w-full h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
            />
        </div>

        {/* Status do Dia */}
        <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          {hasDiscardedToday ? (
            <>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">Descarte de hoje feito!</p>
                <p className="text-xs text-gray-500">Volte amanhã.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">Disponível para hoje</p>
                <p className="text-xs text-gray-500">Faça seu descarte para pontuar.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}