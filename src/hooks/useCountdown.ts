import { useState, useEffect } from 'react';
import { getTryoutStatus, calculateTimeRemaining } from '@/services/detail';

type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} | null;

type CountdownStatus = 'notStarted' | 'inProgress' | 'ended';

type UseCountdownReturn = {
  timeRemaining: TimeRemaining;
  status: CountdownStatus;
  statusDisplay: {
    title: string;
    icon: string;
    message: string;
    color: string;
  };
};

/**
 * Hook to manage countdown timer for tryout dates
 * @param startDate ISO date string for tryout start
 * @param endDate ISO date string for tryout end
 * @returns Object with timeRemaining, status, and statusDisplay
 */
export function useCountdown(startDate: string, endDate: string): UseCountdownReturn {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(null);
  const [status, setStatus] = useState<CountdownStatus>(getTryoutStatus(startDate, endDate));

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check tryout status
      const currentStatus = getTryoutStatus(startDate, endDate);
      setStatus(currentStatus);
      
      // Based on status, calculate the appropriate time remaining
      if (currentStatus === 'notStarted') {
        // Time until start
        const remaining = calculateTimeRemaining(start);
        setTimeRemaining(remaining);
      } else if (currentStatus === 'inProgress') {
        // Time until end
        const remaining = calculateTimeRemaining(end);
        setTimeRemaining(remaining);
      } else {
        // Ended
        setTimeRemaining(null);
      }
    };

    // Initial calculation
    calculateTime();

    // Update every second
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  // Get display information based on status
  const getStatusDisplay = () => {
    switch (status) {
      case 'notStarted':
        return {
          title: 'Tryout Belum Dimulai',
          icon: 'timer',
          message: 'Waktu menuju mulai:',
          color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        };
      case 'inProgress':
        return {
          title: 'Tryout Sedang Berlangsung',
          icon: 'clock',
          message: 'Waktu tersisa:',
          color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        };
      case 'ended':
        return {
          title: 'Tryout Telah Berakhir',
          icon: 'check-circle',
          message: 'Tryout ini sudah tidak tersedia.',
          color: 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
        };
      default:
        return {
          title: 'Status Tryout',
          icon: 'alert-circle',
          message: 'Informasi tidak tersedia',
          color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        };
    }
  };

  return {
    timeRemaining,
    status,
    statusDisplay: getStatusDisplay()
  };
}