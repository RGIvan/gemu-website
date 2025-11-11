"use server";

import { prisma } from "@/libs/prisma";
import { Session } from "next-auth";
import { EnrichedProduct, EnrichedOrder } from "@/types/types";
import { emptyCart, getItems } from "@/app/(carts)/cart/action";

// -----------------------------
// Tipos locales
// -----------------------------
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

// -----------------------------
// Obtener los productos del carrito
// -----------------------------
export async function getCartItems(userId: string): Promise<EnrichedProduct[]> {
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
      price: Number(product.precio),
      quantity: item.quantity,
      total: Number(product.precio) * item.quantity,
      _id: item.productId,
    });
  }

  return enrichedCart;
}

// -----------------------------
// Guardar un pedido en la base de datos
// -----------------------------
export async function saveOrder(
  session: Session | null,
  cartItems: Cart["items"],
  paymentInfo: any
) {
  if (!session?.user._id || !cartItems || cartItems.length === 0) return;

  const userId = BigInt(session.user._id);

  const newPedido = await prisma.pedidos.create({
    data: {
      usuario_id: userId,
      fecha_pedido: new Date(),
      total_sin_iva: cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      iva_total: 0,
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

  await emptyCart(session.user._id);

  return newPedido;
}

// -----------------------------
// Obtener todos los pedidos del usuario como EnrichedOrder
// -----------------------------
export async function getUserOrders(
  session: Session | null
): Promise<EnrichedOrder[]> {
  if (!session?.user._id) return [];

  const userId = BigInt(session.user._id);

  const ordersFromDB = await prisma.pedidos.findMany({
    where: { usuario_id: userId },
    include: {
      detalle_pedidos: { include: { videojuegos: true } },
      usuarios: true,
    },
    orderBy: { fecha_pedido: "desc" },
  });

  // Definimos un tipo para cada pedido con detalles y usuario
  type PedidoConDetalles = (typeof ordersFromDB)[number];

  const enrichedOrders: EnrichedOrder[] = ordersFromDB.map(
    (o: PedidoConDetalles) => ({
      id: o.id,
      orderNumber: `#${o.id.toString()}`,
      userId: o.usuario_id,
      name: o.usuarios?.nombre ?? "N/A",
      email: o.usuarios?.correo_electronico ?? "N/A",
      phone: o.usuarios?.telefono ?? null,
      address: o.usuarios?.direccion ?? null,
      products: o.detalle_pedidos.map((item) => ({
        productId: item.producto_id.toString(),
        id: item.producto_id,
        _id: item.producto_id.toString(),
        name: item.videojuegos?.nombre ?? "N/A",
        category: item.videojuegos?.categoria ?? "N/A",
        image: [],
        price: Number(item.precio_unitario),
        quantity: item.cantidad,
        total:
          item.subtotal !== null && item.subtotal !== undefined
            ? Number(item.subtotal)
            : Number(item.precio_unitario) * item.cantidad,
      })),
      total_price:
        o.total_con_iva !== null && o.total_con_iva !== undefined
          ? Number(o.total_con_iva)
          : 0,
      purchaseDate: o.fecha_pedido ?? new Date(),
      expectedDeliveryDate: null,
      status: o.estado ?? "Pendiente",
    })
  );

  return enrichedOrders;
}
