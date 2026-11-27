export type TransactionStatus =
  | 'Dipinjam'
  | 'Kembali'
  | 'Terlambat';

export interface Transaction {
  id: string;
  nis: string;
  studentName: string;
  classRoom: string;
  bookId: string;
  bookTitle: string;
  volumeNumber?: number | null;
  price: number;
  loanDate: string; // YYYY-MM-DD
  dueDate: string;  // YYYY-MM-DD
  returnDate?: string | null;
  status: TransactionStatus;
  fine: number;
  finePaid: boolean;
  createdAt?: string;
  updatedAt?: string;
}
