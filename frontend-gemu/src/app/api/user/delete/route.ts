import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const id = BigInt(userId);

    // Eliminar favoritos del usuario
    await prisma.favoritos.deleteMany({
      where: { usuario_id: id },
    });

    // Eliminar detalles de pedidos del usuario
    const pedidos = await prisma.pedidos.findMany({
      where: { usuario_id: id },
      select: { id: true },
    });

    const pedidoIds = pedidos.map((p) => p.id);

    if (pedidoIds.length > 0) {
      // Eliminar facturas
      await prisma.facturas.deleteMany({
        where: { pedido_id: { in: pedidoIds } },
      });

      // Eliminar detalles de pedidos
      await prisma.detalle_pedidos.deleteMany({
        where: { pedido_id: { in: pedidoIds } },
      });

      // Eliminar pedidos
      await prisma.pedidos.deleteMany({
        where: { usuario_id: id },
      });
    }

    // Eliminar usuario
    await prisma.usuarios.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Cuenta eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar la cuenta" },
      { status: 500 }
    );
  }
}
