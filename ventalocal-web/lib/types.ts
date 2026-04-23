// ============================================================
// VentaLocal — TypeScript Types
// ============================================================

export type Rol = 'dueno' | 'vendedor';
export type CategoriaProducto = 'ropa' | 'comida' | 'limpieza' | 'otro';
export type EstadoOrden = 'pendiente' | 'confirmada' | 'entregada' | 'cancelada';
export type OrigenOrden = 'online' | 'pos';
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta';
export type EstadoCaja = 'abierta' | 'cerrada';
export type EstadoTurno = 'abierto' | 'cerrado';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: Rol;
  creado_en: string;
}

export interface Negocio {
  id: string;
  dueno_id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  categoria: CategoriaProducto;
  telefono: string;
  logo_url?: string;
  activo: boolean;
  creado_en: string;
}

export interface Producto {
  id: string;
  negocio_id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  categoria?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Caja {
  id: string;
  negocio_id: string;
  nombre: string;
  estado: EstadoCaja;
  creado_en: string;
}

export interface TurnoCaja {
  id: string;
  caja_id: string;
  vendedor_nombre: string;
  vendedor_id?: string;
  monto_inicial: number;
  monto_final?: number;
  ventas_total?: number;
  diferencia?: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  estado: EstadoTurno;
}

export interface DetalleOrden {
  id: string;
  orden_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface Orden {
  id: string;
  negocio_id: string;
  turno_id?: string;
  cliente_nombre: string;
  cliente_telefono?: string;
  total: number;
  estado: EstadoOrden;
  origen: OrigenOrden;
  notas?: string;
  creado_en: string;
  detalles?: DetalleOrden[];
}

export interface Pago {
  id: string;
  orden_id: string;
  metodo: MetodoPago;
  monto: number;
  referencia?: string;
  creado_en: string;
}

// Cart item (frontend only)
export interface CartItem {
  producto: Producto;
  cantidad: number;
}

// Dashboard metrics
export interface MetricasDia {
  ventas_total: number;
  num_ordenes: number;
  ticket_promedio: number;
  productos_vendidos: number;
}
