"use server";

import { prisma } from "@/libs/prisma";
import { EnrichedProduct } from "@/types/types";

/** Tipo auxiliar de los productos en la DB */
type VideojuegoDB = {
  id: bigint;
  nombre: string;
  categoria: string;
  precio: number;
  existencias: number;
  imagenUrl?: string | null;
  num_jugadores: number | null;
  plataforma: string;
};

/**
 * 🔹 Función helper para mapear VideojuegoDB → EnrichedProduct
 */
const mapToEnrichedProduct = (p: VideojuegoDB): EnrichedProduct => ({
  id: p.id,
  productId: p.id.toString(),
  name: p.nombre,
  category: p.categoria,
  price: Number(p.precio),
  quantity: p.existencias,
  num_players: Number(p.num_jugadores),
  total: Number(p.precio) * p.existencias,
  image: p.imagenUrl || "",
  platform: p.plataforma, // Añadir
});

/**
 * 🔹 Obtener todos los productos (videojuegos)
 */
export const getAllProducts = async (): Promise<EnrichedProduct[]> => {
  try {
    const products: VideojuegoDB[] = await prisma.videojuegos.findMany();
    return products.map(mapToEnrichedProduct);
  } catch (error) {
    console.error("Error getting products:", error);
    throw new Error("Failed to fetch products");
  }
};

/**
 * 🔹 Obtener productos por categoría
 */
export const getCategoryProducts = async (
  category: string
): Promise<EnrichedProduct[]> => {
  try {
    const products: VideojuegoDB[] = await prisma.videojuegos.findMany({
      where: { categoria: category },
    });
    return products.map(mapToEnrichedProduct);
  } catch (error) {
    console.error("Error getting category products:", error);
    throw new Error("Failed to fetch category products");
  }
};

/**
 * 🔹 Obtener productos aleatorios (excluyendo uno específico)
 */
export const getRandomProducts = async (
  excludeProductId: bigint
): Promise<EnrichedProduct[]> => {
  try {
    const products: VideojuegoDB[] = await prisma.videojuegos.findMany();

    // Filtrar y barajar aleatoriamente
    const shuffled = products
      .filter((p) => p.id !== excludeProductId)
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    return shuffled.map(mapToEnrichedProduct);
  } catch (error) {
    console.error("Error getting random products:", error);
    throw new Error("Failed to fetch random products");
  }
};

/**
 * 🔹 Obtener un producto por ID
 */
export const getProduct = async (
  id: string | bigint
): Promise<EnrichedProduct> => {
  try {
    const productId: bigint = typeof id === "string" ? BigInt(id) : id;

    const product: VideojuegoDB | null = await prisma.videojuegos.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error(`Product with ID ${id} not found`);

    return mapToEnrichedProduct(product);
  } catch (error) {
    console.error("Error getting product:", error);
    throw new Error("Failed to fetch product");
  }
};

/**
 * 🔹 Obtener productos por plataforma
 */
export const getProductsByPlatform = async (
  platform: string
): Promise<EnrichedProduct[]> => {
  try {
    const products: VideojuegoDB[] = await prisma.videojuegos.findMany({
      where: { plataforma: platform },
    });
    return products.map(mapToEnrichedProduct);
  } catch (error) {
    console.error("Error getting products by platform:", error);
    throw new Error("Failed to fetch products by platform");
  }
};
