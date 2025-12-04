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
    <div className="flex flex-col items-center justify-center gap-8 lg:flex-row">
      {/* Imagen del producto */}
      <div className="w-full max-w-[400px]">
        <ProductImages name={product.name} selectedVariant={product} />
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center gap-5">
        <div className="w-full border border-solid rounded border-border-primary bg-background-secondary">
          <div className="flex flex-col items-center gap-3 p-5 text-center border-b border-solid border-border-primary">
            <h1 className="text-base font-semibold">{product.name}</h1>
            <span className="text-sm">{product.price}€</span>
            {product.category && <p className="text-sm">{product.category}</p>}
          </div>

          {/* Añadir al carrito */}
          <div className="p-5">
            <AddToCart session={session} product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};
