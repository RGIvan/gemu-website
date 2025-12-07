"use server";

import { emptyCart } from "@/app/(carts)/cart/action";
import { EnrichedProduct } from "@/types/types";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateOrderParams {
  userId: string;
  cartItems: EnrichedProduct[];
  total: number;
  shippingData: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    codigoPostal: string;
    metodoPago: string;
  };
}

// Detectar si estamos en Railway (producción) o Docker (local)
function getEndpoint(path: string): string {
  // Railway: sin /api (el Gateway hace RewritePath)
  // Docker local: con /api (rutas directas)
  const isRailway = API_URL?.includes("railway.app");

  if (isRailway) {
    // Producción: /pedidos/crear
    return `${API_URL}${path}`;
  } else {
    // Local Docker: /api/pedidos/crear
    return `${API_URL}${path}`;
  }
}

export async function createOrder({
  userId,
  cartItems,
  total,
  shippingData,
}: CreateOrderParams) {
  try {
    const direccionCompleta = `${shippingData.direccion}, ${shippingData.ciudad}, ${shippingData.codigoPostal}`;

    console.log("=== CREANDO PEDIDO ===");
    console.log("API_URL:", API_URL);
    console.log("Endpoint pedidos:", getEndpoint("/pedidos/crear"));

    // 1. Crear el pedido
    const pedidoResponse = await fetch(getEndpoint("/pedidos/crear"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuarioId: parseInt(userId),
        metodoPago: shippingData.metodoPago,
        direccionEnvio: direccionCompleta,
        estadoEnvio: "PENDIENTE",
        detalles: cartItems.map((item) => ({
          productoId: parseInt(item.productId),
          cantidad: item.quantity,
          precioUnitario: item.price,
        })),
      }),
    });

    console.log("Pedido response status:", pedidoResponse.status);

    if (!pedidoResponse.ok) {
      const error = await pedidoResponse.text();
      console.error("Error API pedidos:", error);
      return {
        success: false,
        error: "Error al crear el pedido en el servidor",
      };
    }

    const pedido = await pedidoResponse.json();
    console.log("Pedido creado:", pedido);

    // 2. Crear la factura
    console.log("=== CREANDO FACTURA ===");
    console.log("Endpoint facturas:", getEndpoint("/facturas/crear"));

    const facturaResponse = await fetch(getEndpoint("/facturas/crear"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pedidoId: pedido.id,
        clienteNombre: shippingData.nombre,
        clienteEmail: shippingData.email,
        clienteTelefono: shippingData.telefono,
      }),
    });

    console.log("Factura response status:", facturaResponse.status);

    let numeroFactura = "";
    if (facturaResponse.ok) {
      const factura = await facturaResponse.json();
      console.log("Factura creada:", factura);
      numeroFactura = factura.numeroFactura || "";
    } else {
      console.error("Error creando factura:", await facturaResponse.text());
    }

    // 3. Vaciar el carrito
    await emptyCart(userId);

    revalidatePath("/");
    revalidatePath("/orders");

    return {
      success: true,
      orderId: pedido.id?.toString(),
      invoiceNumber: numeroFactura,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: "Error al crear el pedido",
    };
  }
}
