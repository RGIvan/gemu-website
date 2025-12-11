"use client";

import React, { useState } from "react";
import Image, { ImageLoader } from "next/image";
import { Skeleton } from "../ui/skeleton";

const cloudinaryLoader: ImageLoader = ({ src, width, quality }) => {
  const params = [
    "f_auto",
    "c_limit",
    "w_" + width,
    "q_" + (quality || "auto"),
  ];
  const normalizeSrc = (src: string) => (src[0] === "/" ? src.slice(1) : src);

  return `https://res.cloudinary.com/${
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  }/image/upload/${params.join(",")}/${normalizeSrc(src)}`;
};

interface ImagesProps {
  image: string[]; // array de URLs
  platform: string; // PS1, PS2, etc.
  width: number;
  height: number;
  priority?: boolean;
  sizes: string;
}

export const Images = ({
  image,
  platform,
  width,
  height,
  priority = false,
  sizes,
}: ImagesProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoadComplete = () => setImageLoaded(true);

  // Tomamos la primera URL válida o fallback
  const imageUrl =
    image[0] && image[0].trim() !== "" ? image[0] : "/placeholder.png";

  // Determinamos la clase de aspecto según la plataforma
  const aspectClass = (() => {
    switch (platform.toUpperCase()) {
      case "PlayStation 2":
        return "aspect-[2/3]";
      case "PlayStation":
        return "aspect-[5/7]";
      default:
        return "aspect-square";
    }
  })();

  return (
    <div className={`relative w-full max-w-img ${aspectClass}`}>
      <Image
        loader={cloudinaryLoader}
        src={imageUrl}
        alt={`${platform} cover`}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="object-cover w-full h-full brightness-90"
        onLoad={handleImageLoadComplete}
      />
      {!imageLoaded && (
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          <Skeleton className="w-full h-full rounded-b-none" />
        </div>
      )}
    </div>
  );
};
