'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, ShieldCheck, Heart, Share2, MessageSquare, Tag, Flag, 
  MapPin, CheckCircle2, Lock, User, Star, SlidersHorizontal, Sparkles, 
  LogOut, LogIn, UserCheck, X, Camera, DollarSign, Send, Phone, MessageCircle,
  Eye, EyeOff, Save, Check
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

// LISTADO COMPLETO DE CIUDADES DEL ECUADOR
const ciudadesEcuador = [
  'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán', 'Manta',
  'Portoviejo', 'Loja', 'Ambato', 'Esmeraldas', 'Quevedo', 'Riobamba', 'Milagro',
  'Ibarra', 'La Libertad', 'Babahoyo', 'Sangolquí', 'Daule', 'Latacunga', 'Tulcán',
  'Chone', 'Pasaje', 'Santa Rosa', 'Nueva Loja', 'Huaquillas', 'El Carmen',
  'Montecristi', 'Samborondón', 'Puerto Baquerizo Moreno', 'Macas', 'Tena',
  'Puyo', 'Zamora', 'Azogues', 'Guaranda', 'Salinas', 'Atacames', 'Gualaceo', 'Otavalo'
];

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
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [mostrarModalDenuncia, setMostrarModalDenuncia] = useState(false);
  const [mostrarModalChat, setMostrarModalChat] = useState(false);

  // VISUALIZADOR DE CONTRASEÑA
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // ESTADOS DE FORMULARIO DE AUTH
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authNombre, setAuthNombre] = useState('');
  const [authCelular, setAuthCelular] = useState('');
  const [authCiudad, setAuthCiudad] = useState('Loja');
  const [authCodigoVerificacion, setAuthCodigoVerificacion] = useState('');
  const [codigoEnviadoModal, setCodigoEnviadoModal] = useState(false);
  const [codigoDemoAlert, setCodigoDemoAlert] = useState('');
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authProcesando, setAuthProcesando] = useState(false);

  // ESTADOS DE FORMULARIO DE PERFIL DE USUARIO
  const [editNombre, setEditNombre] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [editCiudad, setEditCiudad] = useState('Loja');
  const [editPassword, setEditPassword] = useState('');
  const [editExito, setEditExito] = useState(false);
  const [editProcesando, setEditProcesando] = useState(false);

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
  const [pubExitoMensaje, setPubExitoMensaje] = useState(false);

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
    const sesionGuardada = localStorage.getItem('qvendes_user');
    if (sesionGuardada) {
      try {
        const u = JSON.parse(sesionGuardada);
        setUser(u);
        setEditNombre(u.nombre || '');
        setEditCelular(u.celular || '');
        setEditCiudad(u.ciudad || 'Loja');
      } catch {}
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarAnuncios();
  };

  // LOGIN / REGISTRO COMÚN CON VERIFICACIÓN DE CÓDIGO
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (modoAuth === 'register' && !codigoEnviadoModal) {
      setAuthError('Por favor haz clic en "Solicitar Código de Verificación" para validar tu correo.');
      return;
    }

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
          ciudad: authCiudad,
          codigo_verificacion: authCodigoVerificacion
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al conectar con el servidor.');
      }

      setUser(data.user);
      setEditNombre(data.user.nombre || '');
      setEditCelular(data.user.celular || '');
      setEditCiudad(data.user.ciudad || 'Loja');
      localStorage.setItem('qvendes_user', JSON.stringify(data.user));
      setMostrarModalAuth(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error al procesar la solicitud.');
    } finally {
      setAuthProcesando(false);
    }
  };

  // ACTUALIZAR PERFIL DE USUARIO LOGEADO
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para actualizar tu perfil.');
      setMostrarModalPerfil(false);
      setModoAuth('login');
      setMostrarModalAuth(true);
      return;
    }
    setEditProcesando(true);
    setEditExito(false);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          usuario_id: user.id,
          email: user.email,
          nombre: editNombre,
          celular: editCelular,
          ciudad: editCiudad,
          password: editPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('qvendes_user', JSON.stringify(data.user));
        setEditExito(true);
        setEditPassword('');
        setTimeout(() => setEditExito(false), 3000);
      } else {
        alert(`Error al guardar perfil: ${data.error || 'Intenta de nuevo'}`);
      }
    } catch (e) {
      console.error('Error al actualizar perfil:', e);
      alert('Error de conexión al actualizar perfil.');
    } finally {
      setEditProcesando(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qvendes_user');
    setMostrarModalPerfil(false);
  };

  // PUBLICAR ANUNCIO CON MENSAJE DE ÉXITO Y REINICIO DE FORMULARIO
  const handlePublicarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión primero para publicar un anuncio.');
      setMostrarModalPublicar(false);
      setModoAuth('login');
      setMostrarModalAuth(true);
      return;
    }

    if (!pubTitulo.trim() || !pubPrecio) {
      alert('Por favor ingresa el título y el precio del anuncio.');
      return;
    }

    setPubProcesando(true);
    setPubExitoMensaje(false);

    try {
      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedor_id: user.id,
          vendedor_email: user.email,
          titulo: pubTitulo,
          precio: pubPrecio,
          condicion: pubCondicion,
          categoria: pubCategoria,
          ciudad: pubCiudad || user.ciudad || 'Loja',
          descripcion: pubDescripcion,
          foto1: pubFoto1,
          foto2: pubFoto2,
          foto3: pubFoto3,
          foto4: pubFoto4,
          metodos_pago: pubMetodosPago,
          metodos_envio: pubMetodosEnvio
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPubExitoMensaje(true);
        setPubTitulo('');
        setPubPrecio('');
        setPubDescripcion('');
        setPubFoto1('');
        setPubFoto2('');
        setPubFoto3('');
        setPubFoto4('');

        await cargarAnuncios();

        setTimeout(() => {
          setPubExitoMensaje(false);
          setMostrarModalPublicar(false);
        }, 2000);
      } else {
        alert(`Error al publicar: ${data.error || 'Intenta de nuevo'}`);
      }
    } catch (e) {
      console.error('Error al publicar anuncio:', e);
      alert('Error de conexión al enviar la publicación.');
    } finally {
      setPubProcesando(false);
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

  // COMPROBAR SI EL USUARIO ES EL ADMINISTRADOR EXCLUSIVO (soloescribeme@gmail.com)
  const esAdministrador = user && user.email.toLowerCase() === 'soloescribeme@gmail.com';

  return (
    <main className="min-h-screen bg-amber-50 text-slate-900 flex flex-col justify-between pb-12 selection:bg-amber-400 selection:text-slate-950">
      
      {/* 🔮 ENCABEZADO / NAVBAR EN AMARILLO SUAVE */}
      <header className="border-b border-amber-200/80 bg-amber-100/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo.jpg" alt="Qvendes Logo" className="h-12 w-auto object-contain rounded-xl shadow ring-2 ring-amber-400/60" />
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 block leading-none">
                Qvendes <span className="text-purple-600 font-extrabold">.app</span>
              </span>
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Marketplace Recomendado</span>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA PRINCIPAL POR PALABRAS CLAVE */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden sm:flex items-center gap-2 bg-white border border-amber-300 rounded-2xl px-4 py-2.5 shadow-sm focus-within:border-purple-600 transition-all">
            <Search className="w-4 h-4 text-purple-600 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar autos, laptops, departamentos, servicios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-900 outline-none w-full font-medium placeholder-slate-400"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-xl shadow transition-all">
              Buscar
            </button>
          </form>

          {/* ACCIONES DE USUARIO Y BADGE DE NOMBRE DE USUARIO LOGEADO */}
          <div className="flex items-center gap-3">
            
            {/* BOTÓN ADMIN DE PATROCINADOS VISIBLE ÚNICAMENTE PARA soloescribeme@gmail.com */}
            {esAdministrador && (
              <button 
                type="button" 
                onClick={() => router.push('/admin/patrocinadores')}
                className="hidden lg:flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-800 text-xs font-black px-3 py-2 rounded-xl transition-all shadow"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin Patrocinados
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalPublicar(true)}
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  + Publicar Anuncio
                </button>

                {/* BOTÓN CON NOMBRE DE USUARIO (HACER CLIC ABRE EL MODAL DE PERFIL) */}
                <div 
                  onClick={() => setMostrarModalPerfil(true)}
                  className="bg-white hover:bg-amber-50 border border-amber-300 p-2 rounded-xl flex items-center gap-2 text-xs shadow-sm cursor-pointer transition-all group"
                  title="Haz clic para ver y editar tu perfil"
                >
                  <div className="w-8 h-8 bg-purple-600 group-hover:bg-purple-700 rounded-lg flex items-center justify-center font-black text-white uppercase text-xs shadow">
                    {user.nombre.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <span className="font-black text-slate-900 group-hover:text-purple-600 transition-colors block leading-none">{user.nombre}</span>
                    <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                      {user.es_verificado ? '🛡️ Verificado' : '👤 Ver Perfil'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setModoAuth('login'); setMostrarModalAuth(true); }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black uppercase px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Ingresar / Registrarse
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-amber-100/70 border-b border-amber-200/80 p-4 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              className="bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              Filtros Avanzados {mostrarFiltrosAvanzados ? '▲' : '▼'}
            </button>

            {/* SELECCIÓN RÁPIDA DE CONDICIÓN */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
              <button type="button" onClick={() => { setFiltroCondicion(''); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${!filtroCondicion ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-white text-slate-700 border-amber-300'}`}>
                Todos
              </button>
              <button type="button" onClick={() => { setFiltroCondicion('nuevo'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'nuevo' ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-white text-slate-700 border-amber-300'}`}>
                Nuevos
              </button>
              <button type="button" onClick={() => { setFiltroCondicion('usado'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'usado' ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-white text-slate-700 border-amber-300'}`}>
                Usados
              </button>
              <button type="button" onClick={() => { setFiltroCondicion('servicio'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'servicio' ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-white text-slate-700 border-amber-300'}`}>
                Servicios
              </button>
            </div>
          </div>
        </div>

        {/* PANEL DESPLEGABLE DE FILTROS COMBINABLES O INDIVIDUALES */}
        {mostrarFiltrosAvanzados && (
          <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto pt-4 mt-3 border-t border-amber-300/60 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
            <div>
              <label className="block text-[10px] font-black uppercase text-amber-900 mb-1">Ciudad del Ecuador</label>
              <select value={filtroCiudad} onChange={(e) => setFiltroCiudad(e.target.value)} className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold outline-none">
                <option value="">Todas las ciudades del Ecuador</option>
                {ciudadesEcuador.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-amber-900 mb-1">Precio Mínimo ($)</label>
              <input type="number" placeholder="Ej. 10" value={filtroPrecioMin} onChange={(e) => setFiltroPrecioMin(e.target.value)} className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-amber-900 mb-1">Precio Máximo ($)</label>
              <input type="number" placeholder="Ej. 1500" value={filtroPrecioMax} onChange={(e) => setFiltroPrecioMax(e.target.value)} className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold outline-none" />
            </div>

            <div className="flex items-end gap-2">
              <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase py-2.5 rounded-xl shadow">
                Aplicar Filtros
              </button>
              <button type="button" onClick={() => { setFiltroCiudad(''); setFiltroCondicion(''); setFiltroPrecioMin(''); setFiltroPrecioMax(''); setBusqueda(''); cargarAnuncios(); }} className="bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-2.5 rounded-xl font-bold">
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
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-amber-900 uppercase tracking-wider">⭐ Anuncios TOP Destacados</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {anunciosTop.map((a) => (
                <div 
                  key={a.id} 
                  onClick={() => { setAnuncioDetalle(a); setFotoSeleccionadaIndex(0); }}
                  className="bg-white border-2 border-amber-400 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer relative group flex flex-col justify-between"
                >
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 rounded-full shadow z-10">
                    ⭐ TOP DESTACADO
                  </div>

                  <div className="h-44 bg-amber-100 relative flex items-center justify-center overflow-hidden">
                    {a.foto1 ? (
                      <img src={a.foto1} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" />
                    ) : (
                      <div className="text-3xl text-purple-600">🛍️</div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 font-black text-base font-mono">${Number(a.precio).toFixed(2)} USD</span>
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg border border-amber-300">
                        {a.condicion}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-sm line-clamp-1 group-hover:text-purple-600 transition-all">{a.titulo}</h3>
                    
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-amber-100 pt-2">
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <MapPin className="w-3 h-3 text-purple-600" /> {a.ciudad}
                      </span>
                      {a.vendedor_verificado && (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
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

        {/* FEED DE ANUNCIOS REGULARES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              🛍️ Explorar Publicaciones ({anunciosFeed.length})
            </h2>
          </div>

          {cargandoAnuncios ? (
            <p className="text-center text-xs text-slate-500 py-16">Cargando catálogo de productos y servicios...</p>
          ) : anunciosFeed.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-amber-200 shadow-sm">
              <div className="text-4xl text-purple-600">🔍</div>
              <h3 className="text-base font-black text-slate-900 uppercase">No se encontraron publicaciones</h3>
              <p className="text-xs text-slate-500">Intenta cambiar las palabras clave o ajustar los filtros de precio y ciudad.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {anunciosFeed.map((a) => (
                <div 
                  key={a.id}
                  onClick={() => { setAnuncioDetalle(a); setFotoSeleccionadaIndex(0); }}
                  className="bg-white border border-amber-200/80 hover:border-purple-400 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="h-48 bg-amber-100/60 relative flex items-center justify-center overflow-hidden">
                    {a.foto1 ? (
                      <img src={a.foto1} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                    ) : (
                      <div className="text-4xl text-amber-300">📦</div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorito(a.id); }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-rose-500 p-2 rounded-full border border-amber-200 shadow"
                    >
                      <Heart className={`w-4 h-4 ${favoritos.includes(a.id) ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-black text-lg font-mono">${Number(a.precio).toFixed(2)}</span>
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                          {a.condicion}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-purple-600 transition-all">{a.titulo}</h3>
                    </div>

                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" /> {a.ciudad}
                      </span>

                      {a.vendedor_verificado ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                          🛡️ Verificado
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">👤 Registro</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* 👤 MODAL MI PERFIL (VISUALIZAR Y ACTUALIZAR DATOS) */}
      {mostrarModalPerfil && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black uppercase text-sm">
                  {user.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-sm leading-none">{user.nombre}</h3>
                  <span className="text-[10px] text-slate-500 font-medium">{user.email}</span>
                </div>
              </div>

              <button type="button" onClick={() => setMostrarModalPerfil(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {editExito && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> ¡Tu información de perfil se ha actualizado correctamente!
              </div>
            )}

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Nombres Completos *</label>
                <input type="text" required value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Teléfono / Celular</label>
                  <input type="text" value={editCelular} onChange={(e) => setEditCelular(e.target.value)} placeholder="0991234567" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Ciudad *</label>
                  <select value={editCiudad} onChange={(e) => setEditCiudad(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 font-bold outline-none">
                    {ciudadesEcuador.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Cambiar Contraseña (opcional)</label>
                <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Dejar en blanco para mantener la actual" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none font-bold" />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={editProcesando}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black py-3.5 rounded-xl uppercase text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {editProcesando ? 'Guardando...' : 'Guardar Cambios de Mi Perfil'}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl border border-rose-200 text-xs transition-all flex items-center justify-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Mi Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ MODAL DETALLE COMPLETO DEL ANUNCIO */}
      {anuncioDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 my-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full">
                  Publicación ID #{anuncioDetalle.id}
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase mt-1">{anuncioDetalle.titulo}</h2>
              </div>

              <button type="button" onClick={() => setAnuncioDetalle(null)} className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl">
                ✕ Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GALERÍA DE HASTA 4 FOTOS */}
              <div className="space-y-3">
                <div className="h-64 sm:h-80 bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden flex items-center justify-center">
                  {[anuncioDetalle.foto1, anuncioDetalle.foto2, anuncioDetalle.foto3, anuncioDetalle.foto4].filter(Boolean)[fotoSeleccionadaIndex] ? (
                    <img 
                      src={[anuncioDetalle.foto1, anuncioDetalle.foto2, anuncioDetalle.foto3, anuncioDetalle.foto4].filter(Boolean)[fotoSeleccionadaIndex]} 
                      alt={anuncioDetalle.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl text-amber-300">📸</div>
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
                      className={`h-16 w-full object-cover rounded-xl border cursor-pointer ${fotoSeleccionadaIndex === idx ? 'border-purple-600 ring-2 ring-purple-500/40' : 'border-amber-200'}`}
                    />
                  ))}
                </div>
              </div>

              {/* DETALLES TÉCNICOS & VENDEDOR */}
              <div className="space-y-5 text-xs">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Precio de Venta</span>
                    <strong className="text-purple-700 font-black text-2xl font-mono">${Number(anuncioDetalle.precio).toFixed(2)} USD</strong>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-amber-200 pt-2 text-slate-700 font-medium">
                    <span>Estado / Condición:</span>
                    <strong className="text-slate-900 uppercase font-bold">{anuncioDetalle.condicion}</strong>
                  </div>

                  <div className="flex items-center justify-between border-t border-amber-200 pt-2 text-slate-700 font-medium">
                    <span>Ubicación:</span>
                    <strong className="text-purple-700 font-bold">{anuncioDetalle.ciudad}, Ecuador</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Descripción Ampliada:</span>
                  <p className="text-slate-800 bg-amber-50/50 p-4 rounded-2xl border border-amber-200 leading-relaxed font-medium">
                    {anuncioDetalle.descripcion || 'Sin descripción detallada proporcionada.'}
                  </p>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500">Métodos Aceptados & Envíos:</span>
                  <p className="text-slate-700 font-medium">• Pago: <span className="text-slate-900 font-bold">{anuncioDetalle.metodos_pago}</span></p>
                  <p className="text-slate-700 font-medium">• Envío: <span className="text-slate-900 font-bold">{anuncioDetalle.metodos_envio}</span></p>
                </div>

                {/* TARJETA DEL VENDEDOR & SECCIÓN DE CONTACTO */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-purple-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-purple-700 font-bold uppercase block">Vendedor del Producto:</span>
                      <strong className="text-slate-900 text-sm font-black uppercase">{anuncioDetalle.vendedor_nombre}</strong>
                    </div>

                    {anuncioDetalle.vendedor_verificado ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                        🛡️ Vendedor Verificado
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                        👤 Usuario Registrado
                      </span>
                    )}
                  </div>

                  {/* REGLA DE PRIVACIDAD DE DATOS DE CONTACTO */}
                  {user ? (
                    <div className="space-y-2 pt-2 border-t border-amber-200">
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
                    <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2 text-center shadow-sm">
                      <p className="text-[11px] text-amber-900 font-bold flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-purple-600" /> Datos de contacto directo protegidos
                      </p>
                      <button
                        type="button"
                        onClick={() => { setModoAuth('login'); setMostrarModalAuth(true); }}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] uppercase py-2 rounded-xl shadow"
                      >
                        Inicia Sesión para Ver Teléfono y Chatear ➡️
                      </button>
                    </div>
                  )}
                </div>

                {/* ACCIONES DE INTERACCIÓN */}
                <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleFavorito(anuncioDetalle.id)} className="bg-amber-100 hover:bg-amber-200 text-rose-600 px-3 py-2 rounded-xl border border-amber-300 font-bold text-[11px] flex items-center gap-1">
                      <Heart className={`w-3.5 h-3.5 ${favoritos.includes(anuncioDetalle.id) ? 'fill-rose-600' : ''}`} /> Guardar
                    </button>
                    <button type="button" onClick={() => compartirAnuncio(anuncioDetalle)} className="bg-amber-100 hover:bg-amber-200 text-slate-800 px-3 py-2 rounded-xl border border-amber-300 font-bold text-[11px] flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" /> Compartir
                    </button>
                  </div>

                  <button type="button" onClick={() => setMostrarModalDenuncia(true)} className="text-rose-600 hover:underline font-bold text-[11px] flex items-center gap-1">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl flex flex-col h-[500px]">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600">Chat Interno Exclusivo</span>
                <h3 className="font-black text-slate-900 text-sm uppercase">{anuncioDetalle.titulo}</h3>
              </div>
              <button type="button" onClick={() => setMostrarModalChat(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            <div className="flex-1 bg-amber-50 rounded-2xl border border-amber-200 p-4 overflow-y-auto space-y-3 text-xs">
              {mensajesChat.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Aún no hay mensajes. ¡Envía tu consulta al vendedor!</p>
              ) : (
                mensajesChat.map((m) => {
                  const esMio = m.emisor_id === user.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-slate-500 font-bold mb-0.5">{m.emisor_nombre}</span>
                      <div className={`p-3 rounded-2xl max-w-[80%] ${esMio ? 'bg-purple-600 text-white rounded-br-none shadow' : 'bg-white text-slate-800 border border-amber-200 rounded-bl-none shadow-sm'}`}>
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
                className="flex-1 bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-purple-600 font-medium"
              />
              <button
                type="submit"
                disabled={enviandoMensaje}
                className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl font-bold shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚩 MODAL DENUNCIAR ANUNCIO / PERFIL FALSO */}
      {mostrarModalDenuncia && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-rose-600 uppercase text-sm flex items-center gap-1.5">
                <Flag className="w-4 h-4" /> Denunciar Publicación o Perfil Falso
              </h3>
              <button type="button" onClick={() => setMostrarModalDenuncia(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {denunciaEnviada ? (
              <p className="text-center text-emerald-600 font-bold py-6">✅ ¡Gracias! Tu reporte ha sido enviado al equipo de seguridad de Qvendes.</p>
            ) : (
              <form onSubmit={handleEnviarDenuncia} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Motivo de la Denuncia *</label>
                  <select value={denunciaMotivo} onChange={(e) => setDenunciaMotivo(e.target.value)} className="w-full bg-amber-50 border border-amber-300 rounded-xl p-3 text-slate-900 font-bold outline-none">
                    <option value="Fraude o Intento de Estafa">Fraude o Intento de Estafa</option>
                    <option value="Perfil Falso o Identidad Suplantada">Perfil Falso o Identidad Suplantada</option>
                    <option value="Producto Prohibido">Producto Prohibido o Ilegal</option>
                    <option value="Precio Engañoso o Falso">Precio Engañoso o Falso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Detalles Adicionales</label>
                  <textarea rows={3} value={denunciaDetalle} onChange={(e) => setDenunciaDetalle(e.target.value)} placeholder="Describe brevemente por qué denuncias esta publicación..." className="w-full bg-amber-50 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none" />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-base">
                {modoAuth === 'login' ? '🔑 Iniciar Sesión en Qvendes' : '📝 Registro de Usuario Común'}
              </h3>
              <button type="button" onClick={() => setMostrarModalAuth(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-300 text-rose-700 p-3 rounded-xl text-xs font-bold">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {modoAuth === 'register' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Nombres Completos *</label>
                    <input type="text" required value={authNombre} onChange={(e) => setAuthNombre(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Teléfono / Celular</label>
                      <input type="text" value={authCelular} onChange={(e) => setAuthCelular(e.target.value)} placeholder="Ej. 0991234567" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Ciudad *</label>
                      <select value={authCiudad} onChange={(e) => setAuthCiudad(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 font-bold outline-none">
                        {ciudadesEcuador.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Correo Electrónico *</label>
                <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none font-bold" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Contraseña *</label>
                <div className="relative">
                  <input 
                    type={mostrarPassword ? 'text' : 'password'} 
                    required 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 pr-10 text-slate-900 outline-none font-bold" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-700 p-1"
                    title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {modoAuth === 'register' && (
                <div className="space-y-3 pt-1 border-t border-amber-200">
                  {!codigoEnviadoModal ? (
                    <button
                      type="button"
                      disabled={enviandoCodigo || !authEmail.trim()}
                      onClick={async () => {
                        if (!authEmail.trim() || !authEmail.includes('@')) {
                          setAuthError('Por favor ingresa un correo electrónico válido.');
                          return;
                        }
                        setEnviandoCodigo(true);
                        setAuthError('');
                        try {
                          const res = await fetch('/api/auth', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'send_code', email: authEmail })
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setCodigoEnviadoModal(true);
                            setAuthCodigoVerificacion('');
                            setCodigoDemoAlert(`📩 ${data.message || `Código de 6 dígitos enviado a ${authEmail}. Revisa tu bandeja de entrada o Spam.`}`);
                          } else {
                            setAuthError(data.error || 'Error enviando código al correo');
                          }
                        } catch {
                          setAuthError('Error de conexión al solicitar el código de correo.');
                        } finally {
                          setEnviandoCodigo(false);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:opacity-95 text-slate-950 font-black py-3 rounded-xl uppercase text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-purple-900" />
                      {enviandoCodigo ? 'Enviando Código...' : '📧 Enviar Código de Verificación al Correo'}
                    </button>
                  ) : (
                    <div className="space-y-3 bg-purple-50 p-4 rounded-2xl border-2 border-purple-300">
                      {codigoDemoAlert && (
                        <div className="text-purple-950 text-xs font-bold text-center bg-purple-100 p-3 rounded-xl border border-purple-300 shadow-sm leading-relaxed">
                          {codigoDemoAlert}
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-black uppercase text-purple-800 mb-1">Ingresa el Código de 6 Dígitos Recibido *</label>
                        <input 
                          type="text" 
                          required 
                          maxLength={6} 
                          value={authCodigoVerificacion} 
                          onChange={(e) => setAuthCodigoVerificacion(e.target.value)} 
                          placeholder="Ej. 654321" 
                          className="w-full bg-white border-2 border-purple-400 rounded-xl p-3 text-center text-slate-900 font-mono font-black text-xl outline-none tracking-widest shadow-inner focus:border-purple-600" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={authProcesando}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white font-black py-3.5 rounded-xl uppercase text-xs tracking-wider shadow-lg transition-all"
              >
                {authProcesando ? 'Procesando...' : modoAuth === 'login' ? 'Ingresar a mi Cuenta' : '✅ Verificar Código y Crear mi Cuenta'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-amber-200 text-xs">
              {modoAuth === 'login' ? (
                <button type="button" onClick={() => setModoAuth('register')} className="text-purple-600 hover:underline font-bold">
                  ¿No tienes cuenta? Regístrate gratis aquí
                </button>
              ) : (
                <button type="button" onClick={() => setModoAuth('login')} className="text-purple-600 hover:underline font-bold">
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ➕ MODAL PUBLICAR ANUNCIO (CON NOTIFICACIÓN DE ÉXITO Y RESETEO DE CAMPOS) */}
      {mostrarModalPublicar && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 my-8 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" /> Publicar Nuevo Anuncio
              </h3>
              <button type="button" onClick={() => setMostrarModalPublicar(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {pubExitoMensaje && (
              <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-in zoom-in duration-200">
                <Check className="w-5 h-5 text-emerald-600" /> ¡Tu anuncio ha sido publicado exitosamente en Qvendes!
              </div>
            )}

            <form onSubmit={handlePublicarSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Título del Anuncio *</label>
                <input type="text" required value={pubTitulo} onChange={(e) => setPubTitulo(e.target.value)} placeholder="Ej. Laptop Asus Core i7 16GB RAM semi nueva" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none font-bold" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Precio ($ USD) *</label>
                  <input type="number" step="0.50" required value={pubPrecio} onChange={(e) => setPubPrecio(e.target.value)} placeholder="Ej. 450.00" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 font-bold outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Estado / Condición *</label>
                  <select value={pubCondicion} onChange={(e) => setPubCondicion(e.target.value as any)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 font-bold outline-none">
                    <option value="nuevo">Nuevo</option>
                    <option value="usado">Usado</option>
                    <option value="servicio">Servicio Profesional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Ciudad *</label>
                  <select value={pubCiudad} onChange={(e) => setPubCiudad(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 font-bold outline-none">
                    {ciudadesEcuador.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Descripción Ampliada *</label>
                <textarea rows={3} required value={pubDescripcion} onChange={(e) => setPubDescripcion(e.target.value)} placeholder="Describe las características técnicas, motivo de venta o detalles de contacto..." className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 text-slate-900 outline-none font-medium" />
              </div>

              {/* FOTOS BASE64 */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-purple-700">Fotos del Producto (Hasta 4 fotos)</label>
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
                      className="text-[9px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:bg-purple-600 file:text-white" 
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={pubProcesando}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-black py-4 rounded-xl text-xs uppercase shadow-lg transition-all"
              >
                {pubProcesando ? 'Publicando Anuncio...' : '✅ Publicar en Qvendes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-amber-200 py-6 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} Qvendes Marketplace. Plataforma oficial de la suite LatinRed.</p>
      </footer>

    </main>
  );
}
