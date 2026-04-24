'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';
import {
  Package, Plus, Pencil, Check, X, Search, BarChart3, Globe,
  Zap, ShoppingBag, TrendingDown, AlertCircle, ArrowLeft, Trash2, Image as ImageIcon
} from 'lucide-react';
import { Producto } from '@/lib/types';
import { getProductos, updateProducto, createProducto, deleteProducto } from '@/lib/api';

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
    fontSize: '4rem',
    fontWeight: 900,
    letterSpacing: '-3px',
    marginBottom: '1rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: tokens.spaceM,
    marginBottom: tokens.spaceL,
  },
  metricCard: {
    padding: '2.5rem',
    backgroundColor: tokens.bgSurface,
    borderRadius: '2.5rem',
    border: `1px solid ${tokens.border}`,
  },
  tableCard: {
    backgroundColor: tokens.bgSurface,
    borderRadius: tokens.radiusCard,
    border: `1px solid ${tokens.border}`,
    overflow: 'hidden',
    padding: tokens.spaceM,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '1.5rem',
    color: tokens.textMuted,
    fontSize: '0.7rem',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    borderBottom: `1px solid ${tokens.border}`,
  },
  td: {
    padding: '2rem 1.5rem',
    borderBottom: `1px solid ${tokens.border}`,
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
  },
  btnPrimary: {
    padding: '1.5rem 3rem',
    borderRadius: '2rem',
    backgroundColor: tokens.accent,
    color: 'white',
    fontWeight: 900,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
  }
});

const NEGOCIO_ID = '22222222-2222-2222-2222-222222222222';

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    setLoading(true);
    const data = await getProductos(NEGOCIO_ID);
    setProductos(data);
    setLoading(false);
  };

  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) return <div {...stylex.props(s.layout)} style={{justifyContent:'center', alignItems:'center'}}>StyleX Inventory Engine...</div>;

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
          <Link href="/dashboard" {...stylex.props(s.navLink)}><BarChart3 size={20}/> Dashboard</Link>
          <Link href="/dashboard/inventario" {...stylex.props(s.navLink, s.activeLink)}><Package size={20}/> Inventario</Link>
          <Link href="/pos" {...stylex.props(s.navLink)}><Zap size={20}/> Terminal POS</Link>
          <Link href="/tienda/eleganza" {...stylex.props(s.navLink)}><Globe size={20}/> Catálogo</Link>
        </nav>
      </aside>

      <main {...stylex.props(s.main)}>
        <header {...stylex.props(s.header)}>
          <div>
            <h1 {...stylex.props(s.title)}>Inventario</h1>
            <p style={{fontSize:'1.25rem', color:tokens.textDim, fontWeight:500}}>Gestión centralizada de stock</p>
          </div>
          <button {...stylex.props(s.btnPrimary)}>
            <Plus size={18} /> Nuevo Producto
          </button>
        </header>

        <section {...stylex.props(s.summaryGrid)}>
           <div {...stylex.props(s.metricCard)}>
              <p style={{fontSize:'0.75rem', fontWeight:900, color:tokens.textMuted, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'1rem'}}>Unidades Totales</p>
              <p style={{fontSize:'3rem', fontWeight:900, letterSpacing:'-2px'}}>{productos.reduce((s,p)=>s+p.stock, 0)}</p>
           </div>
           <div {...stylex.props(s.metricCard)}>
              <p style={{fontSize:'0.75rem', fontWeight:900, color:tokens.textMuted, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'1rem'}}>Valor Almacén</p>
              <p style={{fontSize:'3rem', fontWeight:900, letterSpacing:'-2px'}}>${productos.reduce((s,p)=>s+(p.stock*p.precio), 0).toFixed(2)}</p>
           </div>
           <div {...stylex.props(s.metricCard)}>
              <p style={{fontSize:'0.75rem', fontWeight:900, color:tokens.textMuted, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'1rem'}}>Alertas Críticas</p>
              <p style={{fontSize:'3rem', fontWeight:900, letterSpacing:'-2px', color:tokens.accent}}>{productos.filter(p=>p.stock<=5).length}</p>
           </div>
        </section>

        <section {...stylex.props(s.tableCard)}>
          <div style={{padding:'2rem', borderBottom:`1px solid ${tokens.border}`, display:'flex', gap:'2rem', alignItems:'center'}}>
             <Search size={20} color={tokens.textMuted} />
             <input 
               placeholder="Buscar en el almacén..." 
               style={{flex:1, background:'none', border:'none', color:'white', fontSize:'1.5rem', fontWeight:600, outline:'none'}}
               value={busqueda}
               onChange={e => setBusqueda(e.target.value)}
             />
          </div>
          <table {...stylex.props(s.table)}>
            <thead>
              <tr>
                <th {...stylex.props(s.th)}>Producto</th>
                <th {...stylex.props(s.th)}>Categoría</th>
                <th {...stylex.props(s.th)}>Precio</th>
                <th {...stylex.props(s.th)}>Stock</th>
                <th {...stylex.props(s.th)}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td {...stylex.props(s.td)}>
                    <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
                       <img src={p.imagen_url} style={{width:'60px', height:'60px', borderRadius:'1.5rem', objectFit:'cover'}} />
                       <div>
                          <p style={{fontWeight:800, fontSize:'1.1rem'}}>{p.nombre}</p>
                          <p style={{fontSize:'0.8rem', color:tokens.textDim}}>{p.id.split('-')[0]}</p>
                       </div>
                    </div>
                  </td>
                  <td {...stylex.props(s.td)} style={{fontWeight:700, color:tokens.textDim}}>{p.categoria}</td>
                  <td {...stylex.props(s.td)} style={{fontWeight:900, fontSize:'1.25rem'}}>${p.precio.toFixed(2)}</td>
                  <td {...stylex.props(s.td)}>
                    <span style={{padding:'0.5rem 1.5rem', borderRadius:'1rem', background: p.stock <= 5 ? 'rgba(255,90,31,0.1)' : 'rgba(16,185,129,0.1)', color: p.stock <= 5 ? tokens.accent : tokens.success, fontWeight:900, fontSize:'0.8rem'}}>
                       {p.stock} ud
                    </span>
                  </td>
                  <td {...stylex.props(s.td)}>
                    <div style={{display:'flex', gap:'1rem'}}>
                       <button style={{padding:'0.75rem', borderRadius:'1rem', background:'var(--vl-border)', border:'none', cursor:'pointer'}}><Pencil size={18} color="white" /></button>
                       <button style={{padding:'0.75rem', borderRadius:'1rem', background:'var(--vl-border)', border:'none', cursor:'pointer'}}><Trash2 size={18} color={tokens.accent} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
