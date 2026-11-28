export interface Volume {
  volumeNumber: number;
  volumeTitle: string;
  coverImg: string;
  stock: number;
  description: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  genres: string[];
  language: string;
  price: number;
  year: string;
  shelf: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  borrowCount?: number;
  badge?: string;
  synopsis: string;
  coverImg: string;
  cloudinaryPublicId?: string;
  isPopular: boolean;
  isSpotlight?: boolean;
  hasVolumes: boolean;
  volumes: Volume[];
}

export type BookCategory =
  | 'Semua Koleksi'
  | 'Komik & Manga'
  | 'Fiksi & Sastra'
  | 'Sains & Teknologi'
  | 'Sejarah & Biografi'
  | 'Pengembangan Diri'
  | 'Buku Referensi';
