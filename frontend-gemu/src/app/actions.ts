"use server";

import { prisma } from "@/libs/prisma";
import { EnrichedProduct } from "@/types/types";
import { videojuegos } from "@prisma/client";

/**
 * 🔹 Obtener todos los productos (videojuegos)
 */
export const getAllProducts = async (): Promise<EnrichedProduct[]> => {
  try {
    const products: videojuegos[] = await prisma.videojuegos.findMany();

    return products.map(
      (p): EnrichedProduct => ({
        id: p.id.toString(),
        name: p.nombre,
        category: p.categoria,
        price: p.precio,
        quantity: p.existencias,
        total: p.precio,
        image: [],
      })
    );
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
    const products: videojuegos[] = await prisma.videojuegos.findMany({
      where: { categoria: category },
    });

    return products.map(
      (p): EnrichedProduct => ({
        id: p.id.toString(),
        name: p.nombre,
        category: p.categoria,
        price: p.precio,
        quantity: p.existencias,
        total: p.precio,
        image: [],
      })
    );
  } catch (error) {
    console.error("Error getting category products:", error);
    throw new Error("Failed to fetch category products");
  }
};

/**
 * 🔹 Obtener productos aleatorios (excluyendo uno específico)
 */
export const getRandomProducts = async (
  productId: number
): Promise<EnrichedProduct[]> => {
  try {
    const allProducts: videojuegos[] = await prisma.videojuegos.findMany();

    // Barajar aleatoriamente
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    const randomProducts = shuffled
      .filter((p) => Number(p.id) !== productId)
      .slice(0, 6);

    return randomProducts.map(
      (p): EnrichedProduct => ({
        id: p.id.toString(),
        name: p.nombre,
        category: p.categoria,
        price: p.precio,
        quantity: p.existencias,
        total: p.precio,
        image: [],
      })
    );
  } catch (error) {
    console.error("Error getting random products:", error);
    throw new Error("Failed to fetch random products");
  }
};
