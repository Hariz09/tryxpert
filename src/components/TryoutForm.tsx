"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus, Calendar, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Define Zod schema for form validation - removed total_questions
const tryoutFormSchema = z.object({
  title: z.string().min(1, { message: "Judul tryout harus diisi" }),
  subject: z.string().min(1, { message: "Mata pelajaran harus diisi" }),
  start_date: z.date({
    required_error: "Tanggal mulai harus diisi",
  }),
  end_date: z.date({
    required_error: "Tanggal berakhir harus diisi",
  }),
  duration: z.number()
    .min(1, { message: "Durasi minimal 1 menit" })
    .max(1440, { message: "Durasi maksimal 1440 menit (24 jam)" }),
  difficulty: z.enum(["Mudah", "Menengah", "Sulit"], {
    message: "Pilih tingkat kesulitan yang valid",
  }),
  participants: z.number().min(0),
  syllabus: z.array(z.string()),
  features: z.array(z.string()),
  description: z.string().max(2000, { message: "Deskripsi maksimal 2000 karakter" }).optional(),
})

// Define TypeScript type from the Zod schema
export type TryoutFormValues = z.infer<typeof tryoutFormSchema>

interface TryoutFormProps {
  defaultValues: Partial<TryoutFormValues>;
  onSubmit: (values: TryoutFormValues) => Promise<{id: string} | undefined>;
  isEdit?: boolean;
}

