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
      total: (producto?.precio || 0) * item.quantity,
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
  console.log("=== SERVER: addItem ===");
  console.log("SERVER 1. productId:", productId);
  console.log("SERVER 2. price:", price);

  const session = await getServerSession(authOptions);
  console.log("SERVER 3. session:", JSON.stringify(session, null, 2));

  const userId = session?.user?._id || session?.user?.id;
  console.log("SERVER 4. userId:", userId);

  if (!userId) {
    console.log("SERVER ❌ No hay userId!");
    return;
  }

  const cart = await getCart(userId);
  console.log("SERVER 5. cart antes:", JSON.stringify(cart, null, 2));

  const existingItem = cart.items.find((i) => i.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    console.log(
      "SERVER 6. Item existente, nueva cantidad:",
      existingItem.quantity
    );
  } else {
    cart.items.push({ productId, quantity: 1, price: price || 0 });
    console.log("SERVER 6. Nuevo item añadido");
  }

  console.log("SERVER 7. cart después:", JSON.stringify(cart, null, 2));

  await saveCart(cart);
  console.log("SERVER 8. Cart guardado!");

  revalidatePath(`/product/${productId}`);
  console.log("SERVER 9. Path revalidado");
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
