import { getContent } from "@/lib/db";
import Image from "next/image";

export default function GalleryPage() {
    const content = getContent();
    const images = content.galleryImages || [];

    return (
        <div className="bg-[#f9f9f9] min-h-screen">
            {/* Header */}
            <header className="bg-[#2c3e50] text-white py-16 text-center animate-fade-in pt-32">
                <h1 className="text-4xl md:text-5xl heading-font font-medium mb-4">Descubre Villa Golondrinas</h1>
                <p className="text-gray-300 font-light text-lg max-w-2xl mx-auto px-4">Un recorrido visual por nuestros espacios diseñados para su máximo confort.</p>
            </header>

            {/* Gallery Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {images.map((img, index) => {
                        // Add some varied sizing classes based on index to mimic original masonry-like grid
                        let customClass = "aspect-[4/3]";
                        if (index === 2) customClass = "lg:row-span-2 lg:aspect-auto";
                        if (index === 5) customClass = "md:col-span-2 lg:col-span-1";
                        if (index === 6) customClass = "md:col-span-2 md:aspect-[21/9]";

                        return (
                            <div key={index} className={`group relative overflow-hidden rounded-lg shadow-md cursor-pointer ${customClass}`}>
                                <img
                                    src={img.url}
                                    alt={img.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium tracking-wider uppercase text-sm">
                                        {img.title}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </main >
        </div >
    );
}
