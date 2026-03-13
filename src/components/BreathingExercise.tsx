import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const BreathingExercise: React.FC = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 my-4">
      <div className="relative flex items-center justify-center w-48 h-48">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ scale: phase === 'inhale' ? 0.8 : phase === 'exhale' ? 1.2 : 1.2 }}
            animate={{ 
              scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1.2,
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute w-full h-full bg-emerald-400 rounded-full blur-2xl"
          />
        </AnimatePresence>
        
        <motion.div
          animate={{ 
            scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1.2 
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="z-10 w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-emerald-200"
        >
          <span className="text-3xl font-bold text-emerald-600">{count}</span>
        </motion.div>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="text-xl font-medium text-emerald-800 capitalize">
          {phase === 'inhale' ? '吸气 (Inhale)' : phase === 'hold' ? '屏息 (Hold)' : '呼气 (Exhale)'}
        </h3>
        <p className="text-emerald-600 text-sm mt-1">跟随圆圈的节奏，放松身心</p>
      </div>
    </div>
  );
};
