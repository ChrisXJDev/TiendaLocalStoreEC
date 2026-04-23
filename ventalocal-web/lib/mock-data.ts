// ============================================================
// VentaLocal — Mock Data (demo sin Supabase)
// ============================================================
import { Negocio, Producto, Orden, TurnoCaja } from './types';

export const MOCK_NEGOCIO: Negocio = {
  id: 'neg-001',
  dueno_id: 'usr-001',
  nombre: 'Boutique Eleganza',
  slug: 'eleganza',
  descripcion: 'Moda femenina contemporánea. Ropa de calidad a precios accesibles.',
  categoria: 'ropa',
  telefono: '',
  logo_url: undefined,
  activo: true,
  creado_en: '2024-01-15T10:00:00Z',
};

export const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 'prod-001', negocio_id: 'neg-001',
    nombre: 'Vestido Floral', descripcion: 'Vestido casual con estampado floral, ideal para el verano.',
    precio: 45.99, stock: 12, categoria: 'Vestidos', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prod-002', negocio_id: 'neg-001',
    nombre: 'Blusa Lino Premium', descripcion: 'Blusa de lino natural, fresca y elegante.',
    precio: 28.50, stock: 8, categoria: 'Blusas', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prod-003', negocio_id: 'neg-001',
    nombre: 'Jean Skinny Dark', descripcion: 'Jean skinny de corte moderno, lavado oscuro premium.',
    precio: 52.00, stock: 15, categoria: 'Jeans', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prod-004', negocio_id: 'neg-001',
    nombre: 'Chaqueta Cuero Eco', descripcion: 'Chaqueta estilo biker en cuero ecológico, muy resistente.',
    precio: 89.00, stock: 5, categoria: 'Chaquetas', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prod-005', negocio_id: 'neg-001',
    nombre: 'Falda Midi Plisada', descripcion: 'Falda midi con pliegues elegantes, perfecta para oficina.',
    precio: 35.00, stock: 10, categoria: 'Faldas', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prod-006', negocio_id: 'neg-001',
    nombre: 'Top Deportivo', descripcion: 'Top con soporte deportivo, tejido transpirable.',
    precio: 22.00, stock: 20, categoria: 'Tops', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prod-007', negocio_id: 'neg-001',
    nombre: 'Cardigan Oversize', descripcion: 'Cardigan oversize en lana merino, super suave.',
    precio: 48.00, stock: 7, categoria: 'Abrigos', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1580331451062-99ff652288d7?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prod-008', negocio_id: 'neg-001',
    nombre: 'Camiseta Básica Pack', descripcion: 'Pack de 3 camisetas básicas en algodón 100%.',
    precio: 30.00, stock: 25, categoria: 'Camisetas', activo: true,
    imagen_url: 'https://images.unsplash.com/photo-1613852348851-df1739db8201?w=400&q=80',
    creado_en: '2024-01-20T10:00:00Z', actualizado_en: '2024-01-20T10:00:00Z',
  },
];

export const MOCK_ORDENES: Orden[] = [
  {
    id: 'ord-001', negocio_id: 'neg-001', turno_id: 'turn-001',
    cliente_nombre: 'María García', cliente_telefono: '',
    total: 74.49, estado: 'entregada', origen: 'pos', creado_en: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ord-002', negocio_id: 'neg-001', turno_id: 'turn-001',
    cliente_nombre: 'Ana Rodríguez', cliente_telefono: '',
    total: 52.00, estado: 'confirmada', origen: 'pos', creado_en: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'ord-003', negocio_id: 'neg-001',
    cliente_nombre: 'Lucía Martínez',
    total: 35.00, estado: 'pendiente', origen: 'online', creado_en: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'ord-004', negocio_id: 'neg-001',
    cliente_nombre: 'Carla Vega',
    total: 89.00, estado: 'pendiente', origen: 'online', creado_en: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'ord-005', negocio_id: 'neg-001', turno_id: 'turn-001',
    cliente_nombre: 'Sofía López',
    total: 28.50, estado: 'entregada', origen: 'pos', creado_en: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const MOCK_TURNO: TurnoCaja = {
  id: 'turn-001',
  caja_id: 'caja-001',
  vendedor_nombre: 'Carlos Mendoza',
  monto_inicial: 50.00,
  ventas_total: 154.99,
  fecha_apertura: new Date(Date.now() - 14400000).toISOString(),
  estado: 'abierto',
};
