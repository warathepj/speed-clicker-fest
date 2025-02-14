
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";

export const SpeedClicker = () => {
  const [clicks, setClicks] = useState<number[]>([]);
  const [cpm, setCpm] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved) : 0;
  });

  // Calculate CPM based on clicks in the last minute
  const calculateCPM = useCallback(() => {
    const now = Date.now();
    const recentClicks = clicks.filter(timestamp => now - timestamp < 60000);
    setCpm(recentClicks.length);
    return recentClicks.length;
  }, [clicks]);

  // Update CPM every second
  useEffect(() => {
    const interval = setInterval(calculateCPM, 1000);
    return () => clearInterval(interval);
  }, [calculateCPM]);

  // Handle click
  const handleClick = () => {
    const newClicks = [...clicks, Date.now()];
    setClicks(newClicks);
    
    const currentCPM = calculateCPM();
    if (currentCPM > highScore) {
      setHighScore(currentCPM);
      localStorage.setItem('highScore', currentCPM.toString());
    }
  };

  // Calculate percentage for progress bar (max at 300 CPM)
  const calculateProgress = (value: number) => {
    return Math.min((value / 300) * 100, 100);
  };

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
              <span className="text-sm font-medium text-gray-500">CURRENT CPM</span>
              <span className="text-lg font-bold text-primary">{cpm}</span>
            </div>
            <Progress 
              value={calculateProgress(cpm)}
              className="h-3 bg-gray-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">HIGH SCORE</span>
              <span className="text-lg font-bold text-primary">{highScore}</span>
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
        className="w-64 h-64 bg-white rounded-full shadow-lg flex items-center justify-center text-lg font-medium text-gray-700 cursor-pointer select-none"
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        CLICK
      </motion.button>

      <div className="mt-8 text-sm text-gray-500">
        Click the circle as fast as you can!
      </div>
    </div>
  );
};
