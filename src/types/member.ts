export type MemberStatus =
  | 'Aktif'
  | 'Menunggu Verifikasi'
  | 'Ada Denda'
  | 'Non-Aktif';

export interface Member {
  nis: string;
  name: string;
  classRoom: string;
  activeLoans: number;
  status: MemberStatus;
  createdAt?: string;
  updatedAt?: string;
}
