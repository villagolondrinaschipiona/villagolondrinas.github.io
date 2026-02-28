import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    footerIntro?: string;
}

export default function Footer({ contactEmail, contactPhone, contactAddress, footerIntro }: FooterProps) {
    return (
        <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div>
                        <span className="heading-font text-2xl font-semibold tracking-wider text-[#2c3e50]">VILLA GOLONDRINAS</span>
                        <p className="mt-4 text-gray-500 font-light leading-relaxed max-w-xs" dangerouslySetInnerHTML={{ __html: footerIntro || 'Tu destino premium para vacaciones inolvidables.' }} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">Enlaces Rápidos</h4>
                        <ul className="space-y-3 font-light text-gray-500">
                            <li><Link href="/" className="hover:text-[#d4af37] transition">Inicio</Link></li>
                            <li><Link href="/gallery" className="hover:text-[#d4af37] transition">Galería / Casa</Link></li>
                            <li><Link href="/book" className="hover:text-[#d4af37] transition">Reservas</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">Contacto</h4>
                        <ul className="space-y-3 font-light text-gray-500">
                            <li className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-[#d4af37]" />
                                {contactAddress || 'Chipiona, Cádiz, España'}
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-[#d4af37]" />
                                {contactPhone || '+34 615 31 71 37'}
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-[#d4af37]" />
                                <a href={`mailto:${contactEmail || 'villagolondrinaschipiona@gmail.com'}`} className="hover:text-[#d4af37] transition">{contactEmail || 'villagolondrinaschipiona@gmail.com'}</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Villa Golondrinas. Todos los derechos reservados.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0 items-center">
                        <Link href="/admin/login" className="text-gray-500 hover:text-[#d4af37] transition text-xs opacity-50 hover:opacity-100 flex items-center pr-4">
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
