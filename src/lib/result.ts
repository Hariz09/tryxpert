import { TryoutResults } from "@/types/result";

// Format time taken
export function formatTimeTaken(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours} jam ${minutes} menit ${secs} detik`;
  } else if (minutes > 0) {
    return `${minutes} menit ${secs} detik`;
  } else {
    return `${secs} detik`;
  }
}

// Get score category based on percentage
export function getScoreCategory(percentage: number): string {
  if (percentage >= 90) return "Sangat Baik";
  if (percentage >= 75) return "Baik";
  if (percentage >= 60) return "Cukup";
  if (percentage >= 40) return "Kurang";
  return "Perlu Banyak Perbaikan";
}

// Get badge variant based on difficulty
export function getDifficultyVariant(
  difficulty: string
): "mudah" | "menengah" | "sulit" | "default" {
  switch (difficulty) {
    case "Mudah":
      return "mudah";
    case "Menengah":
      return "menengah";
    case "Sulit":
      return "sulit";
    default:
      return "default";
  }
}

// Get recommendations based on result
export function getRecommendations(results: TryoutResults): string[] {
  const percentage = results.percentageScore;

  if (percentage >= 85) {
    return [
      "Pertahankan hasil yang baik! Coba cari tryout dengan tingkat kesulitan yang lebih tinggi.",
      "Fokus pada soal-soal yang masih salah untuk perbaikan lebih lanjut.",
      "Bagikan teknik belajar Anda kepada teman-teman untuk membantu mereka.",
    ];
  } else if (percentage >= 70) {
    return [
      "Hasil Anda sudah baik, tingkatkan dengan memperdalam pemahaman konsep.",
      "Berlatih soal-soal dengan variasi yang lebih beragam.",
      "Catat dan pelajari kembali soal-soal yang masih salah.",
    ];
  } else if (percentage >= 50) {
    return [
      "Tingkatkan pemahaman pada materi yang masih lemah.",
      "Atur jadwal belajar yang lebih terstruktur untuk meningkatkan performa.",
      "Coba gunakan metode belajar yang berbeda seperti mind mapping atau diskusi kelompok.",
    ];
  } else {
    return [
      "Fokus pada konsep dasar materi terlebih dahulu sebelum mengerjakan soal-soal kompleks.",
      "Minta bantuan tutor atau guru untuk penjelasan materi yang sulit.",
      "Gunakan tryout dengan tingkat kesulitan lebih rendah untuk membangun kepercayaan diri.",
    ];
  }
}