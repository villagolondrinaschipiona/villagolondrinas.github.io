'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function GalleryPage() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch('/api/content');
                const data = await res.json();
                setImages(data.galleryImages || []);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGallery();
    }, []);

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setSelectedIndex(null);
        document.body.style.overflow = 'unset';
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>;
    }

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
                        let customClass = "aspect-[4/3]";
                        if (index === 2) customClass = "lg:row-span-2 lg:aspect-auto";
                        if (index === 5) customClass = "md:col-span-2 lg:col-span-1";
                        if (index === 6) customClass = "md:col-span-2 md:aspect-[21/9]";

                        return (
                            <div
                                key={index}
                                onClick={() => openLightbox(index)}
                                className={`group relative overflow-hidden rounded-lg shadow-md cursor-pointer ${customClass}`}
                            >
                                <img
                                    src={img.url}
                                    alt={img.title || 'Galería'}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium tracking-wider uppercase text-sm">
                                        {img.title || 'Ver Foto'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Fullscreen Lightbox */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-fade-in"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full"
                        onClick={closeLightbox}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Image Container */}
                    <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center px-4 md:px-16" onClick={e => e.stopPropagation()}>
                        <img
                            src={images[selectedIndex].url}
                            alt={images[selectedIndex].title || 'Foto ampliada'}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                        />

                        {/* Title Bar */}
                        {images[selectedIndex].title && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full text-white/90 text-sm tracking-widest uppercase">
                                {images[selectedIndex].title}
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        <button
                            className="absolute left-4 md:left-8 text-white/50 hover:text-white hover:bg-black/20 p-3 rounded-full transition-all"
                            onClick={prevImage}
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>
                        <button
                            className="absolute right-4 md:right-8 text-white/50 hover:text-white hover:bg-black/20 p-3 rounded-full transition-all"
                            onClick={nextImage}
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-6 left-6 text-white/50 font-mono text-sm">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
