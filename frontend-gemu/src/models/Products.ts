import { prisma } from "@/libs/prisma";
import { EnrichedProduct } from "@/types/types";

export async function getAllProducts(): Promise<EnrichedProduct[]> {
  // Traemos los videojuegos de Prisma
  const products = await prisma.videojuegos.findMany();

  // Convertimos a EnrichedProduct
  const enrichedProducts: EnrichedProduct[] = products.map(
    (p: {
      id: bigint;
      nombre: string;
      categoria: string;
      precio: number;
      imagenUrl?: string | null;
    }) => ({
      productId: p.id.toString(),
      _id: p.id.toString(),
      id: p.id,
      name: p.nombre,
      category: p.categoria,
      price: p.precio,
      quantity: 0, // por defecto 0 en carrito
      total: 0,
      image: p.imagenUrl ? [p.imagenUrl] : [],
      sizes: [], // si manejas tamaños, puedes rellenar
      variants: [], // si manejas variantes, puedes rellenar
    })
  );

  return enrichedProducts;
}

// Si quieres un producto por id
export async function getProductById(
  productId: bigint
): Promise<EnrichedProduct | null> {
  const p = await prisma.videojuegos.findUnique({
    where: { id: productId },
  });

  if (!p) return null;

  return {
    productId: p.id.toString(),
    _id: p.id.toString(),
    id: p.id,
    name: p.nombre,
    category: p.categoria,
    price: p.precio,
    quantity: 0,
    total: 0,
    image: p.imagenUrl ? [p.imagenUrl] : [],
    sizes: [],
    variants: [],
  };
}
