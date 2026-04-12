-- ============================================================
-- VentaLocal — Schema Principal
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USUARIOS (sin Supabase Auth por ahora — se conectará después)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    telefono    TEXT,
    rol         TEXT NOT NULL DEFAULT 'dueno' CHECK (rol IN ('dueno', 'vendedor')),
    -- Cuando se integre Supabase Auth, este campo se enlazará con auth.users.id
    auth_id     UUID UNIQUE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.usuarios.auth_id IS 'Se llenará cuando se integre Supabase Auth (auth.users.id)';

-- ============================================================
-- NEGOCIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.negocios (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dueno_id    UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre      TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,          -- URL amigable: /tienda/mi-tienda
    descripcion TEXT,
    categoria   TEXT NOT NULL CHECK (categoria IN ('ropa', 'comida', 'limpieza', 'otro')),
    telefono    TEXT NOT NULL,                 -- Para links wa.me
    logo_url    TEXT,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negocios_slug ON public.negocios(slug);
CREATE INDEX IF NOT EXISTS idx_negocios_dueno ON public.negocios(dueno_id);

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.productos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    negocio_id      UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
    nombre          TEXT NOT NULL,
    descripcion     TEXT,
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url      TEXT,
    categoria       TEXT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_negocio ON public.productos(negocio_id);

-- ============================================================
-- CAJAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cajas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    negocio_id  UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
    nombre      TEXT NOT NULL DEFAULT 'Caja Principal',
    estado      TEXT NOT NULL DEFAULT 'cerrada' CHECK (estado IN ('abierta', 'cerrada')),
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cajas_negocio ON public.cajas(negocio_id);

-- ============================================================
-- TURNOS DE CAJA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.turnos_caja (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caja_id          UUID NOT NULL REFERENCES public.cajas(id) ON DELETE CASCADE,
    vendedor_nombre  TEXT NOT NULL,
    vendedor_id      UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    monto_inicial    NUMERIC(10,2) NOT NULL DEFAULT 0,
    monto_final      NUMERIC(10,2),
    ventas_total     NUMERIC(10,2),            -- Calculado al cerrar
    diferencia       NUMERIC(10,2),            -- monto_final - (monto_inicial + ventas_total)
    fecha_apertura   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_cierre     TIMESTAMPTZ,
    estado           TEXT NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado'))
);

CREATE INDEX IF NOT EXISTS idx_turnos_caja ON public.turnos_caja(caja_id);

-- ============================================================
-- ORDENES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ordenes (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    negocio_id        UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
    turno_id          UUID REFERENCES public.turnos_caja(id) ON DELETE SET NULL,
    cliente_nombre    TEXT NOT NULL,
    cliente_telefono  TEXT,
    total             NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado            TEXT NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'confirmada', 'entregada', 'cancelada')),
    origen            TEXT NOT NULL DEFAULT 'pos'
                        CHECK (origen IN ('online', 'pos')),
    notas             TEXT,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_negocio ON public.ordenes(negocio_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_turno ON public.ordenes(turno_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_origen ON public.ordenes(origen);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON public.ordenes(creado_en DESC);

-- ============================================================
-- DETALLES DE ORDEN
-- ============================================================
CREATE TABLE IF NOT EXISTS public.detalles_orden (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id         UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
    producto_id      UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal         NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

CREATE INDEX IF NOT EXISTS idx_detalles_orden ON public.detalles_orden(orden_id);

-- ============================================================
-- PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pagos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id    UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
    metodo      TEXT NOT NULL CHECK (metodo IN ('efectivo', 'transferencia', 'tarjeta')),
    monto       NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    referencia  TEXT,      -- Número de transferencia, últimos 4 dígitos, etc.
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_orden ON public.pagos(orden_id);

-- ============================================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_productos_updated
    BEFORE UPDATE ON public.productos
    FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- ============================================================
-- DATOS DE EJEMPLO (opcional — comentar si no se necesitan)
-- ============================================================
-- INSERT INTO public.usuarios (nombre, email, telefono, rol)
-- VALUES ('Carlos Pérez', 'carlos@ventalocal.ec', '+593987654321', 'dueno');
--
-- INSERT INTO public.negocios (dueno_id, nombre, slug, categoria, telefono)
-- VALUES (
--   (SELECT id FROM public.usuarios WHERE email = 'carlos@ventalocal.ec'),
--   'Tienda de Carlos', 'tienda-carlos', 'ropa', '+593987654321'
-- );
