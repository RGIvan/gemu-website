"use server";

import { prisma } from "@/libs/prisma";
import { Session } from "next-auth";
import { EnrichedProduct } from "@/types/types";
import { emptyCart, getItems } from "@/app/(carts)/cart/action";

export type Cart = {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    image?: string[];
  }>;
};

// Obtener los productos del carrito con información enriquecida
export async function getCartItems(userId: string) {
  if (!userId) return [];

  const cart = await getItems(userId);
  if (!cart) return [];

  const enrichedCart: EnrichedProduct[] = [];

  for (const item of cart) {
    const product = await prisma.videojuegos.findUnique({
      where: { id: BigInt(item.productId) },
    });

    if (!product) continue;

    enrichedCart.push({
      productId: product.id.toString(),
      id: product.id,
      name: product.nombre,
      category: product.categoria,
      image: item.image || [],
      price: product.precio,
      quantity: item.quantity,
      total: item.quantity * product.precio,
      _id: item.productId,
    });
  }

  return enrichedCart;
}

// Guardar un pedido en la base de datos
export async function saveOrder(
  session: Session | null,
  cartItems: Cart["items"],
  paymentInfo: any
) {
  if (!session?.user._id || !cartItems || cartItems.length === 0) return;

  const userId = BigInt(session.user._id);

  // Crear pedido principal
  const newPedido = await prisma.pedidos.create({
    data: {
      usuario_id: userId,
      fecha_pedido: new Date(),
      total_sin_iva: cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      iva_total: 0, // calcular IVA si quieres
      total_con_iva: cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      metodo_pago: paymentInfo?.method || "unknown",
      direccion_envio: paymentInfo?.address || "",
      estado: "Pendiente",
      detalle_pedidos: {
        create: cartItems.map((item) => ({
          producto_id: BigInt(item.productId),
          cantidad: item.quantity,
          precio_unitario: item.price,
          subtotal: item.quantity * item.price,
        })),
      },
    },
  });

  // Limpiar carrito
  await emptyCart(session.user._id);

  return newPedido;
}

// Obtener todos los pedidos del usuario
export async function getUserOrders(session: Session | null) {
  if (!session?.user._id) return [];

  const userId = BigInt(session.user._id);

  const orders = await prisma.pedidos.findMany({
    where: { usuario_id: userId },
    include: {
      detalle_pedidos: { include: { videojuegos: true } },
    },
    orderBy: { fecha_pedido: "desc" },
  });

  // Mapear a tipo enriquecido
  return orders.map((order) => ({
    id: order.id,
    usuario_id: order.usuario_id,
    fecha_pedido: order.fecha_pedido,
    total_con_iva: order.total_con_iva,
    estado: order.estado,
    detalle_pedidos: order.detalle_pedidos.map((item) => ({
      productId: item.producto_id.toString(),
      name: item.videojuegos.nombre,
      category: item.videojuegos.categoria,
      price: item.precio_unitario,
      quantity: item.cantidad,
      total: item.subtotal || item.precio_unitario.toNumber() * item.cantidad,
      image: [], // si quieres agregar imágenes, adapta aquí
    })),
  }));
}
