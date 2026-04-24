'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
import {
  ShoppingBag, BarChart3, Package, ShoppingCart, TrendingUp,
  Clock, Globe, Zap, ChevronRight, ArrowLeft, Trophy, Flame
} from 'lucide-react';
import { Orden, Producto, TurnoCaja } from '@/lib/types';
import { getNegocioBySlug, getOrdenes, getProductos, getTurnoActivo } from '@/lib/api';

// ── Styles ──
const s = stylex.create({
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: tokens.bgMain,
    color: tokens.textMain,
  },
  sidebar: {
    width: '320px',
    backgroundColor: tokens.bgSurface,
    borderRight: `1px solid ${tokens.border}`,
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  main: {
    flex: 1,
    padding: tokens.spaceL,
    maxWidth: '1800px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: tokens.spaceL,
  },
  title: {
    fontSize: '5rem',
    fontWeight: 900,
    letterSpacing: '-4px',
    lineHeight: 0.9,
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: tokens.textDim,
    fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spaceM,
    marginBottom: tokens.spaceXL,
  },
  metricCard: {
    padding: '3rem',
    borderRadius: '3rem',
    backgroundColor: tokens.bgElevated,
    border: `1px solid ${tokens.border}`,
    transition: 'transform 0.4s ease',
  },
  metricValue: {
    fontSize: '3.5rem',
    fontWeight: 900,
    letterSpacing: '-3px',
    marginBottom: '0.5rem',
  },
  metricLabel: {
    color: tokens.textDim,
    textTransform: 'uppercase',
    fontWeight: 800,
    fontSize: '0.75rem',
    letterSpacing: '0.3em',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem 3rem',
    borderRadius: '2rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontSize: '0.8rem',
    cursor: 'pointer',
    backgroundColor: tokens.accent,
    color: 'white',
    textDecoration: 'none',
    transition: 'transform 0.2s',
  },
  card: {
    backgroundColor: tokens.bgSurface,
    border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radiusCard,
    padding: tokens.spaceL,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.5rem',
    color: tokens.textDim,
    textDecoration: 'none',
    fontWeight: 600,
    borderRadius: '2rem',
    transition: 'all 0.3s',
  },
  activeLink: {
    backgroundColor: 'rgba(255, 90, 31, 0.1)',
    color: tokens.accent,
  }
});

