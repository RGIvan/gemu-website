"use client";

import Link from "next/link";
import { Images } from "./Images";
import { EnrichedProduct } from "@/types/types";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import type { Session } from "next-auth";

const WishlistButton = dynamic(() => import("../cart/WishlistButton"), {
  loading: () => <Skeleton className="w-5 h-5" />,
});

const DeleteButton = dynamic(() => import("../cart/DeleteButton"), {
  loading: () => <Skeleton className="w-5 h-5" />,
});

const ProductCartInfo = dynamic(() => import("../cart/ProductCartInfo"), {
  loading: () => <Skeleton className="w-24 h-8" />,
});

interface ProductsProps {
  products: EnrichedProduct[];
  session: Session | null;
  wishlist?: string[];
  extraClassname?: string;
  isCartPage?: boolean;
}

export const Products = ({
  products,
  session,
  extraClassname = "",
  isCartPage = false,
}: ProductsProps) => {
  const gridClassname = [
    "grid gap-x-3.5 gap-y-6 sm:gap-y-9",
    extraClassname === "colums-mobile" && "grid-cols-auto-fill-110",
    extraClassname === "cart-ord-mobile" && "grid-cols-1",
    "sm:grid-cols-auto-fill-250",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={gridClassname}>
      {products.map((product, index) => {
        const { category, quantity, productId, image, name, price } = product;

        const productLink = `/${category}/${productId}`;
        const containerClassname = [
          "flex justify-between border border-solid border-border-primary rounded-md overflow-hidden",
          extraClassname === "cart-ord-mobile"
            ? "flex-row sm:flex-col"
            : "flex-col",
        ]
          .filter(Boolean)
          .join(" ");

        const linkClassname =
          extraClassname === "cart-ord-mobile"
            ? "w-6/12 sm:w-full hover:scale-105 transition-all"
            : "hover:scale-105 transition-all";

        const infoClassname = [
          extraClassname === "cart-ord-mobile" ? "w-6/12 sm:w-full" : "",
          "flex justify-between flex-col gap-2.5 p-3.5 bg-background-secondary z-10",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div className={containerClassname} key={index}>
            <Link href={productLink} className={linkClassname}>
              <Images
                image={[image || ""]}
                name={name}
                width={280}
                height={425}
                priority={index === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 1154px) 33vw, (max-width: 1536px) 25vw, 20vw"
                platform={product.platform}
              />
            </Link>

            <div className={infoClassname}>
              <div className="flex justify-between w-full">
                <Link href={productLink} className="w-10/12">
                  <h2 className="text-sm font-semibold truncate">{name}</h2>
                </Link>

                {isCartPage ? (
                  <DeleteButton product={product} />
                ) : (
                  <WishlistButton session={session} productId={productId} />
                )}
              </div>

              <div className="text-sm">
                {isCartPage ? (price * quantity).toFixed(2) : price} €
              </div>

              {isCartPage && <ProductCartInfo product={product} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
