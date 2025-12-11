"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { Session } from "next-auth";
import { prisma } from "@/libs/prisma";
import { Cart, CartItem, EnrichedProduct, Videojuego } from "@/types/types";

// -----------------------------
// Helper: obtener carrito seguro
// -----------------------------
async function getCart(userId: string): Promise<Cart> {
  if (!userId) return { userId: "unknown", items: [] };

  try {
    // Obtenemos el valor del KV de forma segura
    const data = await kv.get(`cart-${userId}`);

    // Si no hay valor, devolvemos carrito vacío
    if (!data) return { userId, items: [] };

    // Si ya es un objeto (mock), lo retornamos
    if (typeof data === "object") {
      return (data as Cart).items ? (data as Cart) : { userId, items: [] };
    }

    // Si es string, parseamos seguro
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (!parsed || !parsed.items) return { userId, items: [] };
        return parsed as Cart;
      } catch {
        console.warn(
          `KV data corrupto para cart-${userId}, creando carrito vacío.`
        );
        return { userId, items: [] };
      }
    }

    // Valor inesperado
    return { userId, items: [] };
  } catch (err) {
    console.error("Error leyendo el carrito desde KV:", err);
    return { userId, items: [] };
  }
}

// -----------------------------
// Guardar carrito seguro
// -----------------------------
async function saveCart(cart: Cart) {
  try {
    await kv.set(`cart-${cart.userId}`, cart);
  } catch (err) {
    console.error("Error guardando el carrito en KV:", err);
  }
}

// -----------------------------
// Obtener items del carrito con info de producto
// -----------------------------
export async function getItems(userId: string): Promise<EnrichedProduct[]> {
  console.log("=== getItems ===");
  console.log("1. userId:", userId);

  if (!userId) return [];

  const cart = await getCart(userId);
  console.log("2. cart:", JSON.stringify(cart, null, 2));

  if (!cart.items || cart.items.length === 0) return [];

  const productIds = cart.items.map((item) => Number(item.productId));
  console.log("3. productIds:", productIds);

  const productos = await prisma.videojuegos.findMany({
    where: { id: { in: productIds } },
  });
  console.log("4. productos encontrados:", productos.length);

  return cart.items.map((item) => {
    const producto = productos.find(
      (p: Videojuego) => p.id === BigInt(item.productId)
    );
    console.log("5. producto para item", item.productId, ":", producto?.nombre);

    return {
      id: producto?.id || BigInt(0),
      productId: item.productId,
      name: producto?.nombre || "Desconocido",
      category: producto?.categoria || "N/A",
      price: producto?.precio || 0,
      image: producto?.imagenUrl || "",
      quantity: item.quantity,
      num_players: producto?.num_jugadores || 0,
      total: (producto?.precio || 0) * item.quantity,
      plataforma: producto?.plataforma || "",
    };
  });
}

// -----------------------------
// Obtener total de items
// -----------------------------
export async function getTotalItems(session: Session | null) {
  if (!session?.user?._id) return 0;
  const cart = await getCart(session.user._id);
  return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

// -----------------------------
// Agregar item al carrito
// -----------------------------
export async function addItem(productId: string, price?: number) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;
  if (!userId) return;

  // Verificar stock disponible
  const producto = await prisma.videojuegos.findUnique({
    where: { id: BigInt(productId) },
    select: { existencias: true, nombre: true },
  });

  if (!producto) {
    console.log("Producto no encontrado");
    return { error: "Producto no encontrado" };
  }

  const cart = await getCart(userId);
  const existingItem = cart.items.find((i) => i.productId === productId);
  const cantidadEnCarrito = existingItem?.quantity || 0;

  // Verificar si hay stock suficiente
  if (cantidadEnCarrito >= producto.existencias) {
    console.log(
      `Sin stock suficiente. Stock: ${producto.existencias}, En carrito: ${cantidadEnCarrito}`
    );
    return { error: `Solo hay ${producto.existencias} unidades disponibles` };
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ productId, quantity: 1, price: price || 0 });
  }

  await saveCart(cart);
  revalidatePath(`/product/${productId}`);

  return { success: true };
}

// -----------------------------
// Eliminar item completo
// -----------------------------
export async function delItem(productId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;
  if (!userId) return;

  const cart = await getCart(userId);
  cart.items = cart.items.filter((item) => !(item.productId === productId));

  await saveCart(cart);
  revalidatePath("/cart");
}

// -----------------------------
// Eliminar una unidad
// -----------------------------
export async function delOneItem(
  productId: string,
  size?: string,
  color?: string
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;
  if (!userId) return;

  const cart = await getCart(userId);

  cart.items = cart.items
    .map((item) => {
      if (item.productId === productId) {
        if (item.quantity > 1) item.quantity -= 1;
        else return null;
      }
      return item;
    })
    .filter(Boolean) as CartItem[];

  await saveCart(cart);
  revalidatePath("/cart");
}

// -----------------------------
// Vaciar carrito completo
// -----------------------------
export async function emptyCart(userId: string) {
  if (!userId) return;

  const cart: Cart = { userId, items: [] };
  await saveCart(cart);
  revalidatePath("/cart");
}
