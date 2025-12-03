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
  name: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes: string;
}

export const Images = ({
  image,
  name,
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

  return (
    <div className={!imageLoaded ? "relative" : ""}>
      <Image
        loader={cloudinaryLoader}
        src={imageUrl}
        alt={name}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="w-full max-w-img aspect-[2/3] brightness-90"
        onLoad={handleImageLoadComplete}
      />
      {!imageLoaded && (
        <div className="absolute top-0 right-0 w-full aspect-[2/3] bg-black">
          <Skeleton className="w-full aspect-[2/3] rounded-b-none" />
        </div>
      )}
    </div>
  );
};
