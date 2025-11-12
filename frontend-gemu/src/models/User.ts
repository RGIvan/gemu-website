import { prisma } from "@/libs/prisma";
import { Usuario } from "@/types/types";

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
  const user = await prisma.usuario.create({
    data: data,
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
    pedidos: [], // opcional
  };
}

// Buscar usuario por correo
export async function getUserByEmail(email: string): Promise<Usuario | null> {
  const user = await prisma.usuario.findUnique({
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
    pedidos: user.pedidos,
  };
}
