"use server";

import { prisma } from "@/libs/prisma";
import { Session } from "next-auth";
import { EnrichedProduct, EnrichedOrder } from "@/types/types";
import { emptyCart, getItems } from "@/app/(carts)/cart/action";

// -----------------------------
// Tipos internos
// -----------------------------
export type CartItem = {
  productId: string;
  quantity: number;
  price: number;
};

// -----------------------------
// Obtener los productos del carrito enriquecidos
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
      id: product.id,
      productId: product.id.toString(),
      name: product.nombre,
      category: product.categoria,
      price: Number(product.precio),
      image: product.imagenUrl || "",
      quantity: item.quantity,
      total: Number(product.precio) * item.quantity,
    });
  }

  return enrichedCart;
}

// -----------------------------
// Guardar un pedido en la base de datos
// -----------------------------
export async function saveOrder(
  session: Session | null,
  cartItems: CartItem[],
  paymentInfo: { method?: string; address?: string; [key: string]: any }
) {
  if (!session?.user.id || !cartItems || cartItems.length === 0) return;

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
      metodo_pago: paymentInfo.method || "Desconocido",
      direccion_envio: paymentInfo.address || "",
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
  if (!session?.user?._id) return [];

  const userId = BigInt(session.user._id);

  const ordersFromDB = await prisma.pedidos.findMany({
    where: { usuario_id: userId },
    include: {
      detalle_pedidos: { include: { videojuegos: true } },
      usuarios: true,
      facturas: true,
    },
    orderBy: { fecha_pedido: "desc" },
  });

  const enrichedOrders: EnrichedOrder[] = ordersFromDB.map((o) => ({
    id: o.id,
    orderNumber: o.facturas?.[0]?.numero_factura ?? `#${o.id.toString()}`,
    userId: o.usuario_id,
    userName: o.usuarios?.nombre ?? "N/A",
    userEmail: o.usuarios?.correo_electronico ?? "N/A",
    products: o.detalle_pedidos.map((item) => ({
      id: item.videojuegos?.id || BigInt(0),
      productId: item.videojuegos?.id.toString() || "0",
      name: item.videojuegos?.nombre || "Desconocido",
      category: item.videojuegos?.categoria || "N/A",
      price: Number(item.precio_unitario),
      image: item.videojuegos?.imagenUrl || "",
      quantity: item.cantidad,
      total: item.subtotal
        ? Number(item.subtotal)
        : Number(item.precio_unitario) * item.cantidad,
    })),
    totalSinIVA: Number(o.total_sin_iva ?? 0),
    ivaTotal: Number(o.iva_total ?? 0),
    totalConIVA: Number(o.total_con_iva ?? 0),
    metodoPago: o.metodo_pago ?? "N/A",
    direccionEnvio: o.direccion_envio ?? "N/A",
    estado: o.estado ?? "Pendiente",
    fechaPedido: o.fecha_pedido ?? new Date(),
    fechaEntregaEstimada: undefined,
    facturas: o.facturas.map((f) => ({
      id: f.id,
      numeroFactura: f.numero_factura ?? undefined,
      fechaEmision: f.fecha_emision ?? undefined,
      estado: f.estado ?? undefined,
    })),
  }));

  return enrichedOrders;
}
