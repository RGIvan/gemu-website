import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, email, phone } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // Actualiza el usuario
    const updatedUser = await prisma.usuarios.update({
      where: { id: BigInt(userId) },
      data: {
        nombre: name,
        correo_electronico: email,
        telefono: phone,
      },
    });

    // Devuelve los datos con las propiedades que espera NextAuth
    return NextResponse.json({
      _id: updatedUser.id.toString(),
      name: updatedUser.nombre,
      email: updatedUser.correo_electronico,
      phone: updatedUser.telefono,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
