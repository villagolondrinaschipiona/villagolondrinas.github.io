import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div>
                        <span className="heading-font text-2xl font-semibold tracking-wider text-[#2c3e50]">VILLA SERENITY</span>
                        <p className="mt-4 text-gray-500 font-light leading-relaxed max-w-xs">
                            Tu destino premium para vacaciones inolvidables. Diseño, confort y tranquilidad absoluta en un entorno privilegiado.
                        </p>
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
                                Calle Paraíso 123, Costa del Sol
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-[#d4af37]" />
                                +34 600 000 000
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-[#d4af37]" />
                                reservas@villaserenity.com
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Villa Serenity. Todos los derechos reservados.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0 items-center">
                        <a href="#" className="hover:text-[#d4af37] transition"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-[#d4af37] transition"><Facebook className="w-5 h-5" /></a>
                        {/* Hidden admin link */}
                        <Link href="/admin/login" className="opacity-10 hover:opacity-100 ml-4 transition">Admin</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
