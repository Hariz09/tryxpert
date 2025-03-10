// app/tryout/detail/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingAnimation from '@/components/LoadingAnimation';
import TryoutInfo from '@/components/detail/Tryoutinfo';
import TryoutContent from '@/components/detail/TryoutContent';
import { Tryout, getTryoutDetails } from '@/services/detail';

/**
 * Tryout Detail Page Component
 * Displays detailed information about a specific tryout
 */
export default function TryoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditLoading, setIsEditLoading] = useState(false);

  useEffect(() => {
    async function loadTryout() {
      setIsLoading(true);
      try {
        // Ensure id is a string and parse it to a number
        const id = typeof params.id === 'string' ? parseInt(params.id) : 
                   Array.isArray(params.id) ? parseInt(params.id[0]) : 0;
        
        if (id) {
          const data = await getTryoutDetails(id);
          setTryout(data);
        }
      } catch (error) {
        console.error('Failed to load tryout:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTryout();
  }, [params.id]);

  // Handle edit questions button click
  const handleEditQuestions = () => {
    if (!tryout || tryout.participants !== 0) return;
    
    setIsEditLoading(true);
    
    // Redirect to edit page with the tryout ID
    setTimeout(() => {
      router.push(`/tryout/edit/${tryout.id}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
      <Navbar />
      
      {isEditLoading && <LoadingAnimation />}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Tryout
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <TryoutContent tryout={tryout} isLoading={isLoading} />
          </div>

          {/* Sidebar */}
          <div>
            <TryoutInfo 
              tryout={tryout} 
              isLoading={isLoading} 
              onEditQuestions={handleEditQuestions}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}