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
  image: string[];
  name: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes: string;
  platform?: string;
}

export const Images = ({
  image,
  name,
  width,
  height,
  priority = false,
  sizes,
  platform,
}: ImagesProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoadComplete = () => setImageLoaded(true);

  const imageUrl =
    image[0] && image[0].trim() !== "" ? image[0] : "/placeholder.png";

  // Ajustar aspect ratio según plataforma
  const isPS2 = platform?.toLowerCase().includes("playstation 2");
  const aspectClass = isPS2 ? "aspect-[3/4]" : "aspect-square";

  return (
    <div className={!imageLoaded ? "relative" : ""}>
      <Image
        loader={cloudinaryLoader}
        src={imageUrl}
        alt={name}
        width={width}
        height={isPS2 ? Math.round(height * 1.33) : height}
        priority={priority}
        sizes={sizes}
        className={`object-cover w-full max-w-img ${aspectClass} brightness-90`}
        onLoad={handleImageLoadComplete}
      />
      {!imageLoaded && (
        <div
          className={`absolute top-0 right-0 w-full ${aspectClass} bg-black`}
        >
          <Skeleton className={`w-full rounded-b-none ${aspectClass}`} />
        </div>
      )}
    </div>
  );
};
