import { prisma } from "@/libs/prisma";
import { EnrichedProduct } from "@/types/types";

export async function getAllProducts(): Promise<EnrichedProduct[]> {
  const products = await prisma.videojuegos.findMany();

  const enrichedProducts: EnrichedProduct[] = products.map(
    (p: {
      id: bigint;
      nombre: string;
      categoria: string;
      precio: number;
      num_jugadores: number | null;
      imagenUrl?: string | null;
    }) => ({
      id: p.id,
      productId: p.id.toString(),
      name: p.nombre,
      category: p.categoria,
      price: p.precio,
      quantity: 0,
      num_players: 0,
      total: 0,
      image: p.imagenUrl || "",
    })
  );

  return enrichedProducts;
}

export async function getProductById(
  productId: bigint
): Promise<EnrichedProduct | null> {
  const p = await prisma.videojuegos.findUnique({
    where: { id: productId },
  });

  if (!p) return null;

  return {
    id: p.id,
    productId: p.id.toString(),
    name: p.nombre,
    category: p.categoria,
    price: p.precio,
    num_players: 0,
    quantity: 0,
    total: 0,
    image: p.imagenUrl || "",
  };
}
