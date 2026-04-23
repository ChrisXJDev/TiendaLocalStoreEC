'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, BarChart3, Package, ShoppingCart, TrendingUp,
  ArrowUpRight, ArrowRight, Clock, Globe, Zap, ChevronRight,
  CheckCircle2, AlertCircle, Circle, ArrowLeft, Trophy, Flame
} from 'lucide-react';
import { EstadoOrden, Orden, Producto, TurnoCaja } from '@/lib/types';
import { getNegocioBySlug, getOrdenes, getProductos, updateEstadoOrden, getTurnoActivo } from '@/lib/api';
import { useEffect } from 'react';

const BADGE_MAP: Record<EstadoOrden, string> = {
  pendiente: 'badge-amber',
  confirmada: 'badge-blue',
  entregada: 'badge-green',
  cancelada: 'badge-red',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora mismo';
  if (min < 60) return `hace ${min} min`;
  return `hace ${Math.floor(min / 60)}h`;
}

export default function DashboardPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [turno, setTurno] = useState<TurnoCaja | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDash() {
      try {
        const neg = await getNegocioBySlug('eleganza');
        if (neg) {
          const [ords, prods, activeTurn] = await Promise.all([
            getOrdenes(neg.id),
            getProductos(neg.id),
            getTurnoActivo('33333333-3333-3333-3333-333333333333')
          ]);
          setOrdenes(ords);
          setProductos(prods);
          setTurno(activeTurn);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDash();
  }, []);

  const ventasHoy = ordenes.filter(o => o.estado !== 'cancelada').reduce((s, o) => s + Number(o.total), 0);
  const numOrdenes = ordenes.length;
  const pendientes = ordenes.filter(o => o.estado === 'pendiente').length;
  const ticketProm = numOrdenes > 0 ? ventasHoy / numOrdenes : 0;
  const stockBajo = productos.filter(p => p.stock <= 5);

  // --- Analíticas Intermedias ---
  const detallesVendidos = ordenes
    .filter(o => o.estado !== 'cancelada' && (o as any).detalles_orden)
    .flatMap(o => (o as any).detalles_orden || []);

  const statsPorProducto = productos.map(p => {
    const ventasp = detallesVendidos.filter(d => d.producto_id === p.id);
    const cantVendida = ventasp.reduce((sum, d) => sum + d.cantidad, 0);
    const ingresos = ventasp.reduce((sum, d) => sum + Number(d.subtotal), 0);
    return { ...p, cantVendida, ingresos };
  });

  const topVendidos = [...statsPorProducto]
    .filter(p => p.cantVendida > 0)
    .sort((a, b) => b.cantVendida - a.cantVendida)
    .slice(0, 3);
    
  const trending = [...statsPorProducto]
    .filter(p => p.cantVendida > 0)
    .sort((a, b) => b.ingresos - a.ingresos)[0];

  const updateEstado = async (id: string, estado: EstadoOrden) => {
    // Optimistic UI update
    setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado } : o));
    await updateEstadoOrden(id, estado);
  };

  const METRICS = [
    {
      label: 'Ventas del día', value: `$${ventasHoy.toFixed(2)}`,
      icon: DollarSign2, color: '#10b981', sub: `${numOrdenes} órdenes`,
    },
    {
      label: 'Órdenes pendientes', value: pendientes.toString(),
      icon: AlertCircle, color: '#f59e0b', sub: 'Requieren atención',
    },
    {
      label: 'Ticket promedio', value: `$${ticketProm.toFixed(2)}`,
      icon: TrendingUp, color: '#7c3aed', sub: 'Por orden',
    },
    {
      label: 'Stock crítico', value: stockBajo.length.toString(),
      icon: Package, color: '#ef4444', sub: 'Productos con ≤5 uds',
    },
  ];

  if (loading) {
    return <div className="min-h-screen bg-[var(--bg-base)] text-white flex items-center justify-center">Cargando Dashboard...</div>;
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh' }} className="flex relative pb-16 md:pb-0">
      {/* Sidebar (Desktop) */}
      <aside className="sidebar hidden md:flex md:flex-col flex-shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <ShoppingBag size={15} className="text-white" />
          </div>
          <span className="font-bold text-white">VentaLocal</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/" className="sidebar-link flex items-center gap-3">
            <ArrowLeft size={15} /> Volver a inicio
          </Link>
          <div className="my-2" style={{ height: 1, background: 'var(--border)' }} />
          <Link href="/dashboard" className="sidebar-link active flex items-center gap-3">
            <BarChart3 size={16} /> Dashboard
          </Link>
          <Link href="/dashboard/inventario" className="sidebar-link flex items-center gap-3">
            <Package size={16} /> Inventario
          </Link>
          <Link href="/pos" className="sidebar-link flex items-center gap-3">
            <Zap size={16} /> POS
          </Link>
          <Link href="/tienda/eleganza" className="sidebar-link flex items-center gap-3">
            <Globe size={16} /> Ver catálogo
          </Link>
        </nav>

        {/* Turno info */}
        {turno && (
          <div className="mt-auto p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="dot-live" />
              <span className="text-xs font-semibold text-green-400">Turno activo</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{turno.vendedor_nombre}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              <Clock size={10} className="inline mr-1" />
              {timeAgo(turno.fecha_apertura)}
            </p>
            <p className="text-sm font-bold text-green-400 mt-2">${(turno.ventas_total || 0).toFixed(2)}</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/pos" className="btn-primary w-full sm:w-auto justify-center">
              <Zap size={14} /> Abrir POS
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {METRICS.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="metric-card p-6 rounded-xl group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: color }}></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <ArrowUpRight size={16} className="text-[var(--text-muted)] opacity-30 group-hover:opacity-100 group-hover:text-white transition-all" />
              </div>
              <div className="text-3xl font-black text-white relative z-10 tracking-tight">{value}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)] mt-1 relative z-10">{label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1.5 relative z-10">{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Órdenes recientes */}
          <div className="card lg:col-span-3 rounded-xl flex flex-col p-6 bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-orange-500" />
                <h2 className="font-bold text-lg">Órdenes recientes</h2>
              </div>
              <Link href="/pos" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                Ver POS <ChevronRight size={12} />
              </Link>
            </div>
            
            {ordenes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-50 border-2 border-dashed border-white/5 rounded-xl">
                <ShoppingCart size={40} className="mb-4 text-gray-500" />
                <p className="text-sm font-bold tracking-widest uppercase text-gray-400">No hay órdenes recientes</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Desktop View */}
                <div className="hidden md:flex flex-col divide-y w-full overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                  <div className="min-w-[600px] -mx-6 px-6">
                    {ordenes.map(orden => (
                      <OrdenRow key={orden.id} orden={orden} onUpdate={updateEstado} />
                    ))}
                  </div>
                </div>
                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-3">
                  {ordenes.map(orden => (
                    <OrdenCard key={orden.id} orden={orden} onUpdate={updateEstado} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card lg:col-span-1 p-6 rounded-xl flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold">Stock bajo</h2>
              <Link href="/dashboard/inventario" className="text-xs text-orange-400 hover:text-violet-300 flex items-center gap-1">
                Gestionar <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {stockBajo.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <img src={p.imagen_url} alt={p.nombre} className="w-11 h-11 rounded bg-black/20 object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{p.nombre}</p>
                    <p className="text-xs text-[var(--text-muted)]">${Number(p.precio).toFixed(2)}</p>
                  </div>
                  <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Section (Inteligencia de Negocio) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Top Productos Más Vendidos */}
          <div className="card p-6 rounded-xl flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Trophy size={20} className="text-yellow-500" />
              <h2 className="font-bold text-lg">Top Productos Más Vendidos</h2>
            </div>
            <div className="flex flex-col gap-4">
              {topVendidos.length > 0 ? topVendidos.map((p, ix) => (
                <div key={p.id} className="group relative flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-[var(--bg-elevated)]" style={{ borderColor: 'var(--border)' }}>
                  <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-yellow-500 text-black font-black text-xs flex items-center justify-center shadow-lg border-2 border-[var(--bg-base)]">
                    {ix + 1}
                  </div>
                  <img src={p.imagen_url} alt={p.nombre} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold truncate text-white">{p.nombre}</p>
                    <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{p.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{p.cantVendida} <span className="text-xs font-medium text-[var(--text-muted)]">uds</span></p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-6">No hay datos de ventas suficientes.</p>
              )}
            </div>
          </div>

          {/* Producto en Alza / Trending */}
          <div className="card bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-colors"></div>
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <Flame size={20} className="text-orange-500 animate-pulse" />
              <h2 className="font-bold text-lg">Producto en Alza (Mayor Ingreso)</h2>
            </div>
            
            {trending ? (
              <div className="relative z-10 flex flex-col items-center text-center mt-4">
                <div className="relative">
                  <img src={trending.imagen_url} alt={trending.nombre} className="w-32 h-32 rounded-3xl object-cover shadow-2xl mb-4 border border-[var(--border)]" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold whitespace-nowrap backdrop-blur-md">
                    Trending
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mt-4">{trending.nombre}</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">{trending.descripcion?.slice(0, 80)}...</p>
                
                <div className="grid grid-cols-2 gap-4 w-full px-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Stock Actual</p>
                    <p className={`text-lg font-black ${trending.stock <= 5 ? 'text-red-400' : 'text-white'}`}>{trending.stock} uds</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Ingresos</p>
                    <p className="text-lg font-black text-orange-400">${trending.ingresos?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-10 relative z-10">Esperando más ventas para calcular el producto trend...</p>
            )}
          </div>
          
        </div>
      </main>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--bg-elevated)] border-t border-[var(--border)] flex items-center justify-around py-3 px-2 z-40 pb-safe">
        <Link href="/" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-orange-500">
          <BarChart3 size={20} /> <span className="text-[10px] font-bold text-white">Resumen</span>
        </Link>
        <Link href="/dashboard/inventario" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <Package size={20} /> <span className="text-[10px] font-bold">Inventario</span>
        </Link>
        <Link href="/pos" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <Zap size={20} /> <span className="text-[10px] font-bold">POS</span>
        </Link>
      </nav>
    </div>
  );
}

function DollarSign2({ size, style }: { size: number; style?: React.CSSProperties }) {
  return <TrendingUp size={size} style={style} />;
}

function OrdenCard({ orden, onUpdate }: { orden: Orden; onUpdate: (id: string, e: EstadoOrden) => void }) {
  return (
    <div className="p-4 rounded-2xl border bg-[var(--bg-elevated)]" style={{ borderColor: 'var(--border)' }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-white truncate max-w-[150px]">{orden.cliente_nombre}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{timeAgo(orden.creado_en)}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-white">${Number(orden.total).toFixed(2)}</p>
          <span className={`badge uppercase tracking-wider text-[8px] mt-1 ${BADGE_MAP[orden.estado]}`}>
            {orden.estado}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-4">
        <span className={`badge uppercase tracking-wider text-[8px] ${orden.origen === 'online' ? 'badge-blue' : 'badge-orange'}`}>
          {orden.origen}
        </span>
        <div className="flex gap-2">
          {orden.estado === 'pendiente' && (
            <button 
              onClick={() => onUpdate(orden.id, 'confirmada')}
              className="btn-primary py-1 px-3 text-[10px]">
              Confirmar
            </button>
          )}
          {orden.estado === 'confirmada' && (
            <button 
              onClick={() => onUpdate(orden.id, 'entregada')}
              className="btn-primary py-1 px-3 text-[10px]" style={{ background: 'linear-gradient(135deg, #16c172, #059669)' }}>
              Entregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdenRow({ orden, onUpdate }: { orden: Orden; onUpdate: (id: string, e: EstadoOrden) => void }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5 transition-all hover:bg-[var(--bg-elevated)] group"
      style={{ borderColor: 'var(--border)' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-base font-semibold truncate text-white">{orden.cliente_nombre}</p>
          <span className={`badge uppercase tracking-wider text-[10px] ${orden.origen === 'online' ? 'badge-blue' : 'badge-orange'}`}>
            {orden.origen}
          </span>
        </div>
        <p className="text-sm text-[var(--text-muted)] font-medium">{timeAgo(orden.creado_en)}</p>
      </div>
      <div className="text-right flex items-center gap-4">
        <span className="font-black text-lg text-white">${Number(orden.total).toFixed(2)}</span>
        <span className={`badge uppercase tracking-wider text-[10px] px-3 py-1 ${BADGE_MAP[orden.estado]}`}>{orden.estado}</span>
        <div className="w-32 flex justify-end">
          {orden.estado === 'pendiente' && (
            <button id={`btn-confirmar-${orden.id}`}
              onClick={() => onUpdate(orden.id, 'confirmada')}
              className="btn-primary shadow-lg shadow-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
              Confirmar
            </button>
          )}
          {orden.estado === 'confirmada' && (
            <button id={`btn-entregar-${orden.id}`}
              onClick={() => onUpdate(orden.id, 'entregada')}
              className="btn-primary shadow-lg shadow-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #16c172, #059669)' }}>
              Entregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
