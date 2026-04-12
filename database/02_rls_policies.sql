-- ============================================================
-- VentaLocal — Row Level Security (RLS) Policies
-- Ejecutar DESPUÉS de 01_schema.sql
-- ============================================================
-- NOTA: Sin Supabase Auth activa, estas políticas usan
-- la función auth.uid(). Cuando integres Auth, funcionarán
-- automáticamente. Por ahora habilitamos RLS pero con política
-- permisiva para desarrollo.
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negocios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos_caja    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_orden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICA TEMPORAL PARA DESARROLLO (sin auth)
-- Permite todo desde el service_role key del backend ASP.NET
-- IMPORTANTE: Cambiar estas políticas cuando se implemente Auth
-- ============================================================

-- Usuarios: acceso público temporal
CREATE POLICY "dev_usuarios_all" ON public.usuarios
    FOR ALL USING (true) WITH CHECK (true);

-- Negocios: lectura pública (para catálogos), escritura sin restricción temporal
CREATE POLICY "dev_negocios_all" ON public.negocios
    FOR ALL USING (true) WITH CHECK (true);

-- Productos: lectura pública para catálogos online
CREATE POLICY "productos_lectura_publica" ON public.productos
    FOR SELECT USING (activo = true);

CREATE POLICY "dev_productos_write" ON public.productos
    FOR ALL USING (true) WITH CHECK (true);

-- Cajas: acceso sin restricción temporal
CREATE POLICY "dev_cajas_all" ON public.cajas
    FOR ALL USING (true) WITH CHECK (true);

-- Turnos: acceso sin restricción temporal
CREATE POLICY "dev_turnos_all" ON public.turnos_caja
    FOR ALL USING (true) WITH CHECK (true);

-- Órdenes: acceso sin restricción temporal
CREATE POLICY "dev_ordenes_all" ON public.ordenes
    FOR ALL USING (true) WITH CHECK (true);

-- Detalles: acceso sin restricción temporal
CREATE POLICY "dev_detalles_all" ON public.detalles_orden
    FOR ALL USING (true) WITH CHECK (true);

-- Pagos: acceso sin restricción temporal
CREATE POLICY "dev_pagos_all" ON public.pagos
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- POLÍTICAS FUTURAS (comentadas — activar cuando se integre Auth)
-- ============================================================

-- -- Negocios: el dueño solo ve/edita su propio negocio
-- CREATE POLICY "negocios_propietario" ON public.negocios
--     FOR ALL USING (
--         dueno_id = (
--             SELECT id FROM public.usuarios WHERE auth_id = auth.uid()
--         )
--     );
--
-- -- Productos: solo el dueño del negocio puede modificar
-- CREATE POLICY "productos_write_propietario" ON public.productos
--     FOR INSERT UPDATE DELETE USING (
--         negocio_id IN (
--             SELECT id FROM public.negocios
--             WHERE dueno_id = (
--                 SELECT id FROM public.usuarios WHERE auth_id = auth.uid()
--             )
--         )
--     );
--
-- -- Órdenes: el dueño ve todas las órdenes de su negocio
-- CREATE POLICY "ordenes_propietario" ON public.ordenes
--     FOR ALL USING (
--         negocio_id IN (
--             SELECT id FROM public.negocios
--             WHERE dueno_id = (
--                 SELECT id FROM public.usuarios WHERE auth_id = auth.uid()
--             )
--         )
--     );
