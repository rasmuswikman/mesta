import type { Metadata } from 'next';
import { Inria_Serif } from 'next/font/google';
import './globals.css';

const inriaSerif = Inria_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'mesta',
  description: 'Lunch?',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inriaSerif.className} bg-stone-50 antialiased`}>{children}</body>
    </html>
  );
}
