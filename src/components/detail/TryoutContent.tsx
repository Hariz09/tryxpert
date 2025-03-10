import React from 'react';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award,
  CircleHelp,
} from 'lucide-react';
import { Tryout, formatDate } from '@/services/detail';

// Loading skeleton component
export const TryoutContentSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        ))}
      </div>
    </div>
  </div>
);

interface TryoutContentProps {
  tryout: Tryout | null;
  isLoading: boolean;
}

// Component that displays tryout content including details, syllabus, and FAQ
const TryoutContent: React.FC<TryoutContentProps> = ({ tryout, isLoading }) => {
  if (isLoading) {
    return <TryoutContentSkeleton />;
  }
  
  if (!tryout) {
    return null;
  }
  
  // Determine badge variant based on difficulty
  const getBadgeVariant = (difficulty: string) => {
    switch(difficulty) {
      case 'Sulit': return 'destructive';
      case 'Menengah': return 'default';
      default: return 'secondary';
    }
  };
  
  return (
    <>
      <Card className="border border-gray-200 dark:border-white dark:bg-black">
        <div className="relative h-64 bg-gray-100 dark:bg-gray-800">
          <Image 
            src={'/TX.png'} 
            alt={tryout.title} 
            fill 
            priority={false}
          />
        </div>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-2xl dark:text-white">{tryout.title}</CardTitle>
              <CardDescription className="dark:text-gray-300">{tryout.subject}</CardDescription>
            </div>
            <Badge variant={getBadgeVariant(tryout.difficulty)} className="px-2 py-1">
              {tryout.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Deskripsi</h3>
            <p className="text-gray-700 dark:text-gray-300">{tryout.description || 'Tidak ada deskripsi'}</p>
          </div>

          {tryout.syllabus && tryout.syllabus.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Silabus</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tryout.syllabus.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xs mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tryout.features && tryout.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Fitur Khusus</h3>
              <ul className="space-y-2">
                {tryout.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Award className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card className="border border-gray-200 dark:border-white dark:bg-black">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Pertanyaan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center dark:text-white">
                <CircleHelp className="h-4 w-4 mr-2 text-blue-500" />
                Bagaimana cara mengerjakan tryout ini?
              </h4>
              <p className="ml-6 text-gray-700 dark:text-gray-300 mt-1">
                Klik tombol &quot;Mulai Tryout&quot; dan ikuti instruksi yang diberikan. Kamu akan diberi waktu sesuai dengan durasi yang telah ditentukan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center dark:text-white">
                <CircleHelp className="h-4 w-4 mr-2 text-blue-500" />
                Apakah saya bisa melihat hasil tryout?
              </h4>
              <p className="ml-6 text-gray-700 dark:text-gray-300 mt-1">
                Ya, setelah menyelesaikan tryout kamu akan langsung mendapatkan hasil dan analisis jawaban secara detail.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center dark:text-white">
                <CircleHelp className="h-4 w-4 mr-2 text-blue-500" />
                Apakah ada batas waktu untuk mengakses tryout ini?
              </h4>
              <p className="ml-6 text-gray-700 dark:text-gray-300 mt-1">
                Tryout akan tersedia dari {tryout.start_date ? formatDate(tryout.start_date) : "-"} hingga {tryout.end_date ? formatDate(tryout.end_date) : "-"}. Setelah itu, kamu tidak dapat mengaksesnya lagi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TryoutContent;