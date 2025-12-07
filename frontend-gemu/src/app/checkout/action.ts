"use server";

import { emptyCart } from "@/app/(carts)/cart/action";
import { EnrichedProduct } from "@/types/types";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

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

async function getAuthToken(
  email: string,
  password?: string
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correoElectronico: email,
        password: password || "dummy",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }
  return null;
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

    // 1. Crear el pedido
    const pedidoResponse = await fetch(`${API_URL}/pedidos/crear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Si tienes el token guardado en la sesión, úsalo aquí:
        // "Authorization": `Bearer ${token}`,
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
    const facturaResponse = await fetch(`${API_URL}/facturas/crear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pedidoId: pedido.id,
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
