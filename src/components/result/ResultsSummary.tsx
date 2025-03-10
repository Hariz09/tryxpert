import { 
    Card, 
    CardContent,
    CardHeader, 
    CardTitle, 
    CardDescription 
  } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Separator } from "@/components/ui/separator";
  import { 
    Clock, 
    Award, 
    CheckCircle, 
    XCircle, 
    AlertCircle 
  } from "lucide-react";
  import { TryoutResults } from "@/types/result";
  import { formatTimeTaken, getScoreCategory, getDifficultyVariant, getRecommendations } from "@/lib/result";
  
  interface ResultsSummaryProps {
    results: TryoutResults;
    router: any;
  }
  
  export function ResultsSummary({ results }: ResultsSummaryProps) {
    const questions = results.tryout.questions || [];
    
    return (
      <>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Hasil Tryout</CardTitle>
            <CardDescription>{results.tryout.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 w-24 h-24 mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                  {Math.round(results.percentageScore)}%
                </div>
              </div>
              <h3 className="text-xl font-semibold">
                {results.score} / {results.maxScore} Poin
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getScoreCategory(results.percentageScore)}
              </p>
            </div>
  
            <Separator />
  
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Benar</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                >
                  {results.answeredCorrectly} / {questions.length}
                </Badge>
              </div>
  
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span>Salah</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  {results.answeredWrong} / {questions.length}
                </Badge>
              </div>
  
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Tidak Dijawab</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                >
                  {results.unanswered} / {questions.length}
                </Badge>
              </div>
            </div>
  
            <Separator />
  
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Mata Pelajaran
                </span>
                <span className="font-medium">
                  {results.tryout.subject}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Waktu Pengerjaan
                </span>
                <div className="flex items-center font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeTaken(results.timeTaken)}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Tingkat Kesulitan
                </span>
                <Badge
                  variant={getDifficultyVariant(results.tryout.difficulty)}
                >
                  {results.tryout.difficulty}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Rekomendasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecommendations(results).map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="flex-1 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }