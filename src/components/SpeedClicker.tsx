
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const SpeedClicker = () => {
  const [clicks, setClicks] = useState<number[]>([]);
  const [cpm, setCpm] = useState(0);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved) : 0;
  });

  // Calculate clicks per 5 seconds
  const calculateCPS = useCallback(() => {
    const now = Date.now();
    const recentClicks = clicks.filter(timestamp => now - timestamp < 5000); // Changed from 60000 to 5000
    setCpm(recentClicks.length);
    return recentClicks.length;
  }, [clicks]);

  // Update CPS every second
  useEffect(() => {
    const interval = setInterval(calculateCPS, 1000);
    return () => clearInterval(interval);
  }, [calculateCPS]);

  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newClicks = [...clicks, Date.now()];
    setClicks(newClicks);
    
    // Add ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    const currentCPS = calculateCPS();
    if (currentCPS > highScore) {
      setHighScore(currentCPS);
      localStorage.setItem('highScore', currentCPS.toString());
    }
  };

  // Calculate percentage for progress bar (max at 50 clicks per 5 seconds)
  const calculateProgress = (value: number) => {
    return Math.min((value / 50) * 100, 100); // Adjusted max value from 300 to 50
  };

  // Determine if approaching record (within 90%)
  const isApproachingRecord = cpm >= highScore * 0.9 && cpm < highScore;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Speed Clicker</h1>
        <p className="text-lg text-gray-600 mb-6">Test your clicking speed!</p>
      </div>

      <div className="w-full max-w-md mb-8">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">CLICKS / 5s</span>
              <div className="flex items-center gap-2">
                {isApproachingRecord && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-yellow-500"
                  >
                    <TrendingUp size={20} />
                  </motion.div>
                )}
                {cpm > highScore && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-primary"
                  >
                    <Trophy size={20} />
                  </motion.div>
                )}
                <span className="text-lg font-bold text-primary">{cpm}</span>
              </div>
            </div>
            <Progress 
              value={calculateProgress(cpm)}
              className={`h-3 bg-gray-100 ${
                isApproachingRecord ? 'bg-yellow-100' : ''
              } ${cpm > highScore ? 'bg-primary/10' : ''}`}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">HIGH SCORE</span>
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-primary opacity-50" />
                <span className="text-lg font-bold text-primary">{highScore}</span>
              </div>
            </div>
            <Progress 
              value={calculateProgress(highScore)}
              className="h-3 bg-gray-100"
            />
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleClick}
        className={`w-64 h-64 bg-white rounded-full shadow-lg flex items-center justify-center text-lg font-medium text-gray-700 cursor-pointer select-none relative overflow-hidden ${
          isApproachingRecord ? 'shadow-yellow-200' : ''
        } ${cpm > highScore ? 'shadow-primary/20' : ''}`}
        whileTap={{ scale: 0.95, backgroundColor: "#f3f4f6" }}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <span className="z-10">CLICK</span>
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              initial={{ width: 0, height: 0, opacity: 0.5, x: ripple.x, y: ripple.y }}
              animate={{ width: 500, height: 500, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }}
            />
          ))}
        </AnimatePresence>
      </motion.button>

      <div className="mt-8 text-sm text-gray-500">
        Click the circle as fast as you can!
      </div>
    </div>
  );
};
