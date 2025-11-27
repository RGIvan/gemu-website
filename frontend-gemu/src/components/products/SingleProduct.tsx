"use client";

import { ProductImages } from "@/components/products/ProductImages";
import { EnrichedProduct } from "@/types/types";
import { Session } from "next-auth";
import AddToCart from "../cart/AddToCart";

interface SingleProductProps {
  product: EnrichedProduct;
  session: Session | null;
}

export const SingleProduct = ({ product, session }: SingleProductProps) => {
  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="flex flex-wrap justify-between gap-8">
      {/* Imagen del producto */}
      <div className="grow-999 basis-0">
        <ProductImages name={product.name} selectedVariant={product} />
      </div>

      {/* Información del producto y carrito */}
      <div className="sticky flex flex-col items-center justify-center w-full h-full gap-5 grow basis-600 top-8">
        <div className="w-full border border-solid rounded border-border-primary bg-background-secondary">
          <div className="flex flex-col justify-between gap-3 p-5 border-b border-solid border-border-primary">
            <h1 className="text-base font-semibold">{product.name}</h1>
            <span className="text-sm">{product.price}€</span>
            {product.category && <p className="text-sm">{product.category}</p>}
          </div>

          {/* Añadir al carrito */}
          <AddToCart session={session} product={product} />
        </div>
      </div>
    </div>
  );
};
