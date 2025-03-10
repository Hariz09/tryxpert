'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, CheckCircle } from 'lucide-react';

type MulaiTryoutButtonProps = {
  tryoutId: number;
  startDate: string;
  endDate: string;
  className?: string;
};

/**
 * Button component that handles starting a tryout session with date validation
 * Shows appropriate alerts if the tryout hasn't started yet or has already ended
 */
const MulaiTryoutButton = ({
  tryoutId,
  startDate,
  endDate,
  className = "",
}: MulaiTryoutButtonProps) => {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'notStarted' | 'ended' | null>(null);

  // Validates whether the tryout is available to start based on current time
  const checkTryoutStatus = () => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      // Tryout hasn't started yet
      setAlertType('notStarted');
      setShowAlert(true);
      return false;
    } else if (now > end) {
      // Tryout has already ended
      setAlertType('ended');
      setShowAlert(true);
      return false;
    }
    
    // Tryout is currently active and can be started
    return true;
  };

  
  // Handles the button click event, checking tryout status before navigation
  const handleMulaiTryout = () => {
    if (checkTryoutStatus()) {
      router.push(`/tryout/session/${tryoutId}`);
    }
  };

  // Formats a date string into a localized Indonesian date and time format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertContent = () => {
    if (alertType === 'notStarted') {
      return {
        icon: <Clock className="h-6 w-6 text-yellow-500" />,
        title: 'Tryout Belum Dimulai',
        description: `Tryout ini akan dimulai pada ${formatDate(startDate)}. Silakan kembali saat jadwal dimulai.`,
        confirmText: 'Mengerti'
      };
    } else {
      return {
        icon: <CheckCircle className="h-6 w-6 text-gray-500" />,
        title: 'Tryout Telah Berakhir',
        description: `Tryout ini telah berakhir pada ${formatDate(endDate)}. Silakan lihat tryout lainnya.`,
        confirmText: 'Tutup'
      };
    }
  };

  const alertContent = getAlertContent();

  return (
    <>
      {/* Main button to start the tryout */}
      <Button 
        className={`w-full size-lg ${className}`} 
        onClick={handleMulaiTryout}
      >
        Mulai Tryout
      </Button>

      {/* Alert dialog shown when tryout cannot be started */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2 mb-2">
              {alertContent.icon}
              <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {alertContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>
              {alertContent.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MulaiTryoutButton;