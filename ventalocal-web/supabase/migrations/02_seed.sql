-- ============================================================
-- VentaLocal - Datos Iniciales (Seed Script)
-- Reemplaza 'TU_USER_ID_AQUI' por tu ID de usuario de Supabase Auth
-- ============================================================

DO $$
DECLARE
  v_user_id UUID := '49ae1aac-c792-4239-9ed6-a1e0e4cc0df1'; -- PEGA TU ID AQUÍ
  v_negocio_id UUID := '22222222-2222-2222-2222-222222222222';
  v_caja_id UUID := '33333333-3333-3333-3333-333333333333';
  v_turno_id UUID := '44444444-4444-4444-4444-444444444444';
  
  p1_id UUID := uuid_generate_v4();
  p2_id UUID := uuid_generate_v4();
  p3_id UUID := uuid_generate_v4();
  p4_id UUID := uuid_generate_v4();
  
  o1_id UUID := uuid_generate_v4();
  o2_id UUID := uuid_generate_v4();
BEGIN

  -- 1. Crear Perfil
  INSERT INTO public.perfiles (id, nombre, rol, telefono)
  VALUES (v_user_id, 'Carlos Mendoza (Demo)', 'dueno', '+593999999999')
  ON CONFLICT DO NOTHING;

  -- 2. Crear Negocio
  INSERT INTO public.negocios (id, dueno_id, nombre, slug, descripcion, categoria, telefono, activo)
  VALUES (
    v_negocio_id, 
    v_user_id, 
    'Boutique Eleganza', 
    'eleganza', 
    'Moda femenina contemporánea. Ropa de calidad a precios accesibles.', 
    'ropa', 
    '+593980000000', 
    true
  ) ON CONFLICT DO NOTHING;

  UPDATE public.perfiles SET negocio_id = v_negocio_id WHERE id = v_user_id;

  -- 3. Crear Productos de prueba
  INSERT INTO public.productos (id, negocio_id, nombre, descripcion, precio, stock, categoria, imagen_url) VALUES
  (p1_id, v_negocio_id, 'Vestido Floral', 'Vestido casual con estampado floral, ideal para el verano.', 45.99, 12, 'Vestidos', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80'),
  (p2_id, v_negocio_id, 'Blusa Lino Premium', 'Blusa de lino natural, fresca y elegante.', 28.50, 8, 'Blusas', 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80'),
  (p3_id, v_negocio_id, 'Jean Skinny Dark', 'Jean skinny de corte moderno, lavado oscuro premium.', 52.00, 15, 'Jeans', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'),
  (p4_id, v_negocio_id, 'Chaqueta Cuero Eco', 'Chaqueta estilo biker en cuero ecológico, muy resistente.', 89.00, 2, 'Chaquetas', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80')
  ON CONFLICT DO NOTHING;

  -- 4. Setear Caja y Turno (Para el POS)
  INSERT INTO public.cajas (id, negocio_id, nombre, estado) 
  VALUES (v_caja_id, v_negocio_id, 'Caja Principal POS', 'abierta') ON CONFLICT DO NOTHING;

  INSERT INTO public.turnos_caja (id, caja_id, vendedor_id, vendedor_nombre, monto_inicial)
  VALUES (v_turno_id, v_caja_id, v_user_id, 'Carlos Mendoza', 50.00) ON CONFLICT DO NOTHING;

  -- 5. Crear Órdenes de prueba para el Dashboard
  INSERT INTO public.ordenes (id, negocio_id, turno_id, cliente_nombre, total, estado, origen) VALUES
  (o1_id, v_negocio_id, v_turno_id, 'María García', 74.49, 'entregada', 'pos'),
  (o2_id, v_negocio_id, NULL, 'Ana Rodríguez', 45.99, 'pendiente', 'online')
  ON CONFLICT DO NOTHING;

  -- Detalles de esas órdenes
  INSERT INTO public.detalles_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
  (o1_id, p2_id, 1, 28.50, 28.50),
  (o1_id, p1_id, 1, 45.99, 45.99),
  (o2_id, p1_id, 1, 45.99, 45.99)
  ON CONFLICT DO NOTHING;

END $$;
