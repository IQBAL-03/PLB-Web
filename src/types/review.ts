export interface BookReview {
  id: string;
  bookId: string;
  nis: string;
  studentName: string;
  rating: number; // 1-5
  reviewText: string;
  createdAt: string;
  updatedAt?: string;
}
