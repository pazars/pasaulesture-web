"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryProps {
    images: string[];
    title?: string;
}

export default function Gallery({ images, title }: GalleryProps) {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    const openLightbox = (index: number) => setSelectedImage(index);
    const closeLightbox = () => setSelectedImage(null);
    const nextImage = () => setSelectedImage((prev) => (prev !== null ? (prev + 1) % images.length : null));
    const prevImage = () => setSelectedImage((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));

    return (
        <section className="py-16 px-6 max-w-5xl mx-auto">
            {title && (
                <div className="text-center mb-10">
                    <h2 className="font-display text-4xl sm:text-5xl text-beige mb-3">{title}</h2>
                    <div className="section-divider w-24 mx-auto" />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((src, index) => (
                    <div
                        key={src}
                        className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-white/5"
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={src}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedImage !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors z-[60]"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors z-[60]"
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors z-[60]"
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
                        <Image
                            src={images[selectedImage]}
                            alt={`Gallery image ${selectedImage + 1} large`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium">
                        {selectedImage + 1} / {images.length}
                    </div>
                </div>
            )}
        </section>
    );
}
