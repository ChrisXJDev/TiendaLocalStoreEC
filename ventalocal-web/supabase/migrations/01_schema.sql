-- ============================================================
-- VentaLocal - PostgreSQL Schema & RLS Policies (Supabase)
-- ============================================================
-- Asegúrate de correr este script en el SQL Editor de tu proyecto en Supabase.
-- NOTA: Supabase ya maneja los usuarios autenticados en la tabla "auth.users",
-- por lo que vincularemos nuestro sistema directamente a esa tabla base.
-- ============================================================

-- 1. EXTENSIONES BÁSICAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Para restringir valores fijos según lib/types.ts)
CREATE TYPE public.rol_usuario AS ENUM ('dueno', 'vendedor');
CREATE TYPE public.categoria_producto AS ENUM ('ropa', 'comida', 'limpieza', 'otro');
CREATE TYPE public.estado_orden AS ENUM ('pendiente', 'confirmada', 'entregada', 'cancelada');
CREATE TYPE public.origen_orden AS ENUM ('online', 'pos');
CREATE TYPE public.metodo_pago AS ENUM ('efectivo', 'transferencia', 'tarjeta');
CREATE TYPE public.estado_caja AS ENUM ('abierta', 'cerrada');
CREATE TYPE public.estado_turno AS ENUM ('abierto', 'cerrado');

-- 3. TABLAS CORE

-- Negocios (SaaS Tenant principal)
CREATE TABLE public.negocios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dueno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  categoria public.categoria_producto NOT NULL DEFAULT 'otro',
  telefono VARCHAR(50) NOT NULL,
  logo_url TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfiles Extendidos de Usuarios (Para nombres y roles de empleados)
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  negocio_id UUID REFERENCES public.negocios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  rol public.rol_usuario NOT NULL DEFAULT 'dueno',
  telefono VARCHAR(50),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productos
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  stock INTEGER NOT NULL DEFAULT 0,
  imagen_url TEXT,
  categoria VARCHAR(100),
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cajas (Para el control del TPV/POS)
CREATE TABLE public.cajas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  estado public.estado_caja NOT NULL DEFAULT 'cerrada',
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turnos de Caja
CREATE TABLE public.turnos_caja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caja_id UUID NOT NULL REFERENCES public.cajas(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES public.perfiles(id),
  vendedor_nombre VARCHAR(255) NOT NULL,
  monto_inicial DECIMAL(10, 2) NOT NULL,
  monto_final DECIMAL(10, 2),
  ventas_total DECIMAL(10, 2),
  diferencia DECIMAL(10, 2),
  fecha_apertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_cierre TIMESTAMP WITH TIME ZONE,
  estado public.estado_turno NOT NULL DEFAULT 'abierto'
);

-- Órdenes (Ventas)
CREATE TABLE public.ordenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  turno_id UUID REFERENCES public.turnos_caja(id),
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_telefono VARCHAR(50),
  total DECIMAL(10, 2) NOT NULL,
  estado public.estado_orden NOT NULL DEFAULT 'pendiente',
  origen public.origen_orden NOT NULL DEFAULT 'online',
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detalles de la Orden
CREATE TABLE public.detalles_orden (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id),
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- Pagos
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  metodo public.metodo_pago NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  referencia VARCHAR(255),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. SEGURIDAD A NIVEL DE FILAS (ROW LEVEL SECURITY - RLS)
-- ============================================================
-- Activamos RLS en todas las tablas
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_orden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS SIMPLES DE SEGURIDAD (MVP)
-- Un usuario solo puede ver y editar negocios de los que es el dueño
CREATE POLICY "Dueños manejan sus negocios"
ON public.negocios FOR ALL TO authenticated
USING (dueno_id = auth.uid())
WITH CHECK (dueno_id = auth.uid());

-- Permitir visión de catálogo PÚBLICO (clientes) usando el ID del negocio anónimo o slug
-- (Para Next.js cuando mostramos /tienda/slug)
CREATE POLICY "Publico puede ver negocios activos"
ON public.negocios FOR SELECT TO anon, authenticated
USING (activo = true);

-- Productos Públicos para el catálogo y POS
CREATE POLICY "Visión publica de productos"
ON public.productos FOR SELECT TO anon, authenticated
USING (activo = true);

-- Solo usuarios dueños pueden editar productos de su negocio
CREATE POLICY "Edicion privada de productos"
ON public.productos FOR ALL TO authenticated
USING (negocio_id IN (SELECT id FROM public.negocios WHERE dueno_id = auth.uid()));

-- Órdenes: Dueños pueden manejarlas
CREATE POLICY "Dueños manejan órdenes"
ON public.ordenes FOR ALL TO authenticated
USING (negocio_id IN (SELECT id FROM public.negocios WHERE dueno_id = auth.uid()));

-- Órdenes: Públicas y anónimas solo para INSERTAR (cuando cliente ordena por WhatsApp/Catalogo online)
CREATE POLICY "Clientes insertan órdenes"
ON public.ordenes FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Órdenes: LECTURA PARA MODO DEMO
CREATE POLICY "Demo Lectura Ordenes"
ON public.ordenes FOR SELECT TO anon, authenticated
USING (true);

-- Detalles Orden ligados al dueño del negocio
CREATE POLICY "Dueños manejan detalles y pagos"
ON public.detalles_orden FOR ALL TO authenticated
USING (orden_id IN (SELECT id FROM public.ordenes WHERE negocio_id IN (SELECT id FROM public.negocios WHERE dueno_id = auth.uid())));

CREATE POLICY "Clientes insertan detalles orden"
ON public.detalles_orden FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Detalles: LECTURA PARA MODO DEMO
CREATE POLICY "Demo Lectura Detalles"
ON public.detalles_orden FOR SELECT TO anon, authenticated
USING (true);

-- Productos: UPDATE PARA MODO DEMO (Descontar stock)
CREATE POLICY "Demo Update Productos"
ON public.productos FOR UPDATE TO anon, authenticated
USING (true);

-- Pagos ligados a Dueño
CREATE POLICY "Dueños manejan pagos"
ON public.pagos FOR ALL TO authenticated
USING (orden_id IN (SELECT id FROM public.ordenes WHERE negocio_id IN (SELECT id FROM public.negocios WHERE dueno_id = auth.uid())));

CREATE POLICY "Clientes insertan pagos"
ON public.pagos FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Trigger útil para el actualizado_en de Productos
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_productos
BEFORE UPDATE ON public.productos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
