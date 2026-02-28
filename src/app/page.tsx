import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/db";
import { ChevronDown, Users, BedDouble, Bath, Waves, Wifi, ChefHat, CarFront, ArrowRight } from "lucide-react";

// Server Component
export default function Home() {
  const content = getContent();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {/* Using img tag to support external URLs easily without configuring next/image domains for this demo */}
          <img
            src={content.heroImage}
            alt="Villa Exterior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 animate-fade-in">
          <span className="text-[#d4af37] tracking-[0.2em] text-sm uppercase font-semibold block mb-4">
            {content.heroTagline}
          </span>
          <h1
            className="text-5xl md:text-7xl text-white font-bold mb-6 drop-shadow-lg heading-font leading-tight"
            dangerouslySetInnerHTML={{ __html: content.heroTitle }}
          />
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {content.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="bg-[#d4af37] hover:bg-[#c5a028] text-white px-8 py-4 rounded-sm transition text-sm uppercase tracking-widest font-medium shadow-lg hover:-translate-y-0.5 transform duration-200">
              Comprobar Disponibilidad
            </Link>
            <Link href="/gallery" className="glass text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-sm transition text-sm uppercase tracking-widest font-medium">
              Ver Galería
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <a href="#about" className="opacity-70 hover:opacity-100 transition focus:outline-none">
            <ChevronDown className="w-8 h-8" />
          </a>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src={content.aboutImage}
                alt="Interior Villa"
                className="rounded-lg shadow-2xl z-10 relative object-cover h-[600px] w-full"
              />
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-[#d4af37] rounded-lg z-0 hidden lg:block"></div>
            </div>

            <div className="px-4 lg:px-8">
              <span className="text-[#d4af37] tracking-widest text-sm uppercase font-semibold">Bienvenidos a Casa</span>
              <h2 className="text-4xl md:text-5xl text-[#2c3e50] mt-4 mb-6 heading-font font-medium">
                {content.aboutTitle}
              </h2>
              <p className="text-gray-600 mb-6 text-lg font-light leading-relaxed">
                {content.aboutIntro}
              </p>
              <p className="text-gray-600 mb-10 text-lg font-light leading-relaxed">
                {content.aboutDetails}
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                    <Users />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Capacidad</h4>
                    <p className="text-sm text-gray-500">Hasta 8 personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                    <BedDouble />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Habitaciones</h4>
                    <p className="text-sm text-gray-500">4 Suites dobles</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                    <Bath />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Baños</h4>
                    <p className="text-sm text-gray-500">5 Baños completos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                    <Waves />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Piscina</h4>
                    <p className="text-sm text-gray-500">Privada y climatizada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#d4af37] tracking-widest text-sm uppercase font-semibold">Servicios Excepcionales</span>
          <h2 className="text-4xl text-[#2c3e50] mt-4 mb-16 heading-font font-medium">Comodidades Destacadas</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
              <div className="w-14 h-14 bg-[#f9f9f9] rounded-2xl flex items-center justify-center text-[#d4af37] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 heading-font">Conectividad Total</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Fibra óptica de alta velocidad 1Gbps en toda la propiedad, ideal para disfrutar o teletrabajar sin interrupciones.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
              <div className="w-14 h-14 bg-[#f9f9f9] rounded-2xl flex items-center justify-center text-[#d4af37] mb-6 group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 heading-font">Cocina Gourmet</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Totalmente equipada con electrodomésticos de última generación, isla central y vinoteca. Perfecta para amantes de la gastronomía.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
              <div className="w-14 h-14 bg-[#f9f9f9] rounded-2xl flex items-center justify-center text-[#d4af37] mb-6 group-hover:scale-110 transition-transform duration-300">
                <CarFront className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 heading-font">Aparcamiento</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Garaje privado para dos vehículos y zona exterior de aparcamiento. Incluye cargador para vehículos eléctricos.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/gallery" className="inline-flex items-center font-medium text-[#d4af37] hover:text-[#2c3e50] transition-colors gap-2">
              Ver todas las comodidades y fotos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2c3e50] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-medium heading-font mb-6">Reserva tu estancia de ensueño hoy mismo</h2>
          <p className="text-xl text-gray-300 font-light mb-10">Las fechas se llenan rápidamente. Asegura tu paraíso particular ahora.</p>
          <Link href="/book" className="inline-block bg-[#d4af37] hover:bg-white hover:text-[#2c3e50] text-white px-10 py-4 rounded-sm transition-all duration-300 text-sm uppercase tracking-widest font-bold shadow-2xl">
            Consultar el Calendario
          </Link>
        </div>
      </section>
    </div>
  );
}
