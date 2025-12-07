import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, nombre, apellidos, correo_electronico, telefono } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // Actualiza el usuario
    const updatedUser = await prisma.usuarios.update({
      where: { id: BigInt(userId) },
      data: {
        nombre: nombre,
        apellidos: apellidos,
        correo_electronico: correo_electronico,
        telefono: telefono,
      },
    });

    // Devuelve los datos
    return NextResponse.json({
      _id: updatedUser.id.toString(),
      nombre: updatedUser.nombre,
      apellidos: updatedUser.apellidos,
      correo_electronico: updatedUser.correo_electronico,
      telefono: updatedUser.telefono,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
