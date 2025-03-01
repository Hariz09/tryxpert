// File: app/tryout/detail/[id]/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CalendarIcon, 
  BookOpenIcon, 
  ClockIcon, 
  Users, 
  ChevronLeft,
  BarChart,
  Award,
  CircleHelp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';

// Loading components
const TryoutInfoSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

const TryoutContentSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-64 bg-gray-200 rounded w-full"></div>
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  </div>
);

// Type for Tryout with all fields
type Tryout = Database['public']['Tables']['tryouts']['Row'] & {
  description?: string;
  syllabus?: string[];
  features?: string[];
};

// Function to fetch tryout details
async function getTryoutDetails(id: number): Promise<Tryout | null> {
  const { data, error } = await supabase
    .from('tryouts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching tryout:', error);
    return null;
  }
  
  // Parse JSON fields if they exist
  const tryout = data as Tryout;
  
  // Parse JSON fields if they're stored as strings
  if (typeof tryout.syllabus === 'string') {
    try {
      tryout.syllabus = JSON.parse(tryout.syllabus);
    } catch (e) {
      tryout.syllabus = [];
    }
  }
  
  if (typeof tryout.features === 'string') {
    try {
      tryout.features = JSON.parse(tryout.features);
    } catch (e) {
      tryout.features = [];
    }
  }
  
  return tryout;
}

// TryoutInfo component
const TryoutInfo = async ({ id }: { id: number }) => {
  const tryout = await getTryoutDetails(id);
  
  if (!tryout) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tryout Tidak Ditemukan</CardTitle>
          <CardDescription>Maaf, tryout dengan ID {id} tidak ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Informasi Tryout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-gray-700">Tanggal: <span className="font-medium">{tryout.date}</span></span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-gray-700">Durasi: <span className="font-medium">{tryout.duration}</span></span>
          </div>
          <div className="flex items-center">
            <BookOpenIcon className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-gray-700">Jumlah Soal: <span className="font-medium">{tryout.total_questions}</span></span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-gray-700">Peserta: <span className="font-medium">{tryout.participants?.toLocaleString() || '0'}</span></span>
          </div>
          <div className="flex items-center">
            <BarChart className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-gray-700">Tingkat Kesulitan: <span className="font-medium">{tryout.difficulty}</span></span>
          </div>
        </div>

        <div className="border-t pt-4">
          <Link href={`/tryout/${tryout.id}`}>
            <Button className="w-full size-lg">Mulai Tryout</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// TryoutContent component
const TryoutContent = async ({ id }: { id: number }) => {
  const tryout = await getTryoutDetails(id);
  
  if (!tryout) {
    return null;
  }
  
  return (
    <>
      <Card>
        <div className="relative h-64 bg-gray-100">
          <Image 
            src={tryout.image_url || '/vercel.svg'} 
            alt={tryout.title} 
            fill 
            className="object-contain p-4" 
            priority={false}
          />
        </div>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">{tryout.title}</CardTitle>
              <CardDescription>{tryout.subject}</CardDescription>
            </div>
            <Badge variant={
              tryout.difficulty === 'Sulit' ? 'destructive' : 
              tryout.difficulty === 'Menengah' ? 'default' : 
              'secondary'
            } className="px-2 py-1">
              {tryout.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
            <p className="text-gray-700">{tryout.description || 'Tidak ada deskripsi'}</p>
          </div>

          {tryout.syllabus && tryout.syllabus.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Silabus</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tryout.syllabus.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tryout.features && tryout.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Fitur Khusus</h3>
              <ul className="space-y-2">
                {tryout.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Award className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pertanyaan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center">
                <CircleHelp className="h-4 w-4 mr-2 text-blue-500" />
                Bagaimana cara mengerjakan tryout ini?
              </h4>
              <p className="ml-6 text-gray-700 mt-1">
                Klik tombol "Mulai Tryout" dan ikuti instruksi yang diberikan. Kamu akan diberi waktu sesuai dengan durasi yang telah ditentukan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center">
                <CircleHelp className="h-4 w-4 mr-2 text-blue-500" />
                Apakah saya bisa melihat hasil tryout?
              </h4>
              <p className="ml-6 text-gray-700 mt-1">
                Ya, setelah menyelesaikan tryout kamu akan langsung mendapatkan hasil dan analisis jawaban secara detail.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center">
                <CircleHelp className="h-4 w-4 mr-2 text-blue-500" />
                Apakah ada batas waktu untuk mengakses tryout ini?
              </h4>
              <p className="ml-6 text-gray-700 mt-1">
                Tryout akan tersedia hingga tanggal {tryout.date}. Setelah itu, kamu tidak dapat mengaksesnya lagi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Main page component
export default function TryoutDetailPage({ params }: { params: { id: string } }) {
  const tryoutId = parseInt(params.id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Tryout
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content with Suspense */}
          <div className="lg:col-span-2">
            <Suspense fallback={<TryoutContentSkeleton />}>
              <TryoutContent id={tryoutId} />
            </Suspense>
          </div>

          {/* Sidebar with Suspense */}
          <div>
            <Suspense fallback={<TryoutInfoSkeleton />}>
              <TryoutInfo id={tryoutId} />
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}