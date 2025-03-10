"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  BookOpenIcon,
  ClockIcon,
  InfoIcon,
  Users,
  Pencil,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LoadingAnimation from "@/components/LoadingAnimation";
import TryoutForm, { TryoutFormValues } from "@/components/TryoutForm";
import MulaiTryoutButton from "@/components/MulaiTryoutButton";
import { 
  fetchTryouts, 
  addTryout,
  updateTryout, 
  deleteTryout, 
  formatDate, 
  Tryout, 
  DashboardError, 
  getDifficultyVariant 
} from "@/services/dashboard";

export default function TryoutDashboard() {
  const router = useRouter();
  // State for storing and managing tryout data
  const [tryouts, setTryouts] = useState<Tryout[] | null>(null);
  const [error, setError] = useState<DashboardError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [selectedTryout, setSelectedTryout] = useState<Tryout | null>(null);

  // Dialog control states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Default values for new tryout form
  const defaultValues: Partial<TryoutFormValues> = {
    title: "",
    subject: "",
    start_date: undefined,
    end_date: undefined,
    duration: 60,
    difficulty: "Menengah" as const,
    participants: 0,
    syllabus: [],
    features: [],
    description: "",
  };

  // Fetch tryout data when component mounts
  useEffect(() => {
    loadTryouts();
  }, []);

  // Function to load tryouts using dashboard service
  async function loadTryouts() {
    setLoading(true);
    try {
      const { tryouts: fetchedTryouts, error: fetchError } = await fetchTryouts();
      
      if (fetchError) {
        setError(fetchError);
        setTryouts(null);
      } else {
        setTryouts(fetchedTryouts);
        setError(null);
      }
    } catch (err) {
      console.error("Unexpected error in loadTryouts:", err);
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError({ message });
      setTryouts(null);
    } finally {
      setLoading(false);
    }
  }

  // Handle navigation to tryout detail page with loading animation
  const handleDetailNavigation = (id: number) => {
    setIsNavigating(true);
    // Small delay to ensure loading animation is visible before navigation
    setTimeout(() => {
      router.push(`/tryout/detail/${id}`);
    }, 100);
  };

  // Set selected tryout and open edit dialog
  const openEditDialog = (tryout: Tryout) => {
    setSelectedTryout(tryout);
    setIsEditDialogOpen(true);
  };

  // Set selected tryout and open delete confirmation dialog
  const openDeleteDialog = (tryout: Tryout) => {
    setSelectedTryout(tryout);
    setIsDeleteDialogOpen(true);
  };

  // Handle adding a new tryout
  const handleAddTryout = async (formData: TryoutFormValues) => {
    try {
      const result = await addTryout(formData);
      
      if (result) {
        toast.success("Tryout baru telah ditambahkan");
        setIsAddDialogOpen(false);
        loadTryouts();
        return result;
      } else {
        toast.error("Gagal menambahkan tryout");
        return undefined;
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || "Terjadi kesalahan saat menambahkan tryout"}`);
      return undefined;
    }
  };

  // Handle updating an existing tryout
  const handleUpdateTryout = async (formData: TryoutFormValues) => {
    if (!selectedTryout) return undefined;

    try {
      const result = await updateTryout(selectedTryout.id, formData);
      
      if (result) {
        toast.success("Tryout telah diperbarui");
        setIsEditDialogOpen(false);
        loadTryouts();
        return result;
      } else {
        toast.error("Gagal memperbarui tryout");
        return undefined;
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || "Terjadi kesalahan saat memperbarui tryout"}`);
      return undefined;
    }
  };

  // Handle deleting a tryout
  const handleDeleteTryout = async () => {
    if (!selectedTryout) return;

    try {
      const success = await deleteTryout(selectedTryout.id);
      
      if (success) {
        toast.success("Tryout telah dihapus");
        setIsDeleteDialogOpen(false);
        loadTryouts();
      } else {
        toast.error("Gagal menghapus tryout");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || "Terjadi kesalahan saat menghapus tryout"}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Show loading animation during navigation */}
      {isNavigating && <LoadingAnimation />}
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Selamat Datang di TryXpert
            </h1>
          </div>

          {/* Add Tryout Button and Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Tambah Tryout</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Tryout Baru</DialogTitle>
                <DialogDescription>
                  Masukkan informasi untuk tryout baru. Klik simpan saat
                  selesai.
                </DialogDescription>
              </DialogHeader>

              {/* TryoutForm component for creating new tryouts */}
              <TryoutForm
                defaultValues={defaultValues}
                onSubmit={handleAddTryout}
                isEdit={false}
              />

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Batal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Display error alert if fetch fails */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Gagal memuat data tryout: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Show loading skeleton while data is being fetched */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden border-gray-200">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-5 bg-gray-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : !error && (!tryouts || tryouts.length === 0) ? (
          // Show message when no tryouts are available
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              Tidak ada tryout yang tersedia saat ini.
            </p>
          </div>
        ) : (
          // Display tryout cards grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryouts?.map((tryout) => (
              <Card
                key={tryout.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 flex flex-col h-full"
              >
                {/* Tryout image section */}
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={tryout.image_url || "/TX.png"}
                    alt={tryout.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                </div>

                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-xl">{tryout.title}</CardTitle>
                    {/* Difficulty badge with conditional styling */}
                    <Badge
                      variant={getDifficultyVariant(tryout.difficulty)}
                    >
                      {tryout.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{tryout.subject}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  {/* Tryout details */}
                  <div className="flex flex-col space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>
                        {formatDate(tryout.start_date)} -{" "}
                        {formatDate(tryout.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>
                        {tryout.duration === null || tryout.duration === -1
                          ? "Tanpa batas"
                          : `${tryout.duration} menit`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BookOpenIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{tryout.total_questions || 0} Pertanyaan</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-blue-500" />
                      <span>
                        {tryout.participants.toLocaleString()} peserta
                      </span>
                    </div>
                  </div>

                  {/* Display syllabus if available, with limit and "more" indicator */}
                  {tryout.syllabus && tryout.syllabus.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-sm mb-1">Silabus:</h4>
                      <ul className="text-sm text-muted-foreground">
                        {tryout.syllabus.slice(0, 2).map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {tryout.syllabus.length > 2 && (
                          <li className="text-sm text-blue-500">
                            +{tryout.syllabus.length - 2} lainnya
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2 mt-auto">
                  {/* Info button to view tryout details */}
                  <Button
                    variant="outline"
                    className="flex items-center justify-center"
                    onClick={() => handleDetailNavigation(tryout.id)}
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>

                  {/* Edit Dialog and Button */}
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 dark:border-amber-800"
                        onClick={() => openEditDialog(tryout)}
                      >
                        <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Edit Tryout</DialogTitle>
                        <DialogDescription>
                          Perbarui informasi tryout. Klik simpan untuk menyimpan
                          perubahan.
                        </DialogDescription>
                      </DialogHeader>

                      {/* TryoutForm component for editing existing tryout */}
                      {selectedTryout && (
                        <TryoutForm
                          defaultValues={{
                            title: selectedTryout.title,
                            subject: selectedTryout.subject,
                            start_date: new Date(selectedTryout.start_date),
                            end_date: new Date(selectedTryout.end_date),
                            duration:
                              selectedTryout.duration === -1
                                ? 60
                                : selectedTryout.duration,
                            difficulty: selectedTryout.difficulty,
                            participants: selectedTryout.participants,
                            syllabus: selectedTryout.syllabus || [],
                            features: selectedTryout.features || [],
                            description: selectedTryout.description || "",
                          }}
                          onSubmit={handleUpdateTryout}
                          isEdit={true}
                        />
                      )}

                      <DialogFooter className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                        >
                          Batal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog and Button */}
                  <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800"
                        onClick={() => openDeleteDialog(tryout)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Tryout</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus tryout &quot;
                          {selectedTryout?.title}&quot;? Tindakan ini tidak
                          dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteTryout}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Start Tryout Button */}
                  <MulaiTryoutButton
                    className="flex-1"
                    tryoutId={tryout.id}
                    startDate={tryout.start_date}
                    endDate={tryout.end_date}
                  />
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