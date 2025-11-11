"use server";

import { prisma } from "@/libs/prisma";
import { EnrichedProduct } from "@/types/types";

/**
 * 🔹 Obtener todos los productos (videojuegos)
 */
export const getAllProducts = async (): Promise<EnrichedProduct[]> => {
  try {
    const products = await prisma.videojuegos.findMany();

    return products.map(
      (p: {
        id: bigint;
        nombre: string;
        categoria: string;
        precio: number;
        existencias: number;
      }): EnrichedProduct => ({
        id: p.id,
        _id: p.id.toString(),
        name: p.nombre,
        category: p.categoria,
        price: p.precio,
        quantity: p.existencias,
        total: p.precio * p.existencias,
        image: [],
        productId: p.id.toString(),
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
    const products = await prisma.videojuegos.findMany({
      where: { categoria: category },
    });

    return products.map(
      (p): EnrichedProduct => ({
        id: p.id,
        _id: p.id.toString(),
        name: p.nombre,
        category: p.categoria,
        price: p.precio,
        quantity: p.existencias,
        total: p.precio * p.existencias,
        image: [],
        productId: p.id.toString(),
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
  productId: bigint
): Promise<EnrichedProduct[]> => {
  try {
    const allProducts = await prisma.videojuegos.findMany();

    // Barajar aleatoriamente
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    const randomProducts = shuffled
      .filter((p) => p.id !== productId)
      .slice(0, 6);

    return randomProducts.map(
      (p): EnrichedProduct => ({
        id: p.id,
        _id: p.id.toString(),
        name: p.nombre,
        category: p.categoria,
        price: p.precio,
        quantity: p.existencias,
        total: p.precio * p.existencias,
        image: [],
        productId: p.id.toString(),
      })
    );
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
    const productId = typeof id === "string" ? BigInt(id) : id;
    const product = await prisma.videojuegos.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return {
      id: product.id,
      _id: product.id.toString(),
      name: product.nombre,
      category: product.categoria,
      price: product.precio,
      quantity: product.existencias,
      total: product.precio * product.existencias,
      image: [],
      productId: product.id.toString(),
    };
  } catch (error) {
    console.error("Error getting product:", error);
    throw new Error("Failed to fetch product");
  }
};