export default function DashboardPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDash() {
      try {
        const neg = await getNegocioBySlug('eleganza');
        if (neg) {
          const [ords, prods] = await Promise.all([
            getOrdenes(neg.id),
            getProductos(neg.id)
          ]);
          setOrdenes(ords);
          setProductos(prods);
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
  const stockBajo = productos.filter(p => p.stock <= 5);

  const statsPorProducto = productos.map(p => {
    const ventasp = ordenes.flatMap(o => (o as any).detalles_orden || []).filter(d => d.producto_id === p.id);
    return { ...p, cantVendida: ventasp.reduce((sum, d) => sum + d.cantidad, 0), ingresos: ventasp.reduce((sum, d) => sum + Number(d.subtotal), 0) };
  });

  const topVendidos = statsPorProducto.filter(p => p.cantVendida > 0).sort((a, b) => b.cantVendida - a.cantVendida).slice(0, 3);
  const trending = statsPorProducto.filter(p => p.cantVendida > 0).sort((a, b) => b.ingresos - a.ingresos)[0];

  if (loading) return <div {...stylex.props(s.layout)} style={{justifyContent:'center', alignItems:'center'}}>Iniciando StyleX Engine...</div>;

  return (
    <div {...stylex.props(s.layout)}>
      <aside {...stylex.props(s.sidebar)}>
        <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'4rem'}}>
          <div style={{backgroundColor: tokens.accent, padding:'0.5rem', borderRadius:'0.75rem'}}>
             <ShoppingBag size={20} color="white" />
          </div>
          <span style={{fontWeight:900, fontSize:'1.25rem', letterSpacing:'-1px'}}>VENTALOCAL</span>
        </div>

        <nav style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
          <Link href="/dashboard" {...stylex.props(s.navLink, s.activeLink)}><BarChart3 size={20}/> Dashboard</Link>
          <Link href="/dashboard/inventario" {...stylex.props(s.navLink)}><Package size={20}/> Inventario</Link>
          <Link href="/pos" {...stylex.props(s.navLink)}><Zap size={20}/> Terminal POS</Link>
          <Link href="/tienda/eleganza" {...stylex.props(s.navLink)}><Globe size={20}/> Catálogo</Link>
        </nav>
      </aside>

      <main {...stylex.props(s.main)}>
        <header {...stylex.props(s.header)}>
          <div>
            <h1 {...stylex.props(s.title)}>Dashboard</h1>
            <p {...stylex.props(s.subtitle)}>Separación Total & StyleX Performance</p>
          </div>
          <Link href="/pos" {...stylex.props(s.btn)}>
            <Zap size={18} /> Nueva Venta
          </Link>
        </header>

        <section {...stylex.props(s.grid)}>
          <div {...stylex.props(s.metricCard)}>
            <div {...stylex.props(s.metricLabel)}>Ventas Hoy</div>
            <div {...stylex.props(s.metricValue)}>${ventasHoy.toFixed(2)}</div>
          </div>
          <div {...stylex.props(s.metricCard)}>
            <div {...stylex.props(s.metricLabel)}>Órdenes</div>
            <div {...stylex.props(s.metricValue)}>{ordenes.length}</div>
          </div>
          <div {...stylex.props(s.metricCard)}>
            <div {...stylex.props(s.metricLabel)}>Stock Bajo</div>
            <div {...stylex.props(s.metricValue)} style={{color: stockBajo.length > 0 ? tokens.accent : 'white'}}>{stockBajo.length}</div>
          </div>
          <div {...stylex.props(s.metricCard)}>
            <div {...stylex.props(s.metricLabel)}>Ticket Promedio</div>
            <div {...stylex.props(s.metricValue)}>${(ventasHoy / (ordenes.length || 1)).toFixed(2)}</div>
          </div>
        </section>

        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: '5rem'}}>
          <section {...stylex.props(s.card)}>
            <h2 style={{fontSize:'2.5rem', fontWeight:900, marginBottom:'3rem', letterSpacing:'-1px'}}>Top Ventas</h2>
            <div style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
              {topVendidos.map((p, i) => (
                <div key={p.id} style={{display:'flex', alignItems:'center', gap:'2rem', padding:'2rem', backgroundColor:tokens.bgElevated, borderRadius:'2.5rem', border: `1px solid ${tokens.border}`}}>
                   <span style={{fontSize:'1.5rem', fontWeight:900, color:tokens.textMuted}}>0{i+1}</span>
                   <img src={p.imagen_url} style={{width:'100px', height:'100px', borderRadius:'2rem', objectFit:'cover'}} />
                   <div style={{flex:1}}>
                      <h4 style={{fontSize:'1.5rem', fontWeight:800}}>{p.nombre}</h4>
                      <p style={{color:tokens.textDim, fontSize:'1rem'}}>{p.categoria}</p>
                   </div>
                   <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'2rem', fontWeight:900}}>{p.cantVendida}</div>
                      <div style={{fontSize:'0.75rem', fontWeight:800, color:tokens.textMuted}}>UDS</div>
                   </div>
                </div>
              ))}
            </div>
          </section>

          <section {...stylex.props(s.card)} style={{background:'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)'}}>
            <h2 style={{fontSize:'2.5rem', fontWeight:900, marginBottom:'3rem', letterSpacing:'-1px'}}>Estrella</h2>
            {trending ? (
              <div style={{textAlign:'center'}}>
                <img src={trending.imagen_url} style={{width:'100%', aspectRatio:'1/1', borderRadius:'4rem', objectFit:'cover', marginBottom:'3rem', border: `1px solid ${tokens.border}`}} />
                <h3 style={{fontSize:'3rem', fontWeight:900, letterSpacing:'-2px'}}>{trending.nombre}</h3>
              </div>
            ) : <p>Cargando estrella...</p>}
          </section>
        </div>
      </main>
    </div>
  );
}
