import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HealthLens AI — Family Medical History & AI Care Companion',
  description: 'Upload, organize, and understand your family\'s medical reports with AI-powered OCR, classification, trend detection, and smart search.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
