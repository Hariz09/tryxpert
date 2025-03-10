import React from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  BookOpenIcon, 
  ClockIcon, 
  Users, 
  BarChart,
  Edit,
  CalendarRange,
} from 'lucide-react';
import { Tryout, formatDateTime } from '@/services/detail';
import CountdownCard from './CountdownCard';
import MulaiTryoutButton from '@/components/MulaiTryoutButton';

// Loading skeleton component
export const TryoutInfoSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
  </div>
);

interface TryoutInfoProps {
  tryout: Tryout | null;
  isLoading: boolean;
  onEditQuestions: () => void;
}

// Component that displays tryout information and actions
const TryoutInfo: React.FC<TryoutInfoProps> = ({ 
  tryout, 
  isLoading, 
  onEditQuestions 
}) => {
  if (isLoading) {
    return <TryoutInfoSkeleton />;
  }
  
  if (!tryout) {
    return (
      <Card className="w-full max-w-md border border-gray-200 dark:border-white dark:bg-black">
        <CardHeader>
          <CardTitle>Tryout Tidak Ditemukan</CardTitle>
          <CardDescription className="dark:text-gray-300">Maaf, tryout tidak ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  // Check if participants count is 0 to determine if editing is allowed
  const canEdit = tryout.participants === 0;
  
  return (
    <div className="space-y-4">
      {/* Countdown Card */}
      <CountdownCard startDate={tryout.start_date} endDate={tryout.end_date} />
      
      {/* Tryout Info Card */}
      <Card className="sticky top-4 border border-gray-200 dark:border-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">Informasi Tryout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Mulai: <span className="font-medium dark:text-white">{formatDateTime(tryout.start_date)}</span></span>
            </div>
            <div className="flex items-center">
              <CalendarRange className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Berakhir: <span className="font-medium dark:text-white">{formatDateTime(tryout.end_date)}</span></span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Durasi: <span className="font-medium dark:text-white">
                {tryout.duration === -1 ? "Tidak ada batas" : `${tryout.duration} menit`}
              </span></span>
            </div>
            <div className="flex items-center">
              <BookOpenIcon className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Jumlah Soal: <span className="font-medium dark:text-white">{tryout.total_questions || 'N/A'}</span></span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Peserta: <span className="font-medium dark:text-white">{tryout.participants?.toLocaleString() || '0'}</span></span>
            </div>
            <div className="flex items-center">
              <BarChart className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Tingkat Kesulitan: <span className="font-medium dark:text-white">{tryout.difficulty}</span></span>
            </div>
          </div>

          <div className="flex flex-col space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <MulaiTryoutButton
              tryoutId={tryout.id}
              startDate={tryout.start_date}
              endDate={tryout.end_date}
            />
            
            {canEdit && (
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={onEditQuestions}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Questions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TryoutInfo;