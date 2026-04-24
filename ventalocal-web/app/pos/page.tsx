'use client';
import { useState } from 'react';
import {
  Search, Plus, Minus, CreditCard, Banknote, Smartphone,
  ReceiptText, X, ChevronRight, Clock, DollarSign, ShoppingBag,
  User, Lock, Unlock, AlertCircle, ArrowLeft, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { MOCK_TURNO } from '@/lib/mock-data'; // Usaremos esto solo como reserva si no hay turno abierto
import { Producto, CartItem, MetodoPago, TurnoCaja, Negocio } from '@/lib/types';
import { getNegocioBySlug, getProductos, createOrden, getTurnoActivo } from '@/lib/api';
import { useEffect } from 'react';

const METODOS: { id: MetodoPago; label: string; icon: React.ElementType }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'transferencia', label: 'Transferencia', icon: Smartphone },
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
];

export default function PosPage() {
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [turno, setTurno] = useState<TurnoCaja | null>(null);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<CartItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');

  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [showRecibo, setShowRecibo] = useState(false);
  const [ultimaOrden, setUltimaOrden] = useState<{ total: number; items: CartItem[]; id?: string } | null>(null);
  const [clienteNombre, setClienteNombre] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const neg = await getNegocioBySlug('eleganza');
        if (neg) {
          setNegocio(neg);
          const [prods, activeTurn] = await Promise.all([
            getProductos(neg.id),
            getTurnoActivo('33333333-3333-3333-3333-333333333333')
          ]);
          setProductos(prods);
          setTurno(activeTurn);
        }
      } catch (e) {
        console.error("Error loading POS", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const productosFiltrados = productos.filter(p =>
    p.activo && p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const total = items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const vuelto = parseFloat(montoEfectivo || '0') - total;

  const addItem = (p: Producto) => {
    setItems(prev => {
      const ex = prev.find(i => i.producto.id === p.id);
      if (ex) return prev.map(i => i.producto.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto: p, cantidad: 1 }];
    });
  };

  const updateQty = (id: string, q: number) => {
    if (q <= 0) setItems(prev => prev.filter(i => i.producto.id !== id));
    else setItems(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: q } : i));
  };

  const cobrar = async () => {
    if (items.length === 0 || !negocio) return;

    try {
      const dbOrden = await createOrden({
        negocio_id: negocio.id,
        turno_id: turno?.id, // Puede ser nulo si no hay turno activo manejado
        cliente_nombre: clienteNombre || 'Consumidor Final',
        total: total,
        estado: 'entregada',
        origen: 'pos',
        detalles: items.map(i => ({
          producto_id: i.producto.id,
          cantidad: i.cantidad,
          precio_unitario: i.producto.precio,
          subtotal: i.producto.precio * i.cantidad,
          producto: i.producto
        })) as any
      });

      setUltimaOrden({ total, items: [...items], id: dbOrden.id });
      setItems([]);
      setMontoEfectivo('');
      setClienteNombre('');
      setShowRecibo(true);
    } catch (e) {
      alert("Error procesando pago. Revisa consola.");
    }
  };

  const atajos = [5, 10, 20, 50, 100];

  if (loading) {
    return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-white">Cargando TPV...</div>;
  }

  if (!turno) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="glass rounded-2xl p-10 max-w-md w-full text-center mx-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Turno cerrado</h2>
          <p className="text-[var(--text-secondary)] mb-6 text-sm">Abre tu turno de caja para comenzar a vender</p>
          <div className="space-y-3 mb-6">
            <input id="input-vendedor" className="input" placeholder="Nombre del vendedor" defaultValue="Carlos Mendoza" />
            <input className="input" placeholder="Monto inicial en caja ($)" type="number" />
          </div>
          <button id="btn-abrir-turno" onClick={() => alert("La apertura de turno manual requiere implementarse en backend.")}
            className="btn-primary w-full justify-center" style={{ padding: '0.8rem' }}>
            <Unlock size={16} /> Abrir turno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }} className="flex flex-col">
      <header className="glass px-4 sm:px-6 py-3 flex items-center justify-between border-b sticky top-0 z-50" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-white transition-colors group"
            style={{ textDecoration: 'none' }}>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-[var(--bg-elevated)] transition-all"
              style={{ border: '1px solid var(--border)' }}>
              <ArrowLeft size={16} />
            </span>
            <span className="hidden md:inline text-xs">Inicio</span>
          </Link>
          <div className="hidden sm:block w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
          <span className="font-bold text-white text-sm sm:text-base whitespace-nowrap">POS Terminal</span>
          <div className="hidden xs:flex badge badge-green ml-1 sm:ml-2 scale-90 sm:scale-100">
            <span className="dot-live" style={{ width: 6, height: 6 }} /> <span className="hidden sm:inline">Turno activo</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/dashboard" className="w-9 h-9 sm:w-auto sm:btn-secondary flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-white sm:px-4 sm:py-2" title="Ir al Dashboard">
            <BarChart3 size={16} className="sm:mr-2" />
            <span className="hidden sm:inline text-xs">Dashboard</span>
          </Link>
          <button id="btn-cerrar-turno" onClick={() => alert("Simulando bloqueo.")}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Lock size={15} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative pb-20 lg:pb-0">
        {/* ── Panel izquierdo: Productos ──────────────── */}
        <div className="flex-1 flex flex-col p-6 lg:p-8 pt-6 overflow-hidden">
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input id="pos-search" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto..." className="input pl-9" />
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5 overflow-y-auto flex-1 pb-20 lg:pb-10">
            {productosFiltrados.map(p => {
              const count = items.find(i => i.producto.id === p.id)?.cantidad || 0;
              return (
                <button key={p.id} id={`pos-prod-${p.id}`} onClick={() => addItem(p)}
                  disabled={p.stock === 0}
                  className="text-left rounded-2xl group relative overflow-hidden transition-all hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--bg-surface)', border: count > 0 ? '1px solid rgba(255,90,31,0.6)' : '1px solid var(--border)' }}>
                  {p.imagen_url && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--bg-elevated)]">
                      <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--accent)] mb-1">{p.categoria}</div>
                    <div className="font-bold text-sm leading-tight mb-2 text-white">{p.nombre}</div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-base font-black text-white">${p.precio.toFixed(2)}</span>
                      <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-overlay)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mobile Cart Trigger (FAB) ──────────────── */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-40">
          <button
            onClick={() => setShowMobileCart(true)}
            className="w-full h-14 bg-orange-500 rounded-2xl text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)] flex items-center justify-between px-6 transition-transform active:scale-95">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag size={22} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-600 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-orange-500">
                  {items.reduce((s, i) => s + i.cantidad, 0)}
                </span>
              </div>
              <span className="font-black tracking-tight text-lg">Revisar Orden</span>
            </div>
            <span className="font-black text-xl">${total.toFixed(2)}</span>
          </button>
        </div>

        {/* ── Panel derecho: Cobro (Drawer Móvil / Sidebar Desktop) ──────────────────── */}
        {showMobileCart && <div className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileCart(false)} />}

        <div className={`
          flex flex-col border-l bg-[var(--bg-surface)] border-[var(--border)]
          transition-transform duration-300 z-50 shadow-2xl lg:shadow-none
          fixed lg:static top-0 right-0 h-full w-[85%] sm:w-96 lg:w-80 xl:w-96 
          ${showMobileCart ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Orden */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 pt-0 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-[var(--bg-surface)] py-4 z-10 border-b border-[var(--border)]">
              <h3 className="font-bold text-base text-white">Orden actual</h3>
              <div className="flex items-center gap-4">
                {items.length > 0 && (
                  <button onClick={() => setItems([])} className="text-xs text-[var(--text-muted)] hover:text-red-400 font-bold uppercase tracking-widest">
                    Limpiar
                  </button>
                )}
                <button onClick={() => setShowMobileCart(false)} className="lg:hidden text-white/50 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-24 my-auto text-[var(--text-muted)]">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">Selecciona productos</p>
                <p className="text-xs opacity-60 mt-1">presionando sobre ellos en el panel izquierdo.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.producto.id} className="flex items-center gap-3 p-3 rounded-xl animate-fade"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{item.producto.nombre}</p>
                    <p className="text-xs text-[var(--text-muted)]">${item.producto.precio.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.producto.id, item.cantidad - 1)}
                      className="w-5 h-5 rounded bg-[var(--bg-overlay)] flex items-center justify-center hover:bg-orange-600 transition-colors">
                      <Minus size={9} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => addItem(item.producto)}
                      className="w-5 h-5 rounded bg-[var(--bg-overlay)] flex items-center justify-center hover:bg-orange-600 transition-colors">
                      <Plus size={9} />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-orange-400 w-12 text-right">
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Cobro */}
          <div className="p-8 border-t flex flex-col gap-4" style={{ borderColor: 'var(--border)' }}>
            <input className="input text-sm" placeholder="Nombre cliente (opcional)"
              value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} />

            {/* Método de pago */}
            <div className="grid grid-cols-3 gap-2">
              {METODOS.map(({ id, label, icon: Icon }) => (
                <button key={id} id={`metodo-${id}`} onClick={() => setMetodo(id)}
                  className="flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: metodo === id ? 'rgba(255,90,31,0.18)' : 'var(--bg-elevated)',
                    border: metodo === id ? '1px solid rgba(255,90,31,0.5)' : '1px solid var(--border)',
                    color: metodo === id ? 'var(--accent-light)' : 'var(--text-secondary)',
                  }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Monto efectivo / vuelto */}
            {metodo === 'efectivo' ? (
              <div className="animate-fade">
                <input id="monto-efectivo" type="number" placeholder="Monto recibido del cliente ($)"
                  value={montoEfectivo} onChange={e => setMontoEfectivo(e.target.value)}
                  className="input text-sm mb-2" />
                <div className="flex gap-2 flex-wrap">
                  {atajos.map(a => (
                    <button key={a} onClick={() => setMontoEfectivo(a.toString())}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-orange-600 hover:text-white transition-all border"
                      style={{ borderColor: 'var(--border)' }}>
                      Billete ${a}
                    </button>
                  ))}
                </div>
                {montoEfectivo && (
                  <div className={`mt-2 text-center text-sm font-bold ${vuelto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {vuelto >= 0 ? `Entregar Vuelto: $${vuelto.toFixed(2)}` : `Falta dinero: $${Math.abs(vuelto).toFixed(2)}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-fade text-center p-4 rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5">
                <div className="mx-auto w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                  <Smartphone className="text-orange-400" size={18} />
                </div>
                <p className="text-sm font-bold text-white mb-1">Esperando al cliente</p>
                <p className="text-xs text-[var(--text-secondary)]">Dile al cliente que acerque su tarjeta al Datafono o escanee el código QR de pago.</p>
              </div>
            )}

            {/* Total y botón cobrar */}
            <div className="flex items-center justify-between py-2 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[var(--text-secondary)] text-sm">Total a pagar:</span>
              <span className="text-2xl font-black gradient-text">${total.toFixed(2)}</span>
            </div>
            <button id="btn-cobrar" onClick={cobrar}
              disabled={items.length === 0 || (metodo === 'efectivo' && vuelto < 0)}
              className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ padding: '1rem', fontSize: '1rem' }}>
              <ReceiptText size={18} className="mr-1" /> Completar Venta e Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Recibo modal - Rediseño de Ticket Térmico */}
      {showRecibo && ultimaOrden && (
        <>
          <div className="overlay" onClick={() => setShowRecibo(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass rounded-xl p-0 w-80 animate-slide-up flex flex-col shadow-2xl overflow-hidden border border-gray-700/50">

              {/* Encabezado del ticket térmico blanco clásico */}
              <div className="bg-white text-black p-6 pb-2 text-center">
                <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-2">
                  <h3 className="text-xl font-black uppercase tracking-widest">{negocio?.nombre || 'Mi Tienda'}</h3>
                  <p className="text-xs text-gray-500 mb-1">{negocio?.descripcion?.slice(0, 30) || 'Sistema POS VentaLocal'}</p>
                  <p className="text-[10px] text-gray-400 mt-2">Ticket de Venta #{ultimaOrden.id?.split('-')[0] || '12039'}</p>
                  <p className="text-[10px] text-gray-400">Caja Principal - {new Date().toLocaleDateString()}</p>
                  <p className="text-[10px] text-gray-400">Cajero: {turno.vendedor_nombre}</p>
                </div>
              </div>

              {/* Items del ticket */}
              <div className="bg-white text-black px-6 py-2 text-sm">
                <div className="flex justify-between text-xs font-bold border-b border-gray-200 pb-1 mb-2">
                  <span>Cant x Prod</span>
                  <span>Importe</span>
                </div>
                <div className="space-y-2 pb-4 border-b-2 border-dashed border-gray-300">
                  {ultimaOrden.items.map(i => (
                    <div key={i.producto.id} className="flex justify-between items-start text-xs font-medium">
                      <span className="flex-1 pr-2">{i.cantidad}x {i.producto.nombre.slice(0, 18)}{i.producto.nombre.length > 18 ? '.' : ''}</span>
                      <span>${(i.producto.precio * i.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total del ticket */}
                <div className="flex justify-between items-center mt-3 mb-4">
                  <span className="font-bold text-sm">TOTAL FINAL</span>
                  <span className="text-xl font-black">${ultimaOrden.total.toFixed(2)}</span>
                </div>

                <p className="text-[10px] text-center text-gray-500 mb-2">¡Gracias por su compra!</p>
              </div>

              {/* Botón de acción */}
              <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border)]">
                <button onClick={() => setShowRecibo(false)} className="btn-primary w-full justify-center">
                  Cerrar e Iniciar Nueva Venta
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
