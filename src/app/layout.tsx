import type { Metadata } from 'next';
import { Inter, Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Villa Golondrinas | Alquiler Vacacional Premium',
  description: 'Descubre tu próximo destino de vacaciones. Villa de lujo con vistas espectaculares, piscina privada y todas las comodidades.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let content = null;
  try {
    content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  } catch (error) {
    console.warn("Could not fetch site content during layout render, DB might be down/paused.");
  }

  // Fix: Move the template literal class construction out or format it without escaping backticks
  const bodyClasses = `${outfit.variable} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen bg-[#f9f9f9]`;

  return (
    <html lang="es">
      <body className={bodyClasses}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer
          contactEmail={content?.contactEmail}
          contactPhone={content?.contactPhone}
          contactAddress={content?.contactAddress}
          footerIntro={content?.footerIntro}
        />
      </body>
    </html>
  );
}
