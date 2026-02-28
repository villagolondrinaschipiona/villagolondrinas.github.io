'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImage {
    url: string;
    title: string;
}

interface SlideshowProps {
    images: GalleryImage[];
    fallbackImage: string;
}

export default function GallerySlideshow({ images, fallbackImage }: SlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const validImages = images?.filter(img => img.url) || [];

    // If no gallery images, just show the aboutImage fallback
    if (validImages.length === 0) {
        return (
            <img
                src={fallbackImage}
                alt="Interior Villa"
                className="rounded-lg shadow-2xl z-10 relative object-cover h-[600px] w-full"
            />
        );
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % validImages.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(timer);
    }, [validImages.length]);

    return (
        <div className="relative rounded-lg shadow-2xl z-10 h-[600px] w-full overflow-hidden bg-gray-100">
            {validImages.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <img
                        src={image.url}
                        alt={image.title || 'Villa Interior'}
                        className="w-full h-full object-cover"
                    />
                    {image.title && (
                        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 text-sm rounded backdrop-blur-sm">
                            {image.title}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
