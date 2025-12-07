import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import Link from "next/link";
import DownloadInvoice from "@/components/checkout/DownloadInvoice";

interface SuccessPageProps {
  searchParams: { orderId?: string };
}

const SuccessPage = async ({ searchParams }: SuccessPageProps) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?._id || !searchParams.orderId) {
    redirect("/");
  }

  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: BigInt(searchParams.orderId) },
      include: {
        detalle_pedidos: {
          include: { videojuegos: true },
        },
        facturas: true,
        usuarios: true,
      },
    });

    if (!pedido) {
      redirect("/");
    }

    // Convertir BigInt a string para evitar errores de serialización
    const orderData = {
      id: pedido.id.toString(),
      numeroFactura: pedido.facturas[0]?.numero_factura || "N/A",
      fecha: pedido.fecha_pedido?.toISOString() || new Date().toISOString(),
      cliente: {
        nombre:
          `${pedido.usuarios.nombre || ""} ${
            pedido.usuarios.apellidos || ""
          }`.trim() || "Cliente",
        email: pedido.usuarios.correo_electronico || "",
        direccion: pedido.direccion_envio || "",
      },
      productos: pedido.detalle_pedidos.map((d) => ({
        nombre: d.videojuegos?.nombre || "Producto",
        cantidad: d.cantidad || 0,
        precio: Number(d.precio_unitario) || 0,
        subtotal: Number(d.subtotal) || 0,
      })),
      totalSinIVA: Number(pedido.total_sin_iva) || 0,
      iva: Number(pedido.iva_total) || 0,
      total: Number(pedido.total_con_iva) || 0,
    };

    return (
      <section className="max-w-2xl pt-12 mx-auto text-center">
        <div className="mb-8">
          <svg
            className="w-20 h-20 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-4 text-3xl font-bold">
          ¡Pedido realizado con éxito!
        </h1>
        <p className="text-[#A1A1A1] mb-2">
          Número de factura:{" "}
          <span className="font-semibold text-white">
            {orderData.numeroFactura}
          </span>
        </p>
        <p className="text-[#A1A1A1] mb-8">
          Hemos enviado un correo de confirmación a {orderData.cliente.email}
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <DownloadInvoice orderData={orderData} />

          <Link
            href="/orders"
            className="px-6 py-3 border border-[#2E2E2E] rounded-md hover:bg-[#1F1F1F] transition-all"
          >
            Ver mis pedidos
          </Link>

          <Link
            href="/"
            className="px-6 py-3 border border-[#2E2E2E] rounded-md hover:bg-[#1F1F1F] transition-all"
          >
            Seguir comprando
          </Link>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error en success page:", error);
    redirect("/");
  }
};

export default SuccessPage;
