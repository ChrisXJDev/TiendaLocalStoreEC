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
    <div style={{ background: 'var(--bg-base)', minHeight: '100dvh' }} className="flex relative pb-20 md:pb-0 overflow-hidden">
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
      <main className="flex-1 overflow-y-auto p-6 md:p-20 pb-32 md:pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-24 gap-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] text-base mt-3 font-medium opacity-70">
              {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/pos" className="btn-primary w-full sm:w-auto justify-center px-10 py-5 rounded-3xl text-base shadow-2xl">
              <Zap size={18} /> Abrir Terminal POS
            </Link>
          </div>
        </div>

        {/* Metrics - Massively spaced */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 mb-24">
          {METRICS.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="metric-card p-8 md:p-14 rounded-[3rem] group relative overflow-hidden border border-white/5 hover:border-orange-500/20 transition-all bg-white/[0.01]">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[100px] opacity-10" style={{ background: color }}></div>
              <div className="flex items-center justify-between mb-10 md:mb-12 relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                  <Icon size={24} style={{ color }} />
                </div>
              </div>
              <div className="text-3xl md:text-5xl font-black text-white relative z-10 tracking-tighter">{value}</div>
              <div className="text-[10px] md:text-xs font-black text-[var(--text-muted)] mt-4 relative z-10 uppercase tracking-[0.3em] opacity-60">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 md:gap-24 mb-24">
          {/* Órdenes recientes */}
          <div className="card lg:col-span-3 rounded-[3.5rem] flex flex-col p-8 md:p-20 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-16 md:mb-20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center shadow-xl">
                  <ShoppingCart size={32} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="font-black text-2xl md:text-3xl text-white tracking-tight">Órdenes recientes</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1 font-bold uppercase tracking-widest">Últimos movimientos</p>
                </div>
              </div>
              <Link href="/pos" className="text-[10px] md:text-xs text-orange-400 font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:text-orange-300 transition-all">
                IR AL TERMINAL <ChevronRight size={16} />
              </Link>
            </div>
            
            {ordenes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-30 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                <ShoppingCart size={64} className="mb-6 text-gray-500" />
                <p className="text-base font-black tracking-[0.4em] uppercase text-gray-500">Vacío</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {/* Desktop View */}
                <div className="hidden md:flex flex-col divide-y w-full overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                  <div className="min-w-[600px] -mx-10 px-10">
                    {ordenes.map(orden => (
                      <OrdenRow key={orden.id} orden={orden} onUpdate={updateEstado} />
                    ))}
                  </div>
                </div>
                {/* Mobile View */}
                <div className="md:hidden flex flex-col gap-8">
                  {ordenes.slice(0, 5).map(orden => (
                    <OrdenCard key={orden.id} orden={orden} onUpdate={updateEstado} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card lg:col-span-1 p-8 md:p-12 rounded-[3.5rem] flex flex-col bg-white/[0.01]">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-black text-xl text-white tracking-tight">Alerta Stock</h2>
              <Link href="/dashboard/inventario" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-orange-500/20 transition-all shadow-xl">
                <ChevronRight size={20} className="text-orange-400" />
              </Link>
            </div>
            <div className="flex flex-col gap-8">
              {stockBajo.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-6 p-4 md:p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:border-orange-500/30 transition-all shadow-lg">
                  <img src={p.imagen_url} alt={p.nombre} className="w-16 h-16 rounded-2xl bg-black/40 object-cover flex-shrink-0 shadow-2xl border border-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-black truncate text-white tracking-tight">{p.nombre}</p>
                    <p className="text-xs text-[var(--text-muted)] font-bold mt-1.5 opacity-60">${Number(p.precio).toFixed(2)}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black shadow-inner ${p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Section - Massive vertical space */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 mb-32">
          
          {/* Top Productos Más Vendidos */}
          <div className="card p-8 md:p-20 rounded-[3.5rem] flex flex-col bg-white/[0.01]">
            <div className="flex items-center gap-8 mb-16">
              <div className="w-16 h-16 rounded-[2rem] bg-yellow-500/10 flex items-center justify-center shadow-xl">
                <Trophy size={32} className="text-yellow-500" />
              </div>
              <div>
                <h2 className="font-black text-2xl md:text-3xl text-white tracking-tight">Top Vendidos</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1 font-bold uppercase tracking-widest opacity-60">Líderes de mercado</p>
              </div>
            </div>
            <div className="flex flex-col gap-10">
              {topVendidos.length > 0 ? topVendidos.map((p, ix) => (
                <div key={p.id} className="group relative flex items-center gap-8 p-6 md:p-8 rounded-[2.5rem] border transition-all hover:bg-white/[0.03] hover:shadow-2xl" style={{ borderColor: 'var(--border)' }}>
                  <div className="absolute -left-4 -top-4 w-10 h-10 rounded-full bg-yellow-500 text-black font-black text-sm flex items-center justify-center shadow-2xl border-4 border-[var(--bg-base)] z-20">
                    {ix + 1}
                  </div>
                  <img src={p.imagen_url} alt={p.nombre} className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] object-cover shadow-2xl border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-lg md:text-xl font-black truncate text-white tracking-tight">{p.nombre}</p>
                    <p className="text-xs font-bold text-[var(--text-muted)] mt-2 uppercase tracking-[0.2em] opacity-50">{p.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-4xl font-black text-white tracking-tighter">{p.cantVendida} <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">uds</span></p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-20 font-bold uppercase tracking-widest">Sin datos de ventas</p>
              )}
            </div>
          </div>

          {/* Producto en Alza / Trending */}
          <div className="card bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 relative overflow-hidden group p-8 md:p-20 rounded-[3.5rem]">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full group-hover:bg-orange-500/20 transition-all duration-1000"></div>
            
            <div className="flex items-center gap-8 mb-20 relative z-10">
              <div className="w-16 h-16 rounded-[2rem] bg-orange-500/10 flex items-center justify-center shadow-xl">
                <Flame size={32} className="text-orange-500 animate-pulse" />
              </div>
              <div>
                <h2 className="font-black text-2xl md:text-3xl text-white tracking-tight">Producto Estrella</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1 font-bold uppercase tracking-widest opacity-60">Tendencia actual</p>
              </div>
            </div>
            
            {trending ? (
              <div className="relative z-10 flex flex-col items-center text-center mt-10">
                <div className="relative mb-16">
                  <img src={trending.imagen_url} alt={trending.nombre} className="w-56 h-56 md:w-64 md:h-64 rounded-[4rem] object-cover shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute -top-4 -right-4 px-6 py-2.5 bg-green-500 text-black shadow-2xl rounded-2xl text-xs font-black whitespace-nowrap uppercase tracking-[0.3em] border-4 border-[var(--bg-base)]">
                    Trending
                  </div>
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">{trending.nombre}</h3>
                <p className="text-[var(--text-secondary)] text-base md:text-lg mb-16 px-10 font-medium leading-relaxed opacity-70">{trending.descripcion?.slice(0, 100)}...</p>
                
                <div className="grid grid-cols-2 gap-10 w-full">
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-2xl">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 opacity-50">Stock Disponible</p>
                    <p className={`text-2xl md:text-4xl font-black ${trending.stock <= 5 ? 'text-red-400' : 'text-white'} tracking-tighter`}>{trending.stock} <span className="text-sm opacity-30">uds</span></p>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-2xl">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 opacity-50">Ingresos Totales</p>
                    <p className="text-2xl md:text-4xl font-black text-orange-400 tracking-tighter">${trending.ingresos?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-32 flex flex-center items-center justify-center">
                 <p className="text-sm text-[var(--text-muted)] text-center font-bold uppercase tracking-[0.3em] opacity-40">Calculando analíticas...</p>
              </div>
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
