"use client";

import { Skeleton } from "../ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Images } from "./Images";
import { EnrichedProduct } from "@/types/types";

interface ProductImagesProps {
  name: string;
  selectedVariant: EnrichedProduct | null;
  platform?: string;
}

export const ProductImages = ({
  name,
  selectedVariant,
  platform,
}: ProductImagesProps) => {
  // Si no hay imagen disponible
  if (!selectedVariant?.image) {
    return (
      <Skeleton className="w-full rounded-b-none aspect-square min-w-[250px] lg:min-w-[400px]" />
    );
  }

  // Como solo hay una imagen ahora
  const image = selectedVariant.image;

  return (
    <>
      {/* Carousel para móvil */}
      <div className="flex lg:hidden">
        <Carousel
          className="w-full min-w-[250px] rounded-md overflow-hidden"
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent>
            <CarouselItem className="pl-0">
              <Images
                image={[image]}
                name={`${name} - Image 1`}
                width={384}
                height={576}
                priority={true}
                sizes="(max-width: 994px) 100vw, (max-width: 1304px) 50vw, (max-width: 1500px) 25vw, 33vw"
                platform={platform}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      {/* Grid para escritorio */}
      <div className="lg:grid hidden grid-cols-1 gap-0.5 min-w-[400px] max-w-[500px]">
        <div className="inline-block w-full max-w-2xl mx-auto overflow-hidden rounded">
          <Images
            image={[image]}
            name={`${name} - Image 1`}
            width={850}
            height={1275}
            priority={true}
            sizes="(max-width: 1024px) 100vw, (max-width: 1300px) 50vw, (max-width: 1536px) 33vw"
            platform={platform}
          />
        </div>
      </div>
    </>
  );
};
