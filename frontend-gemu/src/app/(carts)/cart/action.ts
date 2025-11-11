"use server";

import { kv } from "@/libs/kvMock";
import { revalidatePath } from "next/cache";
import { Cart, CartItem } from "@/types/types";

// -----------------------------
// Obtener total de items del carrito
// -----------------------------
export async function getTotalItems(userId: string): Promise<number> {
  if (!userId) return 0;

  const cart: Cart | null = await kv.get(`cart-${userId}`);
  return cart?.items.length || 0;
}

// -----------------------------
// Obtener items del carrito
// -----------------------------
export async function getItems(
  userId: string
): Promise<CartItem[] | undefined> {
  if (!userId) return undefined;
  const cart: Cart | null = await kv.get(`cart-${userId}`);
  return cart?.items || [];
}

// -----------------------------
// Agregar item al carrito
// -----------------------------
export async function addItem(item: CartItem) {
  const userId = item.productId; // <-- aquí usarías tu userId real en el frontend/llamado
  let cart: Cart | null = await kv.get(`cart-${userId}`);

  if (!cart) {
    cart = { userId, items: [item] };
  } else {
    const existingItem = cart.items.find(
      (i) =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
  }

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

// -----------------------------
// Eliminar un item completo
// -----------------------------
export async function delItem(item: CartItem) {
  const userId = item.productId;
  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  cart.items = cart.items.filter(
    (i) =>
      !(
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
      )
  );

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

// -----------------------------
// Eliminar una unidad de un item
// -----------------------------
export async function delOneItem(item: CartItem) {
  const userId = item.productId;
  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (!cart) return;

  cart.items = cart.items
    .map((i) => {
      if (
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
      ) {
        if (i.quantity > 1) return { ...i, quantity: i.quantity - 1 };
        return null;
      }
      return i;
    })
    .filter(Boolean) as CartItem[];

  await kv.set(`cart-${userId}`, cart);
  revalidatePath("/cart");
}

// -----------------------------
// Vaciar carrito completo
// -----------------------------
export async function emptyCart(userId: string) {
  let cart: Cart | null = await kv.get(`cart-${userId}`);
  if (cart) {
    cart.items = [];
    await kv.set(`cart-${userId}`, cart);
    revalidatePath("/cart");
  }
}
