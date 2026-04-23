import Link from 'next/link';
import {
  ShoppingBag, Zap, BarChart3, Smartphone, Shield, Globe,
  ArrowRight, CheckCircle2, ChevronRight, PlayCircle, Users, LayoutDashboard, Store
} from 'lucide-react';

const FLUJO_DEMO = [
  {
    step: '1',
    rol: 'El Cliente',
    title: 'Visita el Catálogo',
    desc: 'Entra a tu link personalizado. Ve tus productos, agrega al carrito y te envía el pedido directo a tu WhatsApp.',
    href: '/tienda/eleganza',
    icon: Store,
    color: 'bg-orange-500',
    shadow: 'shadow-[8px_8px_0_rgba(249,115,22,0.3)]'
  },
  {
    step: '2',
    rol: 'El Vendedor',
    title: 'Cobra en el POS',
    desc: 'Recibe al cliente en tu local. Agrega items rápidamente, aplica descuentos e imprime el ticket térmico.',
    href: '/pos',
    icon: Zap,
    color: 'bg-emerald-500',
    shadow: 'shadow-[8px_8px_0_rgba(16,185,129,0.3)]'
  },
  {
    step: '3',
    rol: 'El Dueño',
    title: 'Controla el Negocio',
    desc: 'Revisa de inmediato la ganancia del día, controla alertas de stock bajo y agrega nuevos artículos al inventario.',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'bg-indigo-500',
    shadow: 'shadow-[8px_8px_0_rgba(99,102,241,0.3)]'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#05050A] text-white font-sans overflow-x-hidden selection:bg-orange-500/30">

      {/* Decorative Background Effects (Mantengo el blur circular porque es textura, no UI) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-orange-600 flex items-center justify-center border-2 border-white/10 group-hover:bg-orange-500 transition-colors duration-300">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight uppercase">VentaLocal</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Prototipo Beta</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/tienda/eleganza" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider">Catálogo Demo</Link>
          <div className="w-px h-4 bg-white/10" />
          <Link href="/dashboard" className="px-6 py-2.5 bg-white text-black text-sm font-black hover:bg-zinc-200 transition-colors uppercase tracking-wider border-2 border-transparent hover:border-black shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
            Entrar al App
          </Link>
        </div>
      </nav>

      {/* ── Hero Ecosistema ────────────────────────────────── */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-20 md:pt-32 md:pb-32 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Título y Copy */}
        <div className="flex-1 flex flex-col items-center lg:items-start max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 text-orange-500 text-xs font-black uppercase tracking-widest mb-6">
            <span className="w-2 h-2 bg-orange-500 animate-pulse" />
            Sistema B2B operativo con BD Real
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
            Todo tu negocio.<br />
            <span className="text-orange-500">En una sola pantalla.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-zinc-400 font-medium mb-10 max-w-xl leading-relaxed">
            Catálogo web para tus clientes, Punto de Venta (POS) ultrarrápido para ti y un Dashboard automático que controla tu inventario sin esfuerzo.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="#flujo-demo" className="w-full sm:w-auto px-12 py-4 bg-orange-600 text-white font-black transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(249,115,22,0.5)] border border-orange-500 uppercase tracking-widest flex items-center justify-center gap-3">
              <PlayCircle size={22} /> Iniciar Demo del Flujo
            </Link>
          </div>
        </div>

        {/* Right: Abstract UI Mockup Collage */}
        <div className="flex-1 w-full relative hidden md:block">
           <div className="relative w-full aspect-square max-w-[600px] mx-auto">
             {/* Dashboard Card Deco */}
             <div className="absolute top-10 right-10 w-[350px] p-6 bg-[#0A0A0F] border-2 border-white/10 z-10 hover:-translate-y-2 hover:shadow-[10px_10px_0_rgba(255,255,255,0.05)] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-orange-500/20 text-orange-500 flex items-center justify-center border border-orange-500/30"><BarChart3 size={18}/></div>
                   <div><p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Ventas hoy</p><p className="text-xl font-black text-white">$1,250.00</p></div>
                </div>
                <div className="h-2 w-full bg-[#12121A] overflow-hidden border border-white/5"><div className="h-full w-3/4 bg-orange-500" /></div>
             </div>
             
             {/* POS Ticket Deco */}
             <div className="absolute bottom-10 left-0 w-[280px] p-6 bg-white text-black z-20 hover:-translate-y-2 hover:shadow-[8px_8px_0_rgba(249,115,22,0.8)] transition-all duration-300 border-4 border-black rotate-[-3deg]">
                <div className="border-b-4 border-black pb-4 mb-4 text-center">
                   <p className="font-black text-xl uppercase tracking-widest">TICKET #1042</p>
                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pagado con Tarjeta</p>
                </div>
                <div className="flex justify-between font-black text-lg uppercase tracking-wider"><p>Total</p><p>$45.00</p></div>
             </div>
           </div>
        </div>
      </header>

      {/* ── Explorador de Flujo del Programa (Demo Navigator) ── */}
      <section id="flujo-demo" className="relative z-10 py-24 bg-[#0A0A0F] border-t-2 border-b-2 border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">La Experiencia VentaLocal</h3>
            <p className="text-zinc-400 text-lg">Ponte en los zapatos de tus clientes, de tu cajero y de ti mismo manejando el negocio. Explora el flujo completo del prototipo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
             {/* Línea conectora de fondo (reemplazada por grid estricto, sin decoraciones curvas) */}

             {FLUJO_DEMO.map((item, idx) => (
                <div key={idx} className="relative z-10 flex flex-col group">
                   
                   {/* Número de Paso */}
                   <div className={`w-16 h-16 ${item.color} text-white flex items-center justify-center mb-6 shadow-[4px_4px_0_rgba(255,255,255,0.1)] border-2 border-white/10 group-hover:-translate-y-1 transition-transform`}>
                      <span className="text-2xl font-black">{item.step}</span>
                   </div>

                   {/* Tarjeta de Acción brutalista */}
                   <Link href={item.href} className={`w-full p-8 bg-[#05050A] border-2 border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col h-full hover:shadow-[8px_8px_0_rgba(255,255,255,0.05)] hover:-translate-y-1`}>
                      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                         <div className={`p-2 ${item.color} text-white`}>
                           <item.icon size={18} />
                         </div>
                         <h4 className="font-bold text-zinc-400 uppercase tracking-widest text-xs">{item.rol}</h4>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">{item.title}</h3>
                      <p className="text-zinc-400 leading-relaxed mb-8 flex-1 text-sm font-medium">{item.desc}</p>
                      
                      <div className="mt-2 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:text-orange-500 transition-colors">
                        Simular Paso {item.step} <ArrowRight size={16} />
                      </div>
                   </Link>

                </div>
             ))}
          </div>

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t-2 border-white/5 py-10 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left mt-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 flex items-center justify-center border border-white/10">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest">VentaLocal</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Hecho en Ecuador</p>
          </div>
        </div>
        
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest max-w-xs md:max-w-none">
          Este es un prototipo operativo. Los datos pueden ser modificados.
        </p>
      </footer>
    </div>
  );
}
