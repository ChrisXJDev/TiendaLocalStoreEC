'use client';
import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Plus, Minus, X, MessageCircle, ShoppingCart, Search, LayoutDashboard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNegocioBySlug, getProductos } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { Producto, Negocio } from '@/lib/types';

export default function CatalogoPage() {
  const [catActiva, setCatActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const { items, addItem, removeItem, updateQty, clearCart, toggleCart, isOpen, total, totalItems } = useCartStore();

  useEffect(() => {
    async function loadData() {
      try {
        const neg = await getNegocioBySlug('eleganza');
        if (neg) {
          setNegocio(neg);
          const prods = await getProductos(neg.id);
          setProductos(prods);
        }
      } catch (e) {
        console.error("Error loading catalogue", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const CATEGORIAS = useMemo(() => ['Todas', ...Array.from(new Set(productos.map(p => p.categoria || 'Otro')))], [productos]);

  const filtrados = productos.filter(p => {
    const matchCat = catActiva === 'Todas' || p.categoria === catActiva;
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq && p.activo;
  });

  const handleWhatsApp = () => {
    if (!negocio) return;
    const lineas = items.map(i => `• ${i.cantidad}x ${i.producto.nombre} — $${(i.producto.precio * i.cantidad).toFixed(2)}`);
    const msg = `¡Hola ${negocio.nombre}! Quiero ordenar:\n\n${lineas.join('\n')}\n\n*Total: $${total().toFixed(2)}*`;
    window.open(`https://wa.me/${negocio.telefono}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0B]">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!negocio) {
    return <div className="text-center p-20 text-white bg-[#0A0A0B] min-h-screen">Negocio no encontrado</div>;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0E0E12] text-white overflow-x-hidden selection:bg-orange-500/30">

      {/* ── HEADER SUPERIOR (Búsqueda e Iconos) ── */}
      <header className="bg-[#05050A] border-b border-[#27272A] py-5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start min-w-0">
             <button onClick={() => router.back()} className="text-gray-400 hover:text-white md:hidden flex-shrink-0">
               <ChevronLeft size={24} />
             </button>
             <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <ShoppingBag size={20} />
               </div>
               <h1 className="text-xl md:text-2xl font-black text-white tracking-tight truncate">
                 {negocio.nombre.toUpperCase()}
               </h1>
             </div>
             {/* Mobile Cart Trigger */}
             <button onClick={toggleCart} className="relative text-gray-400 md:hidden flex items-center">
                <ShoppingCart size={24}/>
                {totalItems() > 0 && <span className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{totalItems()}</span>}
             </button>
          </div>

          {/* Central Search Bar */}
          <div className="flex-1 w-full max-w-2xl mx-auto md:mx-10 flex">
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="flex-1 bg-[#12121A] border border-[#27272A] border-r-0 px-4 py-3 text-sm text-white focus:outline-none placeholder-gray-500"
            />
            <button className="bg-orange-600 text-white px-8 py-3 font-bold text-sm hover:bg-orange-500 transition-colors">
              Buscar
            </button>
          </div>

          {/* Right Icons (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
             <div className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-orange-400 transition-colors relative group" onClick={toggleCart}>
                <ShoppingCart size={24} strokeWidth={1.5} />
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border-2 border-[#05050A]">
                  {totalItems()}
                </span>
                <span className="text-[11px] mt-1 font-medium">Tu Pedido</span>
             </div>
          </div>
        </div>
      </header>

      {/* ── BARRA DE NAVEGACIÓN SECUNDARIA ── */}
      <nav className="bg-[#05050A] text-white hidden md:block border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto flex items-center h-14">
          <div className="border-r border-l border-[#27272A] h-full flex items-center px-8 gap-3 font-bold text-sm cursor-pointer w-64 uppercase tracking-wider hover:bg-white/5 transition-colors text-white">
            <LayoutDashboard size={18} className="text-orange-500" /> Explorar Menú
          </div>
          <div className="flex gap-8 px-8 text-sm font-bold tracking-wide h-full">
            <Link href="/" className="flex items-center text-gray-500 hover:text-white transition-colors">Inicio de App</Link>
            <span className="flex items-center text-orange-500 border-b-2 border-orange-500">Local Virtual</span>
          </div>
        </div>
      </nav>

      {/* ── CONTENIDO PRINCIPAL (Estructura RAFCART adaptada genéricamente) ── */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row py-8 px-4 md:px-8 gap-8">
        
        {/* SIDEBAR IZQUIERDO (Checks y Filtros) */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
           <details className="mb-10 group" open>
             <summary className="font-bold text-xs mb-5 uppercase tracking-widest border-b border-[#27272A] pb-3 text-gray-400 cursor-pointer list-none flex items-center justify-between">
               Categorías
               <span className="text-gray-600 group-open:rotate-180 transition-transform">▼</span>
             </summary>
             <div className="flex flex-col gap-1 mt-4">
               {CATEGORIAS.map(cat => (
                 <label key={cat} className="flex items-center pb-4 cursor-pointer group" onClick={() => setCatActiva(cat)}>
                   <div className={`w-5 h-5 flex-shrink-0 border flex items-center justify-center mr-4 transition-colors ${catActiva === cat ? 'bg-orange-600 border-orange-600' : 'border-[#3F3F46] group-hover:border-white'}`}>
                     {catActiva === cat && (
                       <svg width="12" height="9" viewBox="0 0 14 11" fill="none"><path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     )}
                   </div>
                   <span className={`text-sm ${catActiva === cat ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                     {cat}
                   </span>
                 </label>
               ))}
             </div>
           </details>

           <details className="mb-10 group" open>
             <summary className="font-bold text-xs mb-5 uppercase tracking-widest border-b border-[#27272A] pb-3 text-gray-400 cursor-pointer list-none flex items-center justify-between">
               Rango de Precio
               <span className="text-gray-600 group-open:rotate-180 transition-transform">▼</span>
             </summary>
             <div className="mt-4">
               <input type="range" min="0" max="1000" className="w-full accent-orange-500 h-1 bg-[#3F3F46] rounded-lg appearance-none cursor-pointer" />
               <div className="flex items-center justify-between text-xs text-gray-500 mt-4 font-bold">
                 <span>$0</span>
                 <span>$1000+</span>
               </div>
             </div>
           </details>
        </aside>

        {/* GRID DE PRODUCTOS */}
        <main className="flex-1 overflow-hidden">
          
          {/* Filtros Móvil (Navegación Táctil Horizontal) */}
          <div className="md:hidden flex gap-3 overflow-x-auto pb-4 mb-2 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
             {CATEGORIAS.map(cat => (
               <button 
                  key={cat} 
                  onClick={() => setCatActiva(cat)}
                  className={`flex-shrink-0 px-5 py-3 border text-xs font-black uppercase tracking-widest transition-all ${catActiva === cat ? 'bg-orange-600 text-white border-orange-600 shadow-[2px_2px_0_rgba(255,255,255,0.1)]' : 'bg-[#0A0A0A] text-gray-400 border-[#27272A] hover:border-gray-500 hover:text-white'}`}
               >
                 {cat}
               </button>
             ))}
          </div>

          {/* Opciones de Sort/Layout Superior */}
          <div className="flex justify-between items-center bg-[#05050A] border border-[#27272A] py-3 px-4 mb-6">
             <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Mostrando <strong className="text-white">{filtrados.length}</strong> artículos</span>
          </div>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map(p => (
               <div key={p.id} className="group bg-[#000000] border border-[#27272A] flex flex-col hover:border-orange-500 transition-colors duration-300">
                  {/* Contenedor Imagen (Flexibilidad 1:1) */}
                  <div className="aspect-square bg-[#05050A] relative overflow-hidden flex items-center justify-center p-6 border-b border-[#27272A] group-hover:border-orange-500 transition-colors duration-300">
                     <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain mix-blend-screen group-hover:scale-105 transition-transform duration-500"/>
                     
                     {p.stock <= 3 && (
                        <div className={`absolute top-4 left-4 text-[10px] font-black uppercase px-2 py-1 shadow-sm ${p.stock === 0 ? 'bg-[#27272A] text-gray-400' : 'bg-red-500 text-white'}`}>
                          {p.stock === 0 ? 'Agotado' : `Últimos ${p.stock}`}
                        </div>
                     )}
                  </div>

                  {/* Información (Proximidad, Espaciado y Jerarquía) */}
                  <div className="p-6 flex flex-col flex-1 items-start text-left">
                     <h3 className="font-bold text-sm text-gray-300 uppercase tracking-widest line-clamp-2 min-h-[40px] leading-relaxed mb-4">{p.nombre}</h3>
                     
                     <div className="flex items-center gap-3 mb-8 w-full">
                        <span className="text-orange-500 font-black text-2xl">${p.precio.toFixed(2)}</span>
                        <span className="text-gray-600 line-through text-xs font-bold">${(p.precio * 1.25).toFixed(2)}</span>
                     </div>
                     
                     {/* Botón Destacado y Aislado */}
                     <button 
                        onClick={() => addItem(p)}
                        disabled={p.stock === 0}
                        className="w-full mt-auto bg-[#18181B] hover:bg-orange-600 text-white font-black py-4 px-4 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#27272A] hover:border-orange-500 shadow-[4px_4px_0_rgba(255,255,255,0.05)] hover:shadow-none"
                     >
                        Añadir a la orden
                     </button>
                  </div>
               </div>
            ))}
          </div>
          
          {filtrados.length === 0 && (
             <div className="w-full py-20 text-center border-t border-[#27272A] mt-10 text-gray-500">
                Catálogo sin resultados.
             </div>
          )}
        </main>
      </div>

      {/* ── CARRITO O PEDIDO (Drawer Derecho Conservado) ── */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" onClick={toggleCart} />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-[#0A0A0B] border-l border-[#27272A] shadow-2xl flex flex-col animate-slide-right">
            
            <div className="flex items-center justify-between p-5 border-b border-[#27272A]">
              <h2 className="font-bold text-lg uppercase tracking-widest text-orange-500">Tu Pedido</h2>
              <button onClick={toggleCart} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">Pedido vacío</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.producto.id} className="flex gap-4 p-4 bg-[#12121A] border border-[#27272A]">
                    <div className="w-20 h-20 bg-[#05050A] p-2 flex items-center justify-center border border-[#27272A]">
                       <img src={item.producto.imagen_url} alt={item.producto.nombre} className="object-contain w-full h-full mix-blend-screen" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-bold truncate leading-tight mb-1 uppercase tracking-wider text-gray-200">{item.producto.nombre}</p>
                      <p className="text-orange-500 font-black mb-2">${item.producto.precio.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-[#27272A] bg-[#0A0A0B]">
                          <button onClick={() => updateQty(item.producto.id, item.cantidad - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#27272A] text-gray-300 transition-colors"><Minus size={12} /></button>
                          <span className="text-xs font-bold w-6 text-center">{item.cantidad}</span>
                          <button onClick={() => addItem(item.producto)} className="w-8 h-8 flex items-center justify-center hover:bg-[#27272A] text-gray-300 transition-colors"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.producto.id)} className="text-gray-500 hover:text-orange-500 transition-colors ml-auto"><X size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#27272A] bg-[#05050A]">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total</span>
                  <span className="text-3xl font-black text-orange-500">${total().toFixed(2)}</span>
                </div>
                <button onClick={handleWhatsApp} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors mb-3">
                  <MessageCircle size={20} /> Pedir por WhatsApp
                </button>
                <button onClick={clearCart} className="w-full text-center text-xs font-bold text-gray-500 hover:text-white py-2 uppercase tracking-widest transition-colors">
                  Vaciar pedido
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
