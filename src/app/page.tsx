// File: app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, BookOpenIcon, ClockIcon, InfoIcon, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/utils/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define TypeScript interface for tryout data
interface Tryout {
  id: number;
  title: string;
  subject: string;
  date: string;
  duration: string;
  total_questions: number;
  difficulty: 'Mudah' | 'Menengah' | 'Sulit';
  participants: number;
  image_url: string;
}

// Error type for better error handling
type FetchError = {
  message: string;
  status?: number;
};

async function getTryouts(): Promise<{ data: Tryout[] | null; error: FetchError | null }> {
  try {
    const { data, error } = await supabase
      .from('tryouts')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching tryouts:', error);
      return { 
        data: null, 
        error: { 
          message: error.message, 
          status: error.code === 'PGRST116' ? 404 : 500 
        } 
      };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error fetching tryouts:', err);
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { data: null, error: { message } };
  }
}

export default async function TryoutDashboard() {
  // Fetch tryouts from Supabase with error handling
  const { data: tryouts, error } = await getTryouts();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 pb-1 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Selamat Datang di TryXpert</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Latih kemampuanmu dan persiapkan diri untuk ujian dengan berbagai tryout yang tersedia</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Gagal memuat data tryout: {error.message}
            </AlertDescription>
          </Alert>
        )}
        
        {!error && (!tryouts || tryouts.length === 0) ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Tidak ada tryout yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryouts?.map((tryout) => (
              <Card key={tryout.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200">
                <div className="relative h-48 bg-gray-100">
                  <Image 
                    src={tryout.image_url || '/vercel.svg'} 
                    alt={tryout.title} 
                    fill 
                    className="object-contain p-4" 
                  />
                  <Badge className="absolute top-3 right-3" variant={
                    tryout.difficulty === 'Sulit' ? 'destructive' : 
                    tryout.difficulty === 'Menengah' ? 'default' : 
                    'secondary'
                  }>
                    {tryout.difficulty}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{tryout.title}</CardTitle>
                  <CardDescription>{tryout.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{tryout.date}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{tryout.duration}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BookOpenIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{tryout.total_questions} Pertanyaan</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{tryout.participants.toLocaleString()} peserta</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/tryout/detail/${tryout.id}`} className="flex-1">
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <InfoIcon className="mr-2 h-4 w-4" />
                      Detail
                    </Button>
                  </Link>
                  <Link href={`/tryout/${tryout.id}`} className="flex-1">
                    <Button className="w-full">Mulai Tryout</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}