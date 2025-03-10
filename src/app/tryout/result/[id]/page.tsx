"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import LoadingAnimation from "@/components/LoadingAnimation";
import { ResultsSummary } from "@/components/result/ResultsSummary";
import { AnswerReview } from "@/components/result/AnswerReview";
import { fetchTryoutResults } from "@/services/result";
import { TryoutResults } from "@/types/result";

export default function TryoutResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState<TryoutResults | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tryout results
  useEffect(() => {
    async function loadTryoutResults() {
      setIsLoading(true);
      try {
        // Get ID from params
        const id =
          typeof params.id === "string"
            ? parseInt(params.id)
            : Array.isArray(params.id)
            ? parseInt(params.id[0])
            : 0;

        if (!id) {
          throw new Error("Invalid tryout ID");
        }

        const { tryoutResults, questionsData, errorMessage } = await fetchTryoutResults(id);
        
        if (errorMessage) {
          throw new Error(errorMessage);
        }

        setResults(tryoutResults || null);
        setQuestions(questionsData || []);
      } catch (err) {
        console.error("Error loading tryout results:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat hasil tryout"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTryoutResults();
  }, [params.id]);

  // Render loading state
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-red-600 dark:text-red-400 flex items-center text-xl font-bold mb-4">
              Error
            </h2>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Kembali ke Beranda
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Render if no results found
  if (!results) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Hasil Tidak Tersedia</h2>
            <p className="mb-4">
              Maaf, hasil tryout yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Kembali ke Beranda
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Results Summary */}
          <div className="md:col-span-1 space-y-6">
            <ResultsSummary results={results} router={router} />
          </div>

          {/* Answer Review */}
          <div className="md:col-span-2">
            <AnswerReview 
              questions={questions} 
              userAnswers={results.userAnswers} 
              tryoutId={results.tryout.id}
              router={router} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}