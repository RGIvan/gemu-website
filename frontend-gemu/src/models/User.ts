"use server";

import { prisma } from "@/libs/prisma";
import { Usuario, Pedido } from "@/types/types";
import { Decimal } from "@prisma/client/runtime/library";

// Helper para convertir Decimal a number
function decimalToNumber(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

// Crear un usuario
export async function createUser(data: {
  correo_electronico: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  username: string;
}): Promise<Usuario> {
  const user = await prisma.usuarios.create({
    // Corregido: tabla plural 'usuarios'
    data,
    include: { pedidos: true }, // Traemos los pedidos para mapearlos
  });

  return {
    id: user.id,
    nombre: user.nombre,
    apellidos: user.apellidos,
    correo_electronico: user.correo_electronico,
    password: user.password,
    telefono: user.telefono,
    direccion: user.direccion,
    username: user.username,
    pedidos: (user.pedidos ?? []).map(
      (p: (typeof user.pedidos)[number]): Pedido => ({
        id: p.id,
        usuario_id: p.usuario_id,
        fecha_pedido: p.fecha_pedido,
        total_sin_iva: decimalToNumber(p.total_sin_iva),
        iva_total: decimalToNumber(p.iva_total),
        total_con_iva: decimalToNumber(p.total_con_iva),
        metodo_pago: p.metodo_pago ?? null,
        direccion_envio: p.direccion_envio ?? "",
        estado: p.estado ?? "pending",
      })
    ),
  };
}

// Buscar usuario por correo
export async function getUserByEmail(email: string): Promise<Usuario | null> {
  const user = await prisma.usuarios.findUnique({
    where: { correo_electronico: email },
    include: { pedidos: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    nombre: user.nombre,
    apellidos: user.apellidos,
    correo_electronico: user.correo_electronico,
    password: user.password,
    telefono: user.telefono,
    direccion: user.direccion,
    username: user.username,
    pedidos: (user.pedidos ?? []).map(
      (p: (typeof user.pedidos)[number]): Pedido => ({
        id: p.id,
        usuario_id: p.usuario_id,
        fecha_pedido: p.fecha_pedido,
        total_sin_iva: decimalToNumber(p.total_sin_iva),
        iva_total: decimalToNumber(p.iva_total),
        total_con_iva: decimalToNumber(p.total_con_iva),
        metodo_pago: p.metodo_pago ?? null,
        direccion_envio: p.direccion_envio ?? "",
        estado: p.estado ?? "pending",
      })
    ),
  };
}
