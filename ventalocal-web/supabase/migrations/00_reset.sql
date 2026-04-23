-- ============================================================
-- VentaLocal - Script de Limpieza Total (RESET)
-- ============================================================
-- Si algo salió mal o a la mitad, ejecuta esto primero para
-- dejar la base de datos limpia de las tablas de VentaLocal 
-- sin romper el sistema interno de Supabase ni auth.
-- ============================================================

DROP TABLE IF EXISTS public.pagos CASCADE;
DROP TABLE IF EXISTS public.detalles_orden CASCADE;
DROP TABLE IF EXISTS public.ordenes CASCADE;
DROP TABLE IF EXISTS public.turnos_caja CASCADE;
DROP TABLE IF EXISTS public.cajas CASCADE;
DROP TABLE IF EXISTS public.productos CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;
DROP TABLE IF EXISTS public.negocios CASCADE;

DROP TYPE IF EXISTS public.estado_turno CASCADE;
DROP TYPE IF EXISTS public.estado_caja CASCADE;
DROP TYPE IF EXISTS public.metodo_pago CASCADE;
DROP TYPE IF EXISTS public.origen_orden CASCADE;
DROP TYPE IF EXISTS public.estado_orden CASCADE;
DROP TYPE IF EXISTS public.categoria_producto CASCADE;
DROP TYPE IF EXISTS public.rol_usuario CASCADE;

-- Limpieza de triggers obsoletos
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
