// types.ts

export interface Usuario {
  id: bigint;
  nombre: string;
  apellidos: string;
  correoElectronico: string;
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
}

export interface Factura {
  id: bigint;
  pedido_id: bigint;
  fecha_emision?: Date | null;
  numero_factura?: string | null;
  estado?: string | null;
}

// Versiones "enriched" para frontend, si quieres manejar datos combinados
export interface EnrichedProduct {
  id: bigint;
  name: string;
  category: string;
  price: number;
  quantity: number;
  total: number;
  image?: string[];
}

export interface EnrichedOrder {
  id: bigint;
  orderNumber: string;
  userId: bigint;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  products: EnrichedProduct[];
  total_price: number;
  purchaseDate: Date;
  expectedDeliveryDate?: Date | null;
  status?: string | null;
}

export interface Favorites {
  userId: bigint;
  favorites: string[];
}
