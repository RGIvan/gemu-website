// types.ts

// -----------------------------
// Modelos de Prisma
// -----------------------------
export interface Usuario {
  id: bigint;
  nombre: string;
  apellidos: string;
  correo_electronico: string;
  password: string;
  telefono?: string | null;
  direccion?: string | null;
  username: string;
  pedidos?: Pedido[];
}

export interface Pedido {
  id: bigint;
  usuario_id: bigint;
  fecha_pedido?: Date | null;
  total_sin_iva?: number | null;
  iva_total?: number | null;
  total_con_iva?: number | null;
  metodo_pago?: string | null;
  direccion_envio?: string | null;
  estado?: string | null;
  detalle_pedidos?: DetallePedido[];
  facturas?: Factura[];
}

export interface DetallePedido {
  id: bigint;
  pedido_id: bigint;
  producto_id: bigint;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number | null;
  videojuego?: Videojuego;
}

export interface Videojuego {
  id: bigint;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  existencias: number;
  num_jugadores?: number | null;
  edad_recomendada?: number | null;
  plataforma: string;
  imagenUrl?: string | null; // una sola imagen
}

export interface Factura {
  id: bigint;
  pedido_id: bigint;
  fecha_emision?: Date | null;
  numero_factura?: string | null;
  estado?: string | null;
}

export interface Favorito {
  id: bigint;
  usuario_id: bigint;
  videojuego_id: bigint;
  created_at: Date;
}

// -----------------------------
// Producto enriquecido para frontend (solo videojuegos)
// -----------------------------
export interface EnrichedProduct {
  id: bigint; // ID real del videojuego
  productId: string; // ID como string
  name: string; // nombre
  category: string; // categoria
  num_jugadores: number; // número de jugadores
  price: number; // precio
  image: string; // 1 sola imagen (imagenUrl)
  quantity: number; // cantidad en carrito
  total: number; // price * quantity
}

// -----------------------------
// Carrito
// -----------------------------
export interface CartItem {
  productId: string; // ID convertido a string
  quantity: number;
  price: number;
  image?: string; // imagen única
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

// Documento que se guarda en la DB (si necesitas guardar)
export interface CartItemDocument {
  productId: string;
  quantity: number;
}

// -----------------------------
// Pedidos (frontend)
// -----------------------------
export type ProductsDocument = {
  productId: bigint;
  quantity: number;
  price: number;
  image: string;
};

export type OrderDocument = {
  _id: string;
  orderId?: string;
  orderNumber?: string;
  name: string;
  email: string;
  phone: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  products: ProductsDocument[];
  purchaseDate?: Date;
  expectedDeliveryDate?: Date;
  total_price: number;
};

// -----------------------------
// Pedidos enriquecidos para frontend
// -----------------------------
export interface EnrichedOrder {
  id: bigint; // id del pedido
  orderNumber?: string; // número de factura o pedido
  userId: bigint; // id del usuario
  userName?: string; // nombre del usuario
  userEmail?: string; // correo del usuario
  products: EnrichedProduct[]; // lista de productos del pedido
  totalSinIVA?: number; // total sin IVA
  ivaTotal?: number; // IVA total
  totalConIVA?: number; // total con IVA
  metodoPago?: string; // método de pago
  direccionEnvio?: string; // dirección de envío
  estado?: string; // estado del pedido
  fechaPedido?: Date; // fecha del pedido
  fechaEntregaEstimada?: Date; // fecha estimada de entrega
  facturas?: {
    id: bigint;
    numeroFactura?: string;
    fechaEmision?: Date;
    estado?: string;
  }[];
}

export type OrdersDocument = OrderDocument[];

// -----------------------------
// Favoritos
// -----------------------------
export interface Favorites {
  userId: string;
  favorites: string[]; // IDs de videojuegos
}
