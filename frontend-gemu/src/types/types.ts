// types.ts

// -----------------------------
// Modelos principales (correspondientes a Prisma)
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
  imagenUrl?: string | null;
}

export interface Factura {
  id: bigint;
  pedido_id: bigint;
  fecha_emision?: Date | null;
  numero_factura?: string | null;
  estado?: string | null;
}

// -----------------------------
// Tipos enriquecidos para frontend
// -----------------------------
export interface Variant {
  color: string;
  priceId?: string; // opcional si manejas IDs de precio
  images?: string[];
}

export interface EnrichedProduct {
  productId: string;
  _id: string;
  id: bigint;
  name: string;
  category: string;
  image: string[];
  price: number;
  quantity: number;
  total: number;
  sizes?: string[]; // <-- añadimos tamaños
  variants?: Variant[]; // <-- añadimos variantes
  purchased?: boolean;
  // 🔹 Para variantes y colores
  color?: string; // color de la variante
  images?: string[]; // imágenes de la variante
}

// types.ts
export interface EnrichedOrder {
  id: bigint;
  orderNumber: string;
  userId: bigint;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  products: EnrichedProduct[];
  total_price: number;
  purchaseDate: Date;
  expectedDeliveryDate?: Date | null;
  status: string;
}

export interface AddressDocument {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// -----------------------------
// Tipos para carrito / checkout
// -----------------------------
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string[];
  purchased?: boolean;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface CartItemDocument {
  productId: string;
  quantity: number;
  variantId?: string;
  size?: string;
  color?: string;
}

// -----------------------------
// Tipos para documentos de pedidos del frontend
// -----------------------------
export type ProductsDocument = {
  productId: bigint;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image: string[];
  purchased?: boolean;
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

export type OrdersDocument = OrderDocument[];

// -----------------------------
// Otros tipos
// -----------------------------
// types.ts
export interface Favorites {
  userId: string; // user._id de NextAuth como string
  favorites: string[]; // array de productId como string
}
