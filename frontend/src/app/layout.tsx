import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GitMaps - Semantic Map of GitHub',
  description: 'Explore GitHub repositories through an interactive semantic map powered by AI embeddings and clustering.',
};

export const viewport: Viewport = {
  themeColor: '#060A10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}