import type { Metadata } from 'next';
import { Inter, Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Villa Serenity | Alquiler Vacacional Premium',
  description: 'Descubre tu próximo destino de vacaciones. Villa de lujo con vistas espectaculares, piscina privada y todas las comodidades.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fix: Move the template literal class construction out or format it without escaping backticks
  const bodyClasses = `${outfit.variable} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen bg-[#f9f9f9]`;

  return (
    <html lang="es">
      <body className={bodyClasses}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
