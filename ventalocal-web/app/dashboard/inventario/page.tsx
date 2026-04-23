'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, Plus, Pencil, Check, X, Search, BarChart3, Globe,
  Zap, ShoppingBag, TrendingDown, AlertCircle, ArrowLeft, Trash2, Image as ImageIcon
} from 'lucide-react';
import { Producto } from '@/lib/types';
import { getProductos, updateProducto, createProducto, deleteProducto } from '@/lib/api';

const NEGOCIO_ID = '22222222-2222-2222-2222-222222222222'; // Hardcoded para el Demo

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Producto>>({});
  const [busqueda, setBusqueda] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Producto>>({
    nombre: '', descripcion: '', precio: 0, stock: 1, categoria: '', imagen_url: '', activo: true
  });
  const [savingEntity, setSavingEntity] = useState(false);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    setLoading(true);
    const data = await getProductos(NEGOCIO_ID);
    setProductos(data);
    setLoading(false);
  };

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  // ─── UPDATE (Editar Inline) ───
  const startEdit = (p: Producto) => {
    setEditingId(p.id);
    setEditData({ precio: p.precio, stock: p.stock });
  };

  const saveEditInline = async (id: string) => {
    try {
      await updateProducto(id, editData);
      setProductos(prev => prev.map(p => p.id === id ? { ...p, ...editData } : p));
      setEditingId(null);
      setEditData({});
    } catch(err) {
      alert("Error al actualizar");
    }
  };

  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const toggleActivo = async (p: Producto) => {
    try {
      await updateProducto(p.id, { activo: !p.activo });
      setProductos(prev => prev.map(prod => prod.id === p.id ? { ...prod, activo: !p.activo } : prod));
    } catch(err) {
      alert("Error al cambiar estado");
    }
  };

  // ─── DELETE (Eliminar) ───
  const handleDelete = async (id: string) => {
    if(!confirm("¿Estás seguro de eliminar este producto definitivamente?")) return;
    try {
      await deleteProducto(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch(err) {
      alert("Error al eliminar (puede tener órdenes asociadas)");
    }
  };

  // ─── CREATE (Nuevo Producto) ───
  const handleCreate = async () => {
    if (!newProd.nombre || !newProd.precio) return alert("Nombre y Precio son requeridos");
    setSavingEntity(true);
    try {
      const dataToInsert = { ...newProd, negocio_id: NEGOCIO_ID };
      const creado = await createProducto(dataToInsert);
      setProductos(prev => [creado, ...prev]);
      setIsModalOpen(false);
      setNewProd({ nombre: '', descripcion: '', precio: 0, stock: 1, categoria: '', imagen_url: '', activo: true });
    } catch(err) {
      alert("Error al crear el producto");
    }
    setSavingEntity(false);
  };

  // Stats
  const totalStock = productos.reduce((s, p) => s + p.stock, 0);
  const valorInventario = productos.reduce((s, p) => s + p.stock * p.precio, 0);
  const stockBajoCount = productos.filter(p => p.stock <= 5).length;

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
        <nav className="flex flex-col gap-1">
          <Link href="/" className="sidebar-link flex items-center gap-3"><ArrowLeft size={15} /> Volver a inicio</Link>
          <div className="my-2" style={{ height: 1, background: 'var(--border)' }} />
          <Link href="/dashboard" className="sidebar-link flex items-center gap-3"><BarChart3 size={16} /> Dashboard</Link>
          <Link href="/dashboard/inventario" className="sidebar-link active flex items-center gap-3"><Package size={16} /> Inventario</Link>
          <Link href="/pos" className="sidebar-link flex items-center gap-3"><Zap size={16} /> POS</Link>
          <Link href="/tienda/eleganza" className="sidebar-link flex items-center gap-3"><Globe size={16} /> Ver catálogo</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Inventario</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Conectado a la Base de Datos</p>
          </div>
          <button id="btn-nuevo-producto" onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-orange-500/20">
            <Plus size={16} /> Nuevo producto
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Unidades totales', value: loading ? '...' : totalStock.toString(), color: '#7c3aed', icon: Package },
            { label: 'Valor del inventario', value: loading ? '...' : `$${valorInventario.toFixed(2)}`, color: '#10b981', icon: TrendingDown },
            { label: 'Stock crítico (≤5)', value: loading ? '...' : stockBajoCount.toString(), color: '#f59e0b', icon: AlertCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="metric-card">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div className="text-xl font-black">{value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input id="inv-search" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o categoría..." className="input pl-9 w-full" />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden" style={{ padding: 0 }}>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[var(--text-muted)]"><div className="animate-spin inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mb-2"></div><br/>Cargando inventario...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[var(--text-muted)]">No hay productos que coincidan.</td></tr>
              ) : filtrados.map((p, i) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id}
                    style={{ borderBottom: i < filtrados.length - 1 ? '1px solid var(--border)' : 'none' }}
                    className="hover:bg-[var(--bg-elevated)] transition-colors">
                    {/* Producto */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imagen_url ? (
                           <img src={p.imagen_url} alt={p.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                           <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border)]"><ImageIcon size={14} className="opacity-30"/></div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{p.nombre}</p>
                          <p className="text-xs text-[var(--text-muted)] line-clamp-1 max-w-[200px]">{p.descripcion}</p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs font-medium">{p.categoria}</td>

                    {/* Precio */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input id={`edit-precio-${p.id}`} type="number" step="0.01" value={editData.precio}
                          onChange={e => setEditData(d => ({ ...d, precio: parseFloat(e.target.value) }))}
                          className="input text-xs py-1.5" style={{ width: 80 }} />
                      ) : (
                        <span className="font-bold text-white">${p.precio.toFixed(2)}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input id={`edit-stock-${p.id}`} type="number" value={editData.stock}
                          onChange={e => setEditData(d => ({ ...d, stock: parseInt(e.target.value) }))}
                          className="input text-xs py-1.5" style={{ width: 70 }} />
                      ) : (
                        <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-amber' : 'badge-green'}`}>
                          {p.stock} ud{p.stock !== 1 && 's'}
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <button id={`toggle-activo-${p.id}`} onClick={() => toggleActivo(p)}
                        className={`badge cursor-pointer hover:opacity-80 transition-opacity ${p.activo ? 'badge-green' : 'badge-red'}`}>
                        {p.activo ? 'Público' : 'Oculto'}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button id={`save-${p.id}`} onClick={() => saveEditInline(p.id)}
                            className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-colors border border-green-500/30">
                            <Check size={14} className="text-green-400" />
                          </button>
                          <button onClick={cancelEdit}
                            className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] flex items-center justify-center transition-colors border border-[var(--border)]">
                            <X size={14} className="text-[var(--text-muted)]" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button id={`edit-${p.id}`} onClick={() => startEdit(p)}
                            className="w-8 h-8 rounded-lg hover:bg-blue-500/10 flex items-center justify-center transition-colors border border-transparent hover:border-blue-500/30">
                            <Pencil size={14} className="text-[var(--text-muted)] hover:text-blue-400" />
                          </button>
                          <button id={`delete-${p.id}`} onClick={() => handleDelete(p.id)}
                            className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors border border-transparent hover:border-red-500/30">
                            <Trash2 size={14} className="text-[var(--text-muted)] hover:text-red-400" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--bg-elevated)] border-t border-[var(--border)] flex items-center justify-around py-3 px-2 z-40 pb-safe">
        <Link href="/" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <BarChart3 size={20} /> <span className="text-[10px] font-bold">Resumen</span>
        </Link>
        <Link href="/dashboard/inventario" className="flex flex-col items-center gap-1 text-orange-500">
          <Package size={20} /> <span className="text-[10px] font-bold text-white">Inventario</span>
        </Link>
        <Link href="/pos" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <Zap size={20} /> <span className="text-[10px] font-bold">POS</span>
        </Link>
      </nav>

      {/* Modal Nuevo Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade">
           <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
                <X size={16} />
              </button>
              <h2 className="text-xl font-bold text-white mb-6">Nuevo Producto</h2>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Nombre *</label>
                      <input className="input w-full" value={newProd.nombre} onChange={e => setNewProd({...newProd, nombre: e.target.value})} placeholder="Ej. Camiseta Algodón" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Precio * ($)</label>
                      <input type="number" step="0.01" className="input w-full" value={newProd.precio} onChange={e => setNewProd({...newProd, precio: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Stock Inicial</label>
                      <input type="number" className="input w-full" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: parseInt(e.target.value)})} />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Categoría</label>
                       <input className="input w-full" value={newProd.categoria} onChange={e => setNewProd({...newProd, categoria: e.target.value})} placeholder="Ej. Ropa, Electrónica..." />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">URL Imagen (Opcional)</label>
                       <input className="input w-full" value={newProd.imagen_url} onChange={e => setNewProd({...newProd, imagen_url: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Descripción corta</label>
                       <textarea className="input w-full" rows={2} value={newProd.descripcion} onChange={e => setNewProd({...newProd, descripcion: e.target.value})} />
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
                    <button onClick={() => setIsModalOpen(false)} className="btn-ghost px-4 py-2 text-sm font-bold">Cancelar</button>
                    <button onClick={handleCreate} disabled={savingEntity} className="btn-primary shadow-lg shadow-orange-500/20 px-6 py-2 text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                       {savingEntity && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                       Guardar Producto
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--bg-elevated)] border-t border-[var(--border)] flex items-center justify-around py-3 px-2 z-40 pb-safe">
        <Link href="/" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <BarChart3 size={20} /> <span className="text-[10px] font-bold">Resumen</span>
        </Link>
        <Link href="/dashboard/inventario" className="flex flex-col items-center gap-1 text-orange-500">
          <Package size={20} /> <span className="text-[10px] font-bold text-white">Inventario</span>
        </Link>
        <Link href="/pos" className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors">
          <Zap size={20} /> <span className="text-[10px] font-bold">POS</span>
        </Link>
      </nav>

    </div>
  );
}
