import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Super-Admin Panel',
  description: '',
  manifest: "/manifest.json",
  themeColor: "#A8E0D8",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}<ToastContainer position="top-right" autoClose={3000} /></body>
    </html>
  );
} 