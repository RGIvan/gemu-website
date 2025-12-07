import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.usuarios.findUnique({
      where: { id: BigInt(params.id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id.toString(),
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo_electronico: user.correo_electronico,
      telefono: user.telefono,
      direccion: user.direccion,
      username: user.username,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}
