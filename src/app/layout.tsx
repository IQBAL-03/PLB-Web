import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Merriweather } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SISPERPUS - Sistem Informasi Perpustakaan Sekolah",
  description:
    "Sistem Informasi Perpustakaan Sekolah Digital. Temukan, baca, dan pinjam koleksi buku sekolah secara mudah dan terpadu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${merriweather.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="bg-[#F6F2EA] text-stone-800 font-sans antialiased min-h-screen flex flex-col selection:bg-rose-900 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
