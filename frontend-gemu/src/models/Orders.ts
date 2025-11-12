"use server";

import { prisma } from "@/libs/prisma";
import { EnrichedProduct } from "@/types/types";

// Crear pedido
export async function createOrder(
  userId: bigint,
  name: string,
  email: string,
  phone: string | null,
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  },
  products: EnrichedProduct[],
  total_price: number
) {
  const direccion_envio = `${address.line1}, ${address.line2 ?? ""}, ${
    address.city
  }, ${address.state}, ${address.postal_code}, ${address.country}`;

  const pedido = await prisma.pedidos.create({
    data: {
      usuario_id: userId,
      fecha_pedido: new Date(),
      total_con_iva: total_price,
      direccion_envio,
      estado: "pending",
      detalle_pedidos: {
        create: products.map((p) => ({
          producto_id: BigInt(p.id),
          cantidad: p.quantity,
          precio_unitario: p.price,
          subtotal: p.price * p.quantity,
        })),
      },
    },
    include: {
      detalle_pedidos: {
        include: {
          videojuegos: true,
        },
      },
    },
  });

  return pedido;
}

// Obtener pedidos de un usuario
export async function getOrdersByUser(userId: bigint) {
  const orders = await prisma.pedidos.findMany({
    where: { usuario_id: userId },
    include: {
      detalle_pedidos: {
        include: { videojuegos: true },
      },
    },
    orderBy: { fecha_pedido: "desc" },
  });

  return orders.map((o: (typeof orders)[number]) => ({
    id: o.id,
    userId: o.usuario_id,
    total_price: o.total_con_iva ?? 0,
    purchaseDate: o.fecha_pedido ?? new Date(),
    status: o.estado ?? "pending",
    products: o.detalle_pedidos.map((d: (typeof o.detalle_pedidos)[number]) => {
      const precioUnitario = Number(d.precio_unitario);
      const cantidad = Number(d.cantidad);
      const subtotal =
        d.subtotal !== null ? Number(d.subtotal) : precioUnitario * cantidad;
      const videojuegoId =
        d.videojuegos.id !== null ? Number(d.videojuegos.id) : 0;

      return {
        productId: d.producto_id.toString(),
        _id: d.id.toString(),
        id: videojuegoId,
        name: d.videojuegos.nombre,
        category: d.videojuegos.categoria,
        price: precioUnitario,
        quantity: cantidad,
        total: subtotal,
        image: d.videojuegos.imagenUrl ? [d.videojuegos.imagenUrl] : [],
      };
    }),
  }));
}