export default function TryoutForm({ defaultValues, onSubmit, isEdit = false }: TryoutFormProps) {
  const router = useRouter();
  const [syllabusItems, setSyllabusItems] = useState<string[]>(defaultValues.syllabus || []);
  const [featureItems, setFeatureItems] = useState<string[]>(defaultValues.features || []);
  const [syllabusInput, setSyllabusInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [charCount, setCharCount] = useState(defaultValues.description?.length || 0);
  
  // State for time inputs
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");


  // Initialize form with React Hook Form and Zod resolver
  const form = useForm<TryoutFormValues>({
    resolver: zodResolver(tryoutFormSchema),
    defaultValues: {
      title: "",
      subject: "",
      start_date: undefined,
      end_date: undefined,
      duration: 60,
      difficulty: "Mudah",
      participants: 0,
      syllabus: [],
      features: [],
      description: "",
      ...defaultValues
    },
  });

  // Initialize time values from default dates if they exist
  // For display, subtract 7 hours from the stored time to reverse the timezone adjustment
  useEffect(() => {
    if (defaultValues.start_date && defaultValues.start_date instanceof Date) {
      let hours = defaultValues.start_date.getHours() - 7; // Subtract 7 hours to display local time
      if (hours < 0) hours += 24; // Handle hour wrap around for negative values
      const minutes = defaultValues.start_date.getMinutes().toString().padStart(2, '0');
      setStartTime(`${hours.toString().padStart(2, '0')}:${minutes}`);
    }
    
    if (defaultValues.end_date && defaultValues.end_date instanceof Date) {
      let hours = defaultValues.end_date.getHours() - 7; // Subtract 7 hours to display local time
      if (hours < 0) hours += 24; // Handle hour wrap around for negative values
      const minutes = defaultValues.end_date.getMinutes().toString().padStart(2, '0');
      setEndTime(`${hours.toString().padStart(2, '0')}:${minutes}`);
    }
  }, [defaultValues.start_date, defaultValues.end_date]);

  // Handle adding a syllabus item
  const handleAddSyllabus = () => {
    if (syllabusInput.trim() !== "") {
      const newSyllabusItems = [...syllabusItems, syllabusInput.trim()];
      setSyllabusItems(newSyllabusItems);
      form.setValue("syllabus", newSyllabusItems);
      setSyllabusInput("");
    }
  };

  // Handle removing a syllabus item
  const handleRemoveSyllabus = (index: number) => {
    const newSyllabusItems = syllabusItems.filter((_, i) => i !== index);
    setSyllabusItems(newSyllabusItems);
    form.setValue("syllabus", newSyllabusItems);
  };

  // Handle adding a feature item
  const handleAddFeature = () => {
    if (featureInput.trim() !== "") {
      const newFeatureItems = [...featureItems, featureInput.trim()];
      setFeatureItems(newFeatureItems);
      form.setValue("features", newFeatureItems);
      setFeatureInput("");
    }
  };

  // Handle removing a feature item
  const handleRemoveFeature = (index: number) => {
    const newFeatureItems = featureItems.filter((_, i) => i !== index);
    setFeatureItems(newFeatureItems);
    form.setValue("features", newFeatureItems);
  };

  // Handle description change and update character count
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharCount(value.length);
    form.setValue("description", value);
  };

  // Form submission handler
  const handleSubmit = async (values: TryoutFormValues) => {
    // Make sure the form has the latest syllabus and features arrays
    values.syllabus = syllabusItems;
    values.features = featureItems;
    
    // Combine date and time for start_date and end_date, adding 7 hours to adjust timezone
    if (values.start_date) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date(values.start_date);
      startDate.setHours(hours + 7, minutes, 0, 0); // Add 7 hours for timezone adjustment
      values.start_date = startDate;
    }
    
    if (values.end_date) {
      const [hours, minutes] = endTime.split(":").map(Number);
      const endDate = new Date(values.end_date);
      endDate.setHours(hours + 7, minutes, 0, 0); // Add 7 hours for timezone adjustment
      values.end_date = endDate;
    }
    
    // Add timestamps for created_at and updated_at
    const finalValues = {
      ...values,
      ...(isEdit 
        ? { updated_at: new Date().toISOString() } 
        : { created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    };
    
    // Submit form and wait for response
    try {
      const result = await onSubmit(finalValues as TryoutFormValues);
      
      // If result exists and has an id, redirect to edit page
      if (result && result.id) {
        router.push(`/tryout/edit/${result.id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Tryout</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul tryout" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mata Pelajaran</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan mata pelajaran" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Mulai</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Waktu Mulai</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <Clock className="ml-2 h-4 w-4 opacity-50" />
                </div>
              </FormControl>
            </FormItem>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Berakhir</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Waktu Berakhir</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <Clock className="ml-2 h-4 w-4 opacity-50" />
                </div>
              </FormControl>
            </FormItem>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durasi (menit)</FormLabel>
                <FormControl>
                  <Input
                    type="number" 
                    placeholder="Durasi dalam menit"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 60)}
                  />
                </FormControl>
              <FormDescription>
                *Maks 1440 menit / 24 jam
              </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tingkat Kesulitan</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tingkat kesulitan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mudah">Mudah</SelectItem>
                    <SelectItem value="Menengah">Menengah</SelectItem>
                    <SelectItem value="Sulit">Sulit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Syllabus field - expandable array */}
        <FormField
          control={form.control}
          name="syllabus"
          render={() => (
            <FormItem>
              <FormLabel>Silabus</FormLabel>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Tambahkan poin silabus"
                    value={syllabusInput}
                    onChange={(e) => setSyllabusInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSyllabus();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddSyllabus}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {syllabusItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <span>{item}</span>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSyllabus(index)}
                        className="h-5 w-5 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Features field - expandable array */}
        <FormField
          control={form.control}
          name="features"
          render={() => (
            <FormItem>
              <FormLabel>Fitur</FormLabel>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Tambahkan fitur tryout"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddFeature}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {featureItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <span>{item}</span>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                        className="h-5 w-5 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Deskripsi tryout..." 
                  rows={4} 
                  {...field} 
                  value={field.value || ''}
                  onChange={handleDescriptionChange}
                  maxLength={2000}
                />
              </FormControl>
              <FormDescription className="flex justify-end">
                {charCount}/2000 karakter
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Simpan</Button>
      </form>
    </Form>
  )
}