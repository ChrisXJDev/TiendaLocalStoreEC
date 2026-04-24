'use client';
import { useState, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';
import {
  Search, Plus, Minus, CreditCard, Banknote, Smartphone,
  ReceiptText, X, Clock, ShoppingBag, Lock, Unlock, ArrowLeft, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { Producto, CartItem, MetodoPago, TurnoCaja, Negocio } from '@/lib/types';
import { getNegocioBySlug, getProductos, createOrden, getTurnoActivo } from '@/lib/api';

// ── Styles ──
const s = stylex.create({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.bgMain,
    color: tokens.textMain,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 3rem',
    backgroundColor: tokens.bgSurface,
    borderBottom: `1px solid ${tokens.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  productSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spaceM,
    overflowY: 'auto',
  },
  searchBox: {
    position: 'relative',
    marginBottom: tokens.spaceM,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: tokens.spaceM,
  },
  productCard: {
    backgroundColor: tokens.bgSurface,
    borderRadius: '2.5rem',
    overflow: 'hidden',
    border: `1px solid ${tokens.border}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    textAlign: 'left',
  },
  cardImage: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover',
    borderBottom: `1px solid ${tokens.border}`,
  },
  cardBody: {
    padding: '2rem',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: tokens.textMain,
  },
  cartSidebar: {
    width: '450px',
    backgroundColor: tokens.bgDeep,
    borderLeft: `1px solid ${tokens.border}`,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spaceM,
  },
  cartTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    letterSpacing: '-2px',
    marginBottom: '2rem',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: tokens.bgElevated,
    borderRadius: '1.5rem',
    marginBottom: '1rem',
    border: `1px solid ${tokens.border}`,
  },
  btnAction: {
    padding: '1.5rem',
    borderRadius: '2rem',
    backgroundColor: tokens.accent,
    color: 'white',
    fontWeight: 900,
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: 'auto',
  }
});

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
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const addItem = (p: Producto) => {
    setItems(prev => {
      const ex = prev.find(i => i.producto.id === p.id);
      if (ex) return prev.map(i => i.producto.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto: p, cantidad: 1 }];
    });
  };

  const total = items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  if (loading) return <div {...stylex.props(s.layout)} style={{justifyContent:'center', alignItems:'center'}}>StyleX Terminal Loading...</div>;

  if (!turno) {
    return (
      <div {...stylex.props(s.layout)} style={{justifyContent:'center', alignItems:'center'}}>
        <div style={{textAlign:'center', padding:tokens.spaceL, backgroundColor:tokens.bgSurface, borderRadius:tokens.radiusCard, border:`1px solid ${tokens.border}`}}>
           <Lock size={48} color={tokens.accent} style={{marginBottom:'2rem'}} />
           <h2 style={{fontSize:'3rem', fontWeight:900, letterSpacing:'-2px'}}>Turno Cerrado</h2>
           <p style={{color:tokens.textDim, marginBottom:'3rem'}}>Abre tu turno para comenzar a vender.</p>
           <button {...stylex.props(s.btnAction)}>Abrir Turno</button>
        </div>
      </div>
    );
  }

  return (
    <div {...stylex.props(s.layout)}>
      <header {...stylex.props(s.header)}>
        <div style={{display:'flex', alignItems:'center', gap:'2rem'}}>
          <Link href="/dashboard" style={{textDecoration:'none', color:tokens.textDim, display:'flex', alignItems:'center', gap:'0.5rem'}}>
             <ArrowLeft size={20} /> <span style={{fontWeight:800}}>DASHBOARD</span>
          </Link>
          <div style={{height:'20px', width:'1px', backgroundColor:tokens.border}} />
          <h1 style={{fontSize:'1.5rem', fontWeight:900, letterSpacing:'-1px'}}>POS TERMINAL</h1>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
           <div style={{backgroundColor:'rgba(16, 185, 129, 0.1)', color:tokens.success, padding:'0.5rem 1rem', borderRadius:'1rem', fontSize:'0.75rem', fontWeight:900}}>EN LINEA</div>
           <button style={{backgroundColor:tokens.bgElevated, border:`1px solid ${tokens.border}`, color:'white', padding:'0.5rem', borderRadius:'1rem'}}><X size={20}/></button>
        </div>
      </header>

      <div {...stylex.props(s.mainContent)}>
        <section {...stylex.props(s.productSection)}>
          <div {...stylex.props(s.searchBox)}>
             <input 
               placeholder="Busca por nombre o código..." 
               style={{width:'100%', padding:'2rem 3rem', borderRadius:'2rem', backgroundColor:tokens.bgSurface, border:`1px solid ${tokens.border}`, color:'white', fontSize:'1.25rem', fontWeight:600}}
               value={busqueda}
               onChange={e => setBusqueda(e.target.value)}
             />
          </div>

          <div {...stylex.props(s.productGrid)}>
            {productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).map(p => (
              <button key={p.id} {...stylex.props(s.productCard)} onClick={() => addItem(p)}>
                {p.imagen_url && <img src={p.imagen_url} {...stylex.props(s.cardImage)} />}
                <div {...stylex.props(s.cardBody)}>
                   <p style={{fontSize:'0.7rem', fontWeight:900, color:tokens.accent, textTransform:'uppercase', marginBottom:'0.5rem'}}>{p.categoria}</p>
                   <h4 style={{fontSize:'1.15rem', fontWeight:800, marginBottom:'1rem'}}>{p.nombre}</h4>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span {...stylex.props(s.price)}>${p.precio.toFixed(2)}</span>
                      <div style={{fontSize:'0.75rem', color:tokens.textDim, fontWeight:700}}>{p.stock} ud</div>
                   </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside {...stylex.props(s.cartSidebar)}>
          <h2 {...stylex.props(s.cartTitle)}>Orden</h2>
          
          <div style={{flex:1, overflowY:'auto'}}>
            {items.length === 0 ? (
               <div style={{textAlign:'center', padding:'10rem 0', opacity:0.3}}>
                  <ShoppingBag size={64} style={{marginBottom:'1rem'}} />
                  <p style={{fontWeight:800}}>Carrito Vacío</p>
               </div>
            ) : (
              items.map(item => (
                <div key={item.producto.id} {...stylex.props(s.cartItem)}>
                   <img src={item.producto.imagen_url} style={{width:'50px', height:'50px', borderRadius:'1rem', objectFit:'cover'}} />
                   <div style={{flex:1}}>
                      <p style={{fontSize:'0.9rem', fontWeight:800}}>{item.producto.nombre}</p>
                      <p style={{fontSize:'0.8rem', color:tokens.textDim}}>${item.producto.precio.toFixed(2)}</p>
                   </div>
                   <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                      <span style={{fontWeight:900, fontSize:'1.15rem'}}>{item.cantidad}</span>
                   </div>
                </div>
              ))
            )}
          </div>

          <div style={{marginTop:'auto', paddingTop:tokens.spaceM, borderTop:`1px solid ${tokens.border}`}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
               <span style={{color:tokens.textDim, fontWeight:800}}>Subtotal</span>
               <span style={{fontWeight:800}}>${total.toFixed(2)}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'3rem'}}>
               <span style={{fontSize:'1.5rem', fontWeight:900}}>TOTAL</span>
               <span style={{fontSize:'2.5rem', fontWeight:900, color:tokens.accent}}>${total.toFixed(2)}</span>
            </div>
            
            <button {...stylex.props(s.btnAction)}>
               <ReceiptText size={24} /> COMPLETAR PAGO
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
