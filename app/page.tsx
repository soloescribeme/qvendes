'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, ShieldCheck, Heart, Share2, MessageSquare, Tag, Flag, 
  MapPin, CheckCircle2, Lock, User, Star, SlidersHorizontal, Sparkles, 
  LogOut, LogIn, UserCheck, X, Camera, DollarSign, Send, Phone, MessageCircle
} from 'lucide-react';

interface Anuncio {
  id: number;
  vendedor_id: number;
  titulo: string;
  precio: number;
  condicion: 'nuevo' | 'usado' | 'servicio';
  categoria: string;
  ciudad: string;
  descripcion: string;
  foto1?: string;
  foto2?: string;
  foto3?: string;
  foto4?: string;
  metodos_pago?: string;
  metodos_envio?: string;
  es_top: boolean;
  es_patrocinado: boolean;
  vendedor_nombre: string;
  vendedor_celular?: string;
  vendedor_email?: string;
  vendedor_verificado: boolean;
  creado_en: string;
}

interface MensajeItem {
  id: number;
  anuncio_id: number;
  emisor_id: number;
  receptor_id: number;
  mensaje: string;
  emisor_nombre: string;
  creado_en: string;
}

export default function QvendesHome() {
  const router = useRouter();

  // USUARIO EN SESIÓN (Autenticación personalizada mediante Neon DB)
  const [user, setUser] = useState<{ id: number; nombre: string; email: string; celular?: string; ciudad?: string; es_verificado: boolean; saldo_billetera: number } | null>(null);

  // ANUNCIOS
  const [anunciosTop, setAnunciosTop] = useState<Anuncio[]>([]);
  const [anunciosFeed, setAnunciosFeed] = useState<Anuncio[]>([]);
  const [cargandoAnuncios, setCargandoAnuncios] = useState(true);

  // FILTROS DE BÚSQUEDA (COMBINABLES E INDIVIDUALES)
  const [busqueda, setBusqueda] = useState('');
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroCondicion, setFiltroCondicion] = useState('');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // MODALES
  const [anuncioDetalle, setAnuncioDetalle] = useState<Anuncio | null>(null);
  const [fotoSeleccionadaIndex, setFotoSeleccionadaIndex] = useState(0);
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'register'>('login');
  const [mostrarModalPublicar, setMostrarModalPublicar] = useState(false);
  const [mostrarModalVerificacion, setMostrarModalVerificacion] = useState(false);
  const [mostrarModalDenuncia, setMostrarModalDenuncia] = useState(false);
  const [mostrarModalChat, setMostrarModalChat] = useState(false);
  const [vendedorVerPerfil, setVendedorVerPerfil] = useState<{ id: number; nombre: string; celular?: string; verificado: boolean } | null>(null);

  // ESTADOS DE FORMULARIO DE AUTH
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authNombre, setAuthNombre] = useState('');
  const [authCelular, setAuthCelular] = useState('');
  const [authCiudad, setAuthCiudad] = useState('Loja');
  const [authError, setAuthError] = useState('');
  const [authProcesando, setAuthProcesando] = useState(false);

  // ESTADOS DE FORMULARIO DE PUBLICACIÓN
  const [pubTitulo, setPubTitulo] = useState('');
  const [pubPrecio, setPubPrecio] = useState('');
  const [pubCondicion, setPubCondicion] = useState<'nuevo' | 'usado' | 'servicio'>('nuevo');
  const [pubCategoria, setPubCategoria] = useState('Vehículos');
  const [pubCiudad, setPubCiudad] = useState('Loja');
  const [pubDescripcion, setPubDescripcion] = useState('');
  const [pubFoto1, setPubFoto1] = useState('');
  const [pubFoto2, setPubFoto2] = useState('');
  const [pubFoto3, setPubFoto3] = useState('');
  const [pubFoto4, setPubFoto4] = useState('');
  const [pubMetodosPago, setPubMetodosPago] = useState('Efectivo / Transferencia Directa / Escrow Platform');
  const [pubMetodosEnvio, setPubMetodosEnvio] = useState('Entrega personal o Envío a provincias');
  const [pubProcesando, setPubProcesando] = useState(false);

  // ESTADOS DE VERIFICACIÓN PRIVADA (Cédula / Selfie / Servicio básico)
  const [verDocCedula, setVerDocCedula] = useState('');
  const [verDireccion, setVerDireccion] = useState('');
  const [verFotoCedula, setVerFotoCedula] = useState('');
  const [verFotoServicio, setVerFotoServicio] = useState('');
  const [verFotoSelfie, setVerFotoSelfie] = useState('');
  const [verProcesando, setVerProcesando] = useState(false);

  // CHAT INTERNO 100% EXCLUSIVO
  const [mensajesChat, setMensajesChat] = useState<MensajeItem[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  // DENUNCIA
  const [denunciaMotivo, setDenunciaMotivo] = useState('Fraude o Perfil Falso');
  const [denunciaDetalle, setDenunciaDetalle] = useState('');
  const [denunciaEnviada, setDenunciaEnviada] = useState(false);

  // FAVORITOS LOCALES
  const [favoritos, setFavoritos] = useState<number[]>([]);

  // CARGAR ANUNCIOS CON FILTROS
  const cargarAnuncios = async () => {
    setCargandoAnuncios(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append('q', busqueda);
      if (filtroCiudad) params.append('ciudad', filtroCiudad);
      if (filtroCondicion) params.append('condicion', filtroCondicion);
      if (filtroPrecioMin) params.append('precio_min', filtroPrecioMin);
      if (filtroPrecioMax) params.append('precio_max', filtroPrecioMax);

      const res = await fetch(`/api/anuncios?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAnunciosTop(data.top || []);
        setAnunciosFeed(data.feed || []);
      }
    } catch (e) {
      console.error('Error cargando anuncios:', e);
    } finally {
      setCargandoAnuncios(false);
    }
  };

  useEffect(() => {
    cargarAnuncios();
    // Recuperar sesión persistida en localStorage si existe
    const sesionGuardada = localStorage.getItem('qvendes_user');
    if (sesionGuardada) {
      try {
        setUser(JSON.parse(sesionGuardada));
      } catch {}
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarAnuncios();
  };

  // LOGIN / REGISTRO COMÚN
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthProcesando(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: modoAuth,
          email: authEmail,
          password: authPassword,
          nombre: authNombre,
          celular: authCelular,
          ciudad: authCiudad
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error en la autenticación.');
      }

      setUser(data.user);
      localStorage.setItem('qvendes_user', JSON.stringify(data.user));
      setMostrarModalAuth(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error al procesar la sesión.');
    } finally {
      setAuthProcesando(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qvendes_user');
  };

  // PUBLICAR ANUNCIO
  const handlePublicarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPubProcesando(true);
    try {
      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedor_id: user.id,
          titulo: pubTitulo,
          precio: pubPrecio,
          condicion: pubCondicion,
          categoria: pubCategoria,
          ciudad: pubCiudad,
          descripcion: pubDescripcion,
          foto1: pubFoto1,
          foto2: pubFoto2,
          foto3: pubFoto3,
          foto4: pubFoto4,
          metodos_pago: pubMetodosPago,
          metodos_envio: pubMetodosEnvio
        })
      });

      if (res.ok) {
        setMostrarModalPublicar(false);
        // Reset form
        setPubTitulo('');
        setPubPrecio('');
        setPubDescripcion('');
        setPubFoto1('');
        setPubFoto2('');
        setPubFoto3('');
        setPubFoto4('');
        cargarAnuncios();
      }
    } catch (e) {
      console.error('Error al publicar anuncio:', e);
    } finally {
      setPubProcesando(false);
    }
  };

  // FORMULARIO DE VERIFICACIÓN PRIVADA
  const handleVerificacionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setVerProcesando(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verificar_identidad',
          usuario_id: user.id,
          documento_cedula: verDocCedula,
          foto_cedula: verFotoCedula,
          foto_servicio_basico: verFotoServicio,
          foto_selfie_cedula: verFotoSelfie,
          direccion_fisica: verDireccion
        })
      });

      if (res.ok) {
        const usuarioActualizado = { ...user, es_verificado: true };
        setUser(usuarioActualizado);
        localStorage.setItem('qvendes_user', JSON.stringify(usuarioActualizado));
        setMostrarModalVerificacion(false);
      }
    } catch (e) {
      console.error('Error al enviar verificación:', e);
    } finally {
      setVerProcesando(false);
    }
  };

  // CHAT INTERNO 100% EXCLUSIVO
  const cargarMensajesInternos = async (anuncioId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/mensajes?usuario_id=${user.id}&anuncio_id=${anuncioId}`);
      if (res.ok) {
        const data = await res.json();
        setMensajesChat(data);
      }
    } catch (e) {
      console.error('Error cargando mensajes:', e);
    }
  };

  const handleEnviarMensajeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !anuncioDetalle || !nuevoMensaje.trim()) return;
    setEnviandoMensaje(true);
    try {
      const res = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncio_id: anuncioDetalle.id,
          emisor_id: user.id,
          receptor_id: anuncioDetalle.vendedor_id,
          mensaje: nuevoMensaje
        })
      });

      if (res.ok) {
        setNuevoMensaje('');
        cargarMensajesInternos(anuncioDetalle.id);
      }
    } catch (e) {
      console.error('Error enviando mensaje:', e);
    } finally {
      setEnviandoMensaje(false);
    }
  };

  // DENUNCIAR ANUNCIO
  const handleEnviarDenuncia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anuncioDetalle) return;
    try {
      await fetch('/api/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncio_id: anuncioDetalle.id,
          denunciante_id: user?.id,
          motivo: denunciaMotivo,
          detalle: denunciaDetalle
        })
      });
      setDenunciaEnviada(true);
      setTimeout(() => {
        setDenunciaEnviada(false);
        setMostrarModalDenuncia(false);
      }, 2000);
    } catch (e) {
      console.error('Error al enviar denuncia:', e);
    }
  };

  const toggleFavorito = (anuncioId: number) => {
    if (favoritos.includes(anuncioId)) {
      setFavoritos(favoritos.filter(id => id !== anuncioId));
    } else {
      setFavoritos([...favoritos, anuncioId]);
    }
  };

  const compartirAnuncio = (a: Anuncio) => {
    const url = `${window.location.origin}/?anuncio=${a.id}`;
    navigator.clipboard.writeText(url);
    alert('¡Enlace de la publicación copiado al portapapeles!');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-12 selection:bg-purple-500 selection:text-white">
      
      {/* 🔮 ENCABEZADO / NAVBAR */}
      <header className="border-b border-slate-850 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo.jpg" alt="Qvendes Logo" className="h-12 w-auto object-contain rounded-xl shadow-lg ring-1 ring-purple-500/30" />
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none">
                Qvendes <span className="text-purple-400 font-extrabold">.app</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marketplace Certificado</span>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA PRINCIPAL POR PALABRAS CLAVE */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-inner focus-within:border-purple-500 transition-all">
            <Search className="w-4 h-4 text-purple-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar autos, laptops, departamentos, servicios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent border-none text-xs text-white outline-none w-full font-medium placeholder-slate-500"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow transition-all">
              Buscar
            </button>
          </form>

          {/* ACCIONES DE USUARIO */}
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => router.push('/admin/patrocinadores')}
              className="hidden lg:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-purple-300 text-xs font-bold px-3 py-2 rounded-xl transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Admin Patrocinados
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalPublicar(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  + Publicar Anuncio
                </button>

                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center font-black text-white uppercase text-xs">
                    {user.nombre.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="font-bold text-white block leading-none">{user.nombre}</span>
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                      {user.es_verificado ? '🛡️ Verificado' : '👤 Usuario Registrado'}
                    </span>
                  </div>
                  <button type="button" onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1" title="Cerrar Sesión">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setModoAuth('login'); setMostrarModalAuth(true); }}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Ingresar / Registrarse
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BARRA DE FILTROS Y BÚSQUEDA MÓVIL */}
      <div className="bg-slate-900/60 border-b border-slate-850 p-4 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              className="bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              Filtros Avanzados {mostrarFiltrosAvanzados ? '▲' : '▼'}
            </button>

            {/* SELECCIÓN RÁPIDA DE CONDICIÓN */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
              <button type="button" onClick={() => { setFiltroCondicion(''); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${!filtroCondicion ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                Todos
              </button>
              <button type="button" onClick={() => { setFiltroCondicion('nuevo'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'nuevo' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                Nuevos
              </button>
              <button type="button" onClick={() => { setFiltroCondicion('usado'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'usado' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                Usados
              </button>
              <button type="button" onClick={() => { setFiltroCondicion('servicio'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'servicio' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                Servicios
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Mostrando publicaciones activas en orden <strong className="text-purple-400">aleatorio rándom</strong> para equidad.
          </div>
        </div>

        {/* PANEL DESPLEGABLE DE FILTROS COMBINABLES O INDIVIDUALES */}
        {mostrarFiltrosAvanzados && (
          <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto pt-4 mt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Ciudad / Ubicación</label>
              <select value={filtroCiudad} onChange={(e) => setFiltroCiudad(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold">
                <option value="">Todas las ciudades</option>
                <option value="Loja">Loja</option>
                <option value="Quito">Quito</option>
                <option value="Guayaquil">Guayaquil</option>
                <option value="Cuenca">Cuenca</option>
                <option value="Ambato">Ambato</option>
                <option value="Machala">Machala</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Precio Mínimo ($)</label>
              <input type="number" placeholder="Ej. 10" value={filtroPrecioMin} onChange={(e) => setFiltroPrecioMin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Precio Máximo ($)</label>
              <input type="number" placeholder="Ej. 1500" value={filtroPrecioMax} onChange={(e) => setFiltroPrecioMax(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none" />
            </div>

            <div className="flex items-end gap-2">
              <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase py-2.5 rounded-xl shadow">
                Aplicar Filtros
              </button>
              <button type="button" onClick={() => { setFiltroCiudad(''); setFiltroCondicion(''); setFiltroPrecioMin(''); setFiltroPrecioMax(''); setBusqueda(''); cargarAnuncios(); }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl font-bold">
                Limpiar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL MARKETPLACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-10 flex-1">
        
        {/* RENGLÓN DE ANUNCIOS TOP / DESTACADOS */}
        {anunciosTop.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-black text-amber-400 uppercase tracking-wider">⭐ Anuncios TOP Destacados</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {anunciosTop.map((a) => (
                <div 
                  key={a.id} 
                  onClick={() => { setAnuncioDetalle(a); setFotoSeleccionadaIndex(0); }}
                  className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all cursor-pointer relative group flex flex-col justify-between"
                >
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 rounded-full shadow-lg z-10">
                    ⭐ TOP DESTACADO
                  </div>

                  <div className="h-44 bg-slate-950 relative flex items-center justify-center overflow-hidden">
                    {a.foto1 ? (
                      <img src={a.foto1} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" />
                    ) : (
                      <div className="text-3xl text-purple-400">🛍️</div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-black text-base font-mono">${Number(a.precio).toFixed(2)} USD</span>
                      <span className="bg-slate-800 text-slate-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg border border-slate-750">
                        {a.condicion}
                      </span>
                    </div>

                    <h3 className="font-black text-white text-sm line-clamp-1 group-hover:text-purple-300 transition-all">{a.titulo}</h3>
                    
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-850 pt-2">
                      <span className="flex items-center gap-1 font-bold text-white">
                        <MapPin className="w-3 h-3 text-purple-400" /> {a.ciudad}
                      </span>
                      {a.vendedor_verificado && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          🛡️ Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FEED DE ANUNCIOS REGULARES CON ORDEN ALEATORIO RÁNDOM */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              🛍️ Explorar Publicaciones ({anunciosFeed.length})
            </h2>
            <span className="text-xs text-purple-400 font-mono font-bold">Rotación Rándom Equitativa</span>
          </div>

          {cargandoAnuncios ? (
            <p className="text-center text-xs text-slate-400 py-16">Cargando catálogo de productos y servicios...</p>
          ) : anunciosFeed.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-slate-900/40 rounded-3xl border border-slate-850">
              <div className="text-4xl text-purple-400">🔍</div>
              <h3 className="text-base font-black text-white uppercase">No se encontraron publicaciones</h3>
              <p className="text-xs text-slate-400">Intenta cambiar las palabras clave o ajustar los filtros de precio y ciudad.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {anunciosFeed.map((a) => (
                <div 
                  key={a.id}
                  onClick={() => { setAnuncioDetalle(a); setFotoSeleccionadaIndex(0); }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="h-48 bg-slate-950 relative flex items-center justify-center overflow-hidden">
                    {a.foto1 ? (
                      <img src={a.foto1} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                    ) : (
                      <div className="text-4xl text-slate-700">📦</div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorito(a.id); }}
                      className="absolute top-3 right-3 bg-slate-950/80 hover:bg-slate-900 text-rose-500 p-2 rounded-full border border-slate-800 shadow"
                    >
                      <Heart className={`w-4 h-4 ${favoritos.includes(a.id) ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-black text-lg font-mono">${Number(a.precio).toFixed(2)}</span>
                        <span className="bg-slate-950 text-slate-300 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-slate-800">
                          {a.condicion}
                        </span>
                      </div>

                      <h3 className="font-black text-white text-sm line-clamp-2 leading-snug group-hover:text-purple-300 transition-all">{a.titulo}</h3>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" /> {a.ciudad}
                      </span>

                      {a.vendedor_verificado ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                          🛡️ Verificado
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">👤 Registro</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* 👁️ MODAL DETALLE COMPLETO DEL ANUNCIO */}
      {anuncioDetalle && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 my-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div>
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full">
                  Publicación ID #{anuncioDetalle.id}
                </span>
                <h2 className="text-xl font-black text-white uppercase mt-1">{anuncioDetalle.titulo}</h2>
              </div>

              <button type="button" onClick={() => setAnuncioDetalle(null)} className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-750">
                ✕ Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GALERÍA DE HASTA 4 FOTOS */}
              <div className="space-y-3">
                <div className="h-64 sm:h-80 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                  {[anuncioDetalle.foto1, anuncioDetalle.foto2, anuncioDetalle.foto3, anuncioDetalle.foto4].filter(Boolean)[fotoSeleccionadaIndex] ? (
                    <img 
                      src={[anuncioDetalle.foto1, anuncioDetalle.foto2, anuncioDetalle.foto3, anuncioDetalle.foto4].filter(Boolean)[fotoSeleccionadaIndex]} 
                      alt={anuncioDetalle.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl text-slate-800">📸</div>
                  )}
                </div>

                {/* MINIATURAS */}
                <div className="grid grid-cols-4 gap-2">
                  {[anuncioDetalle.foto1, anuncioDetalle.foto2, anuncioDetalle.foto3, anuncioDetalle.foto4].filter(Boolean).map((img, idx) => (
                    <img 
                      key={idx}
                      src={img}
                      alt={`Foto ${idx+1}`}
                      onClick={() => setFotoSeleccionadaIndex(idx)}
                      className={`h-16 w-full object-cover rounded-xl border cursor-pointer ${fotoSeleccionadaIndex === idx ? 'border-purple-500 ring-2 ring-purple-500/40' : 'border-slate-800'}`}
                    />
                  ))}
                </div>
              </div>

              {/* DETALLES TÉCNICOS & VENDEDOR */}
              <div className="space-y-5 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Precio de Venta</span>
                    <strong className="text-emerald-400 font-black text-2xl font-mono">${Number(anuncioDetalle.precio).toFixed(2)} USD</strong>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-slate-300 font-medium">
                    <span>Estado / Condición:</span>
                    <strong className="text-white uppercase font-bold">{anuncioDetalle.condicion}</strong>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-slate-300 font-medium">
                    <span>Ubicación:</span>
                    <strong className="text-purple-300 font-bold">{anuncioDetalle.ciudad}, Ecuador</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Descripción Ampliada:</span>
                  <p className="text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-850 leading-relaxed font-medium">
                    {anuncioDetalle.descripcion || 'Sin descripción detallada proporcionada.'}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Métodos Aceptados & Envíos:</span>
                  <p className="text-slate-300 font-medium">• Pago: <span className="text-white">{anuncioDetalle.metodos_pago}</span></p>
                  <p className="text-slate-300 font-medium">• Envío: <span className="text-white">{anuncioDetalle.metodos_envio}</span></p>
                </div>

                {/* TARJETA DEL VENDEDOR & SECCIÓN DE CONTACTO */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-purple-400 font-bold uppercase block">Vendedor del Producto:</span>
                      <strong className="text-white text-sm font-black uppercase">{anuncioDetalle.vendedor_nombre}</strong>
                    </div>

                    {anuncioDetalle.vendedor_verificado ? (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow">
                        🛡️ Vendedor Verificado
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                        👤 Usuario Registrado
                      </span>
                    )}
                  </div>

                  {/* REGLA DE PRIVACIDAD DE DATOS DE CONTACTO */}
                  {user ? (
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        {anuncioDetalle.vendedor_celular && (
                          <a 
                            href={`https://wa.me/${anuncioDetalle.vendedor_celular.replace(/\D/g,'')}?text=Hola,%20estoy%20interesado%20en%20tu%20anuncio:%20${encodeURIComponent(anuncioDetalle.titulo)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase py-3 rounded-xl shadow flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp Directo
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setMostrarModalChat(true);
                            cargarMensajesInternos(anuncioDetalle.id);
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase py-3 rounded-xl shadow flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat 100% Interno
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-center">
                      <p className="text-[11px] text-amber-300 font-bold flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Datos de contacto directo protegidos
                      </p>
                      <button
                        type="button"
                        onClick={() => { setModoAuth('login'); setMostrarModalAuth(true); }}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] uppercase py-2 rounded-xl"
                      >
                        Inicia Sesión para Ver Teléfono y Chatear ➡️
                      </button>
                    </div>
                  )}
                </div>

                {/* ACCIONES DE INTERACCIÓN */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleFavorito(anuncioDetalle.id)} className="bg-slate-850 hover:bg-slate-800 text-rose-400 px-3 py-2 rounded-xl border border-slate-750 font-bold text-[11px] flex items-center gap-1">
                      <Heart className={`w-3.5 h-3.5 ${favoritos.includes(anuncioDetalle.id) ? 'fill-rose-400' : ''}`} /> Guardar
                    </button>
                    <button type="button" onClick={() => compartirAnuncio(anuncioDetalle)} className="bg-slate-850 hover:bg-slate-800 text-slate-200 px-3 py-2 rounded-xl border border-slate-750 font-bold text-[11px] flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" /> Compartir
                    </button>
                  </div>

                  <button type="button" onClick={() => setMostrarModalDenuncia(true)} className="text-rose-400 hover:underline font-bold text-[11px] flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5" /> Denunciar Fraude
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* 💬 MODAL DE CHAT 100% INTERNO PRIVADO */}
      {mostrarModalChat && anuncioDetalle && user && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl flex flex-col h-[500px]">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400">Chat Interno Exclusivo</span>
                <h3 className="font-black text-white text-sm uppercase">{anuncioDetalle.titulo}</h3>
              </div>
              <button type="button" onClick={() => setMostrarModalChat(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Cerrar</button>
            </div>

            {/* HILO DE MENSAJES */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-850 p-4 overflow-y-auto space-y-3 text-xs">
              {mensajesChat.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Aún no hay mensajes. ¡Envía tu consulta al vendedor!</p>
              ) : (
                mensajesChat.map((m) => {
                  const esMio = m.emisor_id === user.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-slate-500 font-bold mb-0.5">{m.emisor_nombre}</span>
                      <div className={`p-3 rounded-2xl max-w-[80%] ${esMio ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-850 text-slate-200 rounded-bl-none'}`}>
                        {m.mensaje}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleEnviarMensajeSubmit} className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Escribe tu mensaje privado..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={enviandoMensaje}
                className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚩 MODAL DENUNCIAR ANUNCIO / PERFIL FALSO */}
      {mostrarModalDenuncia && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-black text-rose-400 uppercase text-sm flex items-center gap-1.5">
                <Flag className="w-4 h-4" /> Denunciar Publicación o Perfil Falso
              </h3>
              <button type="button" onClick={() => setMostrarModalDenuncia(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Cerrar</button>
            </div>

            {denunciaEnviada ? (
              <p className="text-center text-emerald-400 font-bold py-6">✅ ¡Gracias! Tu reporte ha sido enviado al equipo de seguridad de Qvendes.</p>
            ) : (
              <form onSubmit={handleEnviarDenuncia} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Motivo de la Denuncia *</label>
                  <select value={denunciaMotivo} onChange={(e) => setDenunciaMotivo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold">
                    <option value="Fraude o Intento de Estafa">Fraude o Intento de Estafa</option>
                    <option value="Perfil Falso o Identidad Suplantada">Perfil Falso o Identidad Suplantada</option>
                    <option value="Producto Prohibido">Producto Prohibido o Ilegal</option>
                    <option value="Precio Engañoso o Falso">Precio Engañoso o Falso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Detalles Adicionales</label>
                  <textarea rows={3} value={denunciaDetalle} onChange={(e) => setDenunciaDetalle(e.target.value)} placeholder="Describe brevemente por qué denuncias esta publicación..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                </div>

                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3.5 rounded-xl uppercase text-xs shadow-lg">
                  Enviar Denuncia a Seguridad
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🔐 MODAL AUTH (LOGIN / REGISTRO COMÚN) */}
      {mostrarModalAuth && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-black text-white uppercase text-base">
                {modoAuth === 'login' ? '🔑 Iniciar Sesión en Qvendes' : '📝 Registro de Usuario Común'}
              </h3>
              <button type="button" onClick={() => setMostrarModalAuth(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Cerrar</button>
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-bold">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {modoAuth === 'register' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nombres Completos *</label>
                    <input type="text" required value={authNombre} onChange={(e) => setAuthNombre(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Teléfono / Celular</label>
                      <input type="text" value={authCelular} onChange={(e) => setAuthCelular(e.target.value)} placeholder="Ej. 0991234567" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Ciudad *</label>
                      <input type="text" required value={authCiudad} onChange={(e) => setAuthCiudad(e.target.value)} placeholder="Ej. Loja" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Correo Electrónico *</label>
                <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-bold" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Contraseña *</label>
                <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-bold" />
              </div>

              <button
                type="submit"
                disabled={authProcesando}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black py-3.5 rounded-xl uppercase text-xs tracking-wider shadow-lg transition-all"
              >
                {authProcesando ? 'Procesando...' : modoAuth === 'login' ? 'Ingresar a mi Cuenta' : 'Crear mi Cuenta Común'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-850 text-xs">
              {modoAuth === 'login' ? (
                <button type="button" onClick={() => setModoAuth('register')} className="text-purple-400 hover:underline font-bold">
                  ¿No tienes cuenta? Registrate gratis aquí
                </button>
              ) : (
                <button type="button" onClick={() => setModoAuth('login')} className="text-purple-400 hover:underline font-bold">
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ➕ MODAL PUBLICAR ANUNCIO */}
      {mostrarModalPublicar && user && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-black text-white uppercase text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" /> Publicar Nuevo Anuncio
              </h3>
              <button type="button" onClick={() => setMostrarModalPublicar(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Cerrar</button>
            </div>

            <form onSubmit={handlePublicarSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Título del Anuncio *</label>
                <input type="text" required value={pubTitulo} onChange={(e) => setPubTitulo(e.target.value)} placeholder="Ej. Laptop Asus Core i7 16GB RAM semi nueva" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none font-bold" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Precio ($ USD) *</label>
                  <input type="number" step="0.50" required value={pubPrecio} onChange={(e) => setPubPrecio(e.target.value)} placeholder="Ej. 450.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Estado / Condición *</label>
                  <select value={pubCondicion} onChange={(e) => setPubCondicion(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold">
                    <option value="nuevo">Nuevo</option>
                    <option value="usado">Usado</option>
                    <option value="servicio">Servicio Profesional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Ciudad *</label>
                  <input type="text" required value={pubCiudad} onChange={(e) => setPubCiudad(e.target.value)} placeholder="Ej. Loja" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Descripción Ampliada *</label>
                <textarea rows={3} required value={pubDescripcion} onChange={(e) => setPubDescripcion(e.target.value)} placeholder="Describe las características técnicas, motivo de venta o detalles de contacto..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none" />
              </div>

              {/* FOTOS BASE64 */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-400">Fotos del Producto (Hasta 4 fotos)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[setPubFoto1, setPubFoto2, setPubFoto3, setPubFoto4].map((setter, idx) => (
                    <input 
                      key={idx}
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') setter(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[9px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:bg-purple-600 file:text-white" 
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={pubProcesando}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black py-4 rounded-xl text-xs uppercase shadow-lg transition-all"
              >
                {pubProcesando ? 'Publicando...' : '✅ Publicar en Qvendes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-850 py-6 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} Qvendes Marketplace. Plataforma oficial de la suite LatinRed.</p>
      </footer>

    </main>
  );
}
