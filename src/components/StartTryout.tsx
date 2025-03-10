import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Clock, Timer, CheckCircle } from 'lucide-react';
import { Database } from '@/types/supabase';
import LoadingAnimation from '@/components/LoadingAnimation';
type Tryout = Database['public']['Tables']['tryouts']['Row'];

interface StartTryoutProps {
  tryout: Tryout;
}

 // Enum representing the possible states of a tryout based on time
enum TryoutStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ENDED = 'ended',
}

/**
 * Component that handles the starting of a tryout session
 * Displays different button states based on tryout timing and handles confirmation workflow
 */
const StartTryout: React.FC<StartTryoutProps> = ({ tryout }) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determines the current status of the tryout based on the current time
  const getTryoutStatus = (): TryoutStatus => {
    const now = new Date();
    const startDate = new Date(tryout.start_date);
    const endDate = new Date(tryout.end_date);

    if (now < startDate) {
      return TryoutStatus.NOT_STARTED;
    } else if (now >= startDate && now < endDate) {
      return TryoutStatus.IN_PROGRESS;
    } else {
      return TryoutStatus.ENDED;
    }
  };

  const tryoutStatus = getTryoutStatus();

  /**
   * Handles the confirmation to start the tryout
   * Performs validation checks and redirects to the tryout session
   */
  const handleConfirmStart = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Double-check the status right before starting to ensure it's still valid
      const currentStatus = getTryoutStatus();
      if (currentStatus !== TryoutStatus.IN_PROGRESS) {
        throw new Error(
          currentStatus === TryoutStatus.NOT_STARTED 
            ? "Tryout belum dimulai. Silakan kembali pada waktu yang ditentukan." 
            : "Tryout sudah berakhir."
        );
      }

      // handle starting the tryout in the database (Level 4)

      // Redirect to the tryout session page
      router.push(`/tryout/session/${tryout.id}`);
    } catch (error) {
      console.error('Error starting tryout:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat memulai tryout.');
    } finally {
      setIsLoading(false);
    }
  };

  const openStartDialog = () => {
    setErrorMessage(null);
    setDialogOpen(true);
  };

  const renderButton = () => {
    switch (tryoutStatus) {
      case TryoutStatus.NOT_STARTED:
        return (
          <Button 
            className="w-full" 
            disabled={true}
            variant="outline"
          >
            <Timer className="mr-2 h-4 w-4" />
            Tryout Belum Dimulai
          </Button>
        );
      case TryoutStatus.IN_PROGRESS:
        return (
          <Button 
            className="w-full" 
            onClick={openStartDialog}
          >
            Mulai Tryout
          </Button>
        );
      case TryoutStatus.ENDED:
        return (
          <Button 
            className="w-full" 
            disabled={true} 
            variant="outline"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Tryout Telah Berakhir
          </Button>
        );
    }
  };

  return (
    <>
      {/* Display loading animation when processing */}
      {isLoading && <LoadingAnimation />}
      
      {/* Render the appropriate button based on tryout status */}
      {renderButton()}

      {/* Confirmation dialog for starting the tryout */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mulai Tryout</DialogTitle>
            <DialogDescription>
              Anda akan memulai tryout &quot;{tryout.title}&quot;. Pastikan Anda memiliki waktu yang cukup untuk menyelesaikannya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tryout timing information card */}
            <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Informasi Waktu:</p>
                <ul className="text-sm space-y-1 mt-1">
                  <li>• Durasi: {tryout.duration === -1 ? "Tidak ada batas waktu" : `${tryout.duration} menit`}</li>
                  <li>• Tryout berakhir pada: {new Date(tryout.end_date).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</li>
                </ul>
              </div>
            </div>

            {/* Error message display if any */}
            {errorMessage && (
              <div className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Dialog action buttons */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmStart} disabled={isLoading}>
              Mulai Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StartTryout;