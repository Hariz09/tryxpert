import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { 
  Timer,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

interface CountdownCardProps {
  startDate: string;
  endDate: string;
}

// Card component that displays a countdown for tryout timing
const CountdownCard: React.FC<CountdownCardProps> = ({ startDate, endDate }) => {
  const { timeRemaining, status, statusDisplay } = useCountdown(startDate, endDate);

  // Render the appropriate icon based on the status
  const renderIcon = () => {
    switch (statusDisplay.icon) {
      case 'timer':
        return <Timer className="h-6 w-6 text-blue-500" />;
      case 'clock':
        return <Clock className="h-6 w-6 text-green-500" />;
      case 'check-circle':
        return <CheckCircle className="h-6 w-6 text-gray-500" />;
      case 'alert-circle':
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <Card className={`mb-4 border ${statusDisplay.color}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          {renderIcon()}
          <CardTitle className="text-lg">{statusDisplay.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {status === 'ended' ? (
          <p className="text-gray-600 dark:text-gray-400">{statusDisplay.message}</p>
        ) : timeRemaining ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">{statusDisplay.message}</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div className="text-xl font-bold">{timeRemaining.days}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Hari</div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div className="text-xl font-bold">{timeRemaining.hours}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Jam</div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div className="text-xl font-bold">{timeRemaining.minutes}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Menit</div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div className="text-xl font-bold">{timeRemaining.seconds}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Detik</div>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CountdownCard;