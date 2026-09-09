'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, ShieldCheck, Heart, Share2, MessageSquare, Tag, Flag, 
  MapPin, CheckCircle2, Lock, User, Star, SlidersHorizontal, Sparkles, 
  LogOut, LogIn, UserCheck, X, Camera, DollarSign, Send, Phone, MessageCircle,
  Eye, EyeOff, Save, Check, Crown, Zap, Wallet, CreditCard, ExternalLink, Package
} from 'lucide-react';

interface Anuncio {
  id: number;
  vendedor_id: string | number;
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
  permitir_whatsapp?: boolean;
  es_top: boolean;
  es_premium: boolean;
  es_patrocinado?: boolean;
  vendedor_nombre: string;
  vendedor_celular?: string;
  vendedor_email?: string;
  vendedor_verificado: boolean;
  creado_en: string;
}

interface MensajeItem {
  id: number;
  anuncio_id: number;
  emisor_id: string | number;
  receptor_id: string | number;
  mensaje: string;
  emisor_nombre?: string;
  receptor_nombre?: string;
  anuncio_titulo?: string;
  anuncio_foto?: string;
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

  // USUARIO EN SESIÓN (Autenticación estricta Neon DB)
  const [user, setUser] = useState<{ id: string | number; nombre: string; email: string; celular?: string; ciudad?: string; es_verificado: boolean; saldo_billetera: number } | null>(null);

  // ANUNCIOS Y FEED
  const [anunciosTop, setAnunciosTop] = useState<Anuncio[]>([]);
  const [anunciosFeed, setAnunciosFeed] = useState<Anuncio[]>([]);
  const [cargandoAnuncios, setCargandoAnuncios] = useState(true);

  // FILTROS DE BÚSQUEDA
  const [busqueda, setBusqueda] = useState('');
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroCondicion, setFiltroCondicion] = useState('');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // MODALES PRINCIPALES
  const [anuncioDetalle, setAnuncioDetalle] = useState<Anuncio | null>(null);
  const [fotoSeleccionadaIndex, setFotoSeleccionadaIndex] = useState(0);
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'register'>('login');
  const [mostrarModalPublicar, setMostrarModalPublicar] = useState(false);
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [mostrarModalDenuncia, setMostrarModalDenuncia] = useState(false);

  // NUEVOS MODALES SOLICITADOS
  const [mostrarModalMisAnuncios, setMostrarModalMisAnuncios] = useState(false);
  const [mostrarModalBuzon, setMostrarModalBuzon] = useState(false);
  const [mostrarModalRecargar, setMostrarModalRecargar] = useState(false);
  const [mostrarDatosBancarios, setMostrarDatosBancarios] = useState(false);

  // VISUALIZADOR DE CONTRASEÑA
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // ESTADOS DE FORMULARIO DE AUTH
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authNombre, setAuthNombre] = useState('');
  const [authCelular, setAuthCelular] = useState('');
  const [authCiudad, setAuthCiudad] = useState('Loja');
  const [authError, setAuthError] = useState('');
  const [authProcesando, setAuthProcesando] = useState(false);

  // ESTADOS DE FORMULARIO DE PERFIL DE USUARIO
  const [editNombre, setEditNombre] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [editCiudad, setEditCiudad] = useState('Loja');
  const [editPassword, setEditPassword] = useState('');
  const [editExito, setEditExito] = useState(false);
  const [editProcesando, setEditProcesando] = useState(false);

  // ESTADOS DE FORMULARIO DE PUBLICACIÓN MEJORADO
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

  // OPCIONES DE PAGO Y ENVÍO SELECCIONABLES (CHECKBOXES)
  const [pagoEfectivo, setPagoEfectivo] = useState(true);
  const [pagoTransferencia, setPagoTransferencia] = useState(true);
  const [pagoPlataforma, setPagoPlataforma] = useState(true);

  const [envioPersonal, setEnvioPersonal] = useState(true);
  const [envioProvincias, setEnvioProvincias] = useState(true);
  const [pubPermitirWhatsapp, setPubPermitirWhatsapp] = useState(true);

  const [pubProcesando, setPubProcesando] = useState(false);
  const [pubExitoMensaje, setPubExitoMensaje] = useState(false);

  // CHAT INTERNO Y BUZÓN DE MENSAJES
  const [conversacionesBuzon, setConversacionesBuzon] = useState<MensajeItem[]>([]);
  const [cargandoBuzon, setCargandoBuzon] = useState(false);
  const [chatAnuncioActivo, setChatAnuncioActivo] = useState<Anuncio | null>(null);
  const [mensajesThread, setMensajesThread] = useState<MensajeItem[]>([]);
  const [nuevoMensajeTexto, setNuevoMensajeTexto] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  // PROMOCIONES DE ANUNCIO (TOP $1 / PREMIUM $1.50)
  const [anuncioAPromocionar, setAnuncioAPromocionar] = useState<Anuncio | null>(null);
  const [diasPromocion, setDiasPromocion] = useState(1);
  const [procesandoPromocion, setProcesandoPromocion] = useState(false);

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
        // REVALIDACIÓN ESTRICTA CONTRA LA BASE DE DATOS NEON
        fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', usuario_id: u.id, email: u.email })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.user) {
              setUser(data.user);
              setEditNombre(data.user.nombre || '');
              setEditCelular(data.user.celular || '');
              setEditCiudad(data.user.ciudad || 'Loja');
              localStorage.setItem('qvendes_user', JSON.stringify(data.user));
            } else {
              setUser(null);
              localStorage.removeItem('qvendes_user');
            }
          })
          .catch(() => {
            setUser(null);
            localStorage.removeItem('qvendes_user');
          });
      } catch {
        localStorage.removeItem('qvendes_user');
      }
    }
  }, []);

  // COMPRESIÓN DE IMÁGENES CANVAS DE ALTA EFICIENCIA
  const comprimirImagenCanvas = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>, numFoto: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Comprimido = await comprimirImagenCanvas(file);
      if (numFoto === 1) setPubFoto1(base64Comprimido);
      if (numFoto === 2) setPubFoto2(base64Comprimido);
      if (numFoto === 3) setPubFoto3(base64Comprimido);
      if (numFoto === 4) setPubFoto4(base64Comprimido);
    } catch (err) {
      alert('Error al procesar la imagen. Intenta con otra foto.');
    }
  };

  // BUSCAR
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarAnuncios();
  };

  // LOGIN / REGISTRO DIRECTO DE USUARIO
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

  // ACTUALIZAR PERFIL DE USUARIO
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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

  // PUBLICAR ANUNCIO EN NEON DB CON OPCIONES SELECCIONABLES
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

    // Armar cadenas de métodos seleccionados
    const metodosPagoLista = [];
    if (pagoEfectivo) metodosPagoLista.push('Efectivo');
    if (pagoTransferencia) metodosPagoLista.push('Transferencia Directa');
    if (pagoPlataforma) metodosPagoLista.push('Pago por plataforma Qvendes');
    const metodosPagoTexto = metodosPagoLista.join(' / ') || 'Efectivo / Transferencia Directa / Pago por plataforma Qvendes';

    const metodosEnvioLista = [];
    if (envioPersonal) metodosEnvioLista.push('Entrega personal');
    if (envioProvincias) metodosEnvioLista.push('Envío a provincias');
    const metodosEnvioTexto = metodosEnvioLista.join(' / ') || 'Entrega personal / Envío a provincias';

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
          metodos_pago: metodosPagoTexto,
          metodos_envio: metodosEnvioTexto,
          permitir_whatsapp: pubPermitirWhatsapp
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

        // Limpiar filtros activos para visibilidad inmediata
        setFiltroCiudad('');
        setFiltroCondicion('');
        setFiltroPrecioMin('');
        setFiltroPrecioMax('');
        setBusqueda('');

        cargarAnuncios().catch(() => {});

        setTimeout(() => {
          setPubExitoMensaje(false);
          setMostrarModalPublicar(false);
          setPubProcesando(false);
        }, 1200);
      } else {
        setPubProcesando(false);
        alert(`Error al publicar: ${data.error || 'Intenta de nuevo'}`);
      }
    } catch (e) {
      console.error('Error al publicar anuncio:', e);
      setPubProcesando(false);
      alert('Error de conexión al enviar la publicación.');
    }
  };

  // BUZÓN Y CHATS INTERNOS
  const abrirBuzonChats = async () => {
    if (!user) {
      alert('Debes iniciar sesión para abrir tu buzón de mensajes.');
      setModoAuth('login');
      setMostrarModalAuth(true);
      return;
    }
    setCargandoBuzon(true);
    setMostrarModalBuzon(true);
    try {
      const res = await fetch(`/api/mensajes?usuario_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversacionesBuzon(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error al cargar buzón:', e);
    } finally {
      setCargandoBuzon(false);
    }
  };

  const abrirChatParaAnuncio = (anuncio: Anuncio) => {
    if (!user) {
      alert('Debes iniciar sesión para enviar un mensaje al vendedor.');
      setModoAuth('login');
      setMostrarModalAuth(true);
      return;
    }
    setChatAnuncioActivo(anuncio);
    setMostrarModalChat(true);
    cargarHiloMensajes(anuncio.id, anuncio.vendedor_id);
  };

  const cargarHiloMensajes = async (anuncioId: number, vendedorId: string | number) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/mensajes?usuario_id=${user.id}&anuncio_id=${anuncioId}&conversacion_con=${vendedorId}`);
      if (res.ok) {
        const data = await res.json();
        setMensajesThread(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error al cargar hilo de mensajes:', e);
    }
  };

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatAnuncioActivo || !nuevoMensajeTexto.trim()) return;

    setEnviandoMensaje(true);
    try {
      const res = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncio_id: chatAnuncioActivo.id,
          emisor_id: user.id,
          receptor_id: chatAnuncioActivo.vendedor_id,
          mensaje: nuevoMensajeTexto
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNuevoMensajeTexto('');
        cargarHiloMensajes(chatAnuncioActivo.id, chatAnuncioActivo.vendedor_id);
      } else {
        alert(`Error al enviar mensaje: ${data.error || 'Intenta de nuevo'}`);
      }
    } catch (e) {
      alert('Error de conexión al enviar el mensaje.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  // ACTIVAR PROMOCIÓN TOP O PREMIUM DESCONTANDO SALDO
  const handleActivarPromocion = async (tipo: 'top' | 'premium') => {
    if (!user || !anuncioAPromocionar) return;
    setProcesandoPromocion(true);

    try {
      const res = await fetch('/api/billetera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comprar_promocion',
          usuario_id: user.id,
          anuncio_id: anuncioAPromocionar.id,
          tipo_promocion: tipo,
          dias: diasPromocion
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.mensaje);
        setUser({ ...user, saldo_billetera: data.nuevoSaldo });
        localStorage.setItem('qvendes_user', JSON.stringify({ ...user, saldo_billetera: data.nuevoSaldo }));
        setAnuncioAPromocionar(null);
        cargarAnuncios();
      } else {
        alert(data.error || 'No se pudo procesar la promoción.');
      }
    } catch (e) {
      alert('Error de conexión al activar promoción.');
    } finally {
      setProcesandoPromocion(false);
    }
  };

  // ENLACE DIRECTO A WHATSAPP DEL VENDEDOR
  const abrirWhatsappVendedor = (a: Anuncio) => {
    const num = a.vendedor_celular || '0986564646';
    const numLimpio = num.replace(/\D/g, '');
    const numFinal = numLimpio.startsWith('0') ? '593' + numLimpio.substring(1) : numLimpio;
    const msg = encodeURIComponent(`Hola, vi tu anuncio "${a.titulo}" en Qvendes ($${a.precio}) y deseo más información.`);
    window.open(`https://wa.me/${numFinal}?text=${msg}`, '_blank');
  };

  // FAVORITOS
  const toggleFavorito = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter(fId => fId !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans text-slate-800 flex flex-col">
      {/* 🟡 CABECERA Y NAVEGACIÓN PRINCIPAL */}
      <header className="bg-amber-100/80 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          
          {/* LOGO Q-VENDES */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <span className="text-xl font-black text-amber-400">Q</span>
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Qvendes<span className="text-purple-600 text-xs px-2 py-0.5 rounded-full bg-purple-100 font-bold border border-purple-200">.app</span>
              </span>
              <p className="text-[10px] font-bold text-slate-500 hidden sm:block">Mercado Libre de Ecuador</p>
            </div>
          </div>

          {/* BUSCADOR RÁPIDO DENTRO DEL NAVBAR (DESKTOP) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full flex items-center">
              <input 
                type="text" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
                placeholder="¿Qué buscas hoy en Ecuador? Ej. Laptop, Moto..." 
                className="w-full bg-white border border-amber-300/80 rounded-2xl py-2 pl-4 pr-10 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-purple-600 transition-all shadow-inner"
              />
              <button type="submit" className="absolute right-2 text-purple-600 p-1 hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* ACCIONES Y BOTONES DE PERFIL / MENÚ */}
          <div className="flex items-center gap-2">
            
            {/* BOTÓN "PUBLICAR ANUNCIO" */}
            <button 
              onClick={() => {
                if (!user) {
                  setModoAuth('login');
                  setMostrarModalAuth(true);
                } else {
                  setMostrarModalPublicar(true);
                }
              }}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white px-3.5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-purple-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Publicar Anuncio</span>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5">
                {/* BOTÓN "MIS ANUNCIOS" */}
                <button 
                  onClick={() => setMostrarModalMisAnuncios(true)}
                  title="Mis Anuncios"
                  className="bg-white border border-amber-300 hover:border-purple-400 text-slate-700 p-2 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Package className="w-4 h-4 text-purple-600" />
                  <span className="hidden md:inline">Mis Anuncios</span>
                </button>

                {/* BOTÓN "MIS MENSAJES" */}
                <button 
                  onClick={abrirBuzonChats}
                  title="Buzón de Chats"
                  className="bg-white border border-amber-300 hover:border-purple-400 text-slate-700 p-2 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span className="hidden md:inline">Chats</span>
                </button>

                {/* BOTÓN "BILLETERA / CRÉDITOS" */}
                <button 
                  onClick={() => setMostrarModalRecargar(true)}
                  className="bg-amber-200/80 hover:bg-amber-300 border border-amber-400/80 text-amber-900 px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Wallet className="w-4 h-4 text-amber-700" />
                  <span>${user.saldo_billetera ? Number(user.saldo_billetera).toFixed(2) : '0.00'}</span>
                </button>

                {/* BOTÓN DE MI PERFIL */}
                <button 
                  onClick={() => setMostrarModalPerfil(true)}
                  className="bg-white border border-amber-300 hover:border-purple-400 p-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <User className="w-4 h-4 text-purple-700" />
                  <span className="hidden lg:inline text-slate-900 font-black">{user.nombre.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setModoAuth('login'); setMostrarModalAuth(true); }}
                className="bg-white border border-amber-300 hover:border-purple-400 text-slate-800 px-3.5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4 text-purple-600" />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🔍 BARRA DE FILTROS & BUSCADOR PRINCIPAL (MÓVIL & GENERAL) */}
      <section className="bg-amber-100/40 border-b border-amber-200/60 py-4 px-4">
        <div className="max-w-7xl mx-auto space-y-3">
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
                placeholder="¿Qué estás buscando? (Ej. iPhone, Camioneta, Servicio...)" 
                className="w-full bg-white border border-amber-300 rounded-2xl py-3 pl-4 pr-10 text-xs font-semibold text-slate-900 outline-none focus:border-purple-600 shadow-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600">
                <Search className="w-4.5 h-4.5" />
              </button>
            </div>

            <button 
              type="button" 
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)} 
              className={`px-3.5 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${mostrarFiltrosAvanzados ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-slate-700 border-amber-300 shadow-sm'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </form>

          {/* PANEL DESPLEGABLE DE FILTROS AVANZADOS POR CIUDAD & PRECIO */}
          {mostrarFiltrosAvanzados && (
            <div className="bg-white border border-amber-300 rounded-3xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 shadow-lg">
              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Ciudad (Ecuador)</label>
                <select value={filtroCiudad} onChange={(e) => { setFiltroCiudad(e.target.value); cargarAnuncios(); }} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none">
                  <option value="">Todas las Ciudades</option>
                  {ciudadesEcuador.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Precio Mínimo ($)</label>
                <input type="number" value={filtroPrecioMin} onChange={(e) => setFiltroPrecioMin(e.target.value)} placeholder="0.00" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Precio Máximo ($)</label>
                <input type="number" value={filtroPrecioMax} onChange={(e) => setFiltroPrecioMax(e.target.value)} placeholder="9999.00" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none" />
              </div>

              <div className="flex items-end gap-2">
                <button type="button" onClick={cargarAnuncios} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow">
                  Aplicar
                </button>
                <button type="button" onClick={() => { setFiltroCiudad(''); setFiltroCondicion(''); setFiltroPrecioMin(''); setFiltroPrecioMax(''); setBusqueda(''); cargarAnuncios(); }} className="bg-amber-200 text-amber-900 px-3 py-2.5 rounded-xl text-xs font-bold">
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* FILTROS RÁPIDOS POR CONDICIÓN */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider mr-1">Condición:</span>
            <button type="button" onClick={() => { setFiltroCondicion(''); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${!filtroCondicion ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm' : 'bg-white text-slate-700 border-amber-300 font-semibold'}`}>
              Todos
            </button>
            <button type="button" onClick={() => { setFiltroCondicion('nuevo'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'nuevo' ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm' : 'bg-white text-slate-700 border-amber-300 font-semibold'}`}>
              ✨ Nuevos
            </button>
            <button type="button" onClick={() => { setFiltroCondicion('usado'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'usado' ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm' : 'bg-white text-slate-700 border-amber-300 font-semibold'}`}>
              📦 Usados
            </button>
            <button type="button" onClick={() => { setFiltroCondicion('servicio'); cargarAnuncios(); }} className={`px-3 py-1.5 rounded-xl border ${filtroCondicion === 'servicio' ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm' : 'bg-white text-slate-700 border-amber-300 font-semibold'}`}>
              🛠️ Servicios
            </button>
          </div>
        </div>
      </section>

      {/* 🛍️ FEED DE ANUNCIOS EN PORTADA (GRID MÁS COMPACTO Y MEZCLA ALEATORIA DINÁMICA) */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">

        {/* FEED PRINCIPAL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              🛍️ Catálogo de Publicaciones ({anunciosFeed.length})
            </h2>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
              🔀 Orden Aleatorio Dinámico
            </span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {anunciosFeed.map((a) => {
                const esPremium = Boolean(a.es_premium);
                const esTop = Boolean(a.es_top);

                return (
                  <div 
                    key={a.id}
                    onClick={() => { setAnuncioDetalle(a); setFotoSeleccionadaIndex(0); }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between border ${esPremium ? 'border-amber-400 ring-2 ring-amber-300/80 shadow-amber-200/50' : esTop ? 'border-purple-300 ring-1 ring-purple-200' : 'border-amber-200/80 hover:border-purple-400'}`}
                  >
                    {/* IMAGEN COMPACTA H-36 */}
                    <div className="h-36 bg-amber-100/60 relative flex items-center justify-center overflow-hidden">
                      {a.foto1 ? (
                        <img src={a.foto1} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                      ) : (
                        <div className="text-3xl text-amber-300">📦</div>
                      )}

                      {/* BADGES DE DESTACADO */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {esPremium && (
                          <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow flex items-center gap-1 border border-amber-300 animate-pulse">
                            <Crown className="w-3 h-3 fill-slate-900" /> PREMIUM
                          </span>
                        )}
                        {esTop && !esPremium && (
                          <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> TOP
                          </span>
                        )}
                      </div>

                      {/* BOTÓN DE FAVORITO */}
                      <button 
                        type="button" 
                        onClick={(e) => toggleFavorito(e, a.id)} 
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favoritos.includes(a.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* CONDICIÓN */}
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                          {a.condicion || 'Nuevo'}
                        </span>
                      </div>
                    </div>

                    {/* DETALLES DE TARJETA COMPACTA */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
                            {a.titulo}
                          </h3>
                        </div>
                        <p className="text-amber-700 font-black text-sm mt-1">
                          ${Number(a.precio).toFixed(2)}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-amber-100 space-y-1.5 text-[10px] text-slate-500">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-purple-600" /> {a.ciudad}
                          </span>
                          <span className="truncate max-w-[80px]">{a.vendedor_nombre}</span>
                        </div>

                        {/* ACCIÓN RÁPIDA: WHATSAPP DIRECTO SI FUE PERMITIDO */}
                        {user && a.permitir_whatsapp !== false && (
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); abrirWhatsappVendedor(a); }}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow-sm"
                          >
                            <Phone className="w-3 h-3 fill-white" />
                            <span className="text-[10px]">WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 📦 MODAL "MIS ANUNCIOS" (GESTOR PROPIO & COMPRA DE PROMOCIONES TOP / PREMIUM) */}
      {mostrarModalMisAnuncios && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-base flex items-center gap-2">
                📦 Mis Anuncios Publicados
              </h3>
              <button type="button" onClick={() => setMostrarModalMisAnuncios(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {anunciosFeed.filter(a => String(a.vendedor_id) === String(user.id)).length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-xs text-slate-500">Aún no has publicado ningún anuncio con tu cuenta actual.</p>
                <button 
                  onClick={() => { setMostrarModalMisAnuncios(false); setMostrarModalPublicar(true); }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase"
                >
                  ➕ Publicar Anuncio Ahora
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {anunciosFeed.filter(a => String(a.vendedor_id) === String(user.id)).map(a => (
                  <div key={a.id} className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-amber-200 flex-shrink-0">
                        {a.foto1 ? <img src={a.foto1} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{a.titulo}</h4>
                        <p className="text-amber-700 font-black text-xs">${Number(a.precio).toFixed(2)} • {a.ciudad}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {a.es_premium && <span className="bg-amber-400 text-slate-900 font-black text-[9px] px-2 py-0.5 rounded uppercase">👑 PREMIUM</span>}
                          {a.es_top && !a.es_premium && <span className="bg-purple-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase">⭐ TOP</span>}
                          {!a.es_top && !a.es_premium && <span className="bg-slate-200 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded uppercase">Normal</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => { setAnuncioAPromocionar(a); }}
                        className="bg-gradient-to-r from-amber-500 to-purple-600 text-white px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" /> Promocionar Anuncio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚀 MODAL CONFIRMAR PROMOCIÓN TOP ($1/DÍA) O PREMIUM ($1.50/DÍA) */}
      {anuncioAPromocionar && user && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-2">
                ⭐ Promocionar: {anuncioAPromocionar.titulo}
              </h3>
              <button type="button" onClick={() => setAnuncioAPromocionar(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Duración en Días</label>
                <select value={diasPromocion} onChange={(e) => setDiasPromocion(Number(e.target.value))} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900">
                  <option value={1}>1 Día</option>
                  <option value={3}>3 Días</option>
                  <option value={7}>7 Días (1 Semana)</option>
                  <option value={15}>15 Días</option>
                  <option value={30}>30 Días (1 Mes)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  disabled={procesandoPromocion}
                  onClick={() => handleActivarPromocion('top')} 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-wider space-y-1 text-center shadow hover:opacity-95"
                >
                  <div className="flex justify-center"><Star className="w-5 h-5 fill-white" /></div>
                  <div>Promoción TOP</div>
                  <div className="text-[10px] opacity-90">${(1.00 * diasPromocion).toFixed(2)} por {diasPromocion} día(s)</div>
                </button>

                <button 
                  type="button" 
                  disabled={procesandoPromocion}
                  onClick={() => handleActivarPromocion('premium')} 
                  className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-900 p-4 rounded-2xl font-black text-xs uppercase tracking-wider space-y-1 text-center shadow-lg hover:opacity-95"
                >
                  <div className="flex justify-center"><Crown className="w-5 h-5 fill-slate-900" /></div>
                  <div>Promoción PREMIUM</div>
                  <div className="text-[10px] opacity-90">${(1.50 * diasPromocion).toFixed(2)} por {diasPromocion} día(s)</div>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Saldo disponible en Billetera: <strong className="text-purple-700">${Number(user.saldo_billetera || 0).toFixed(2)}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 💳 MODAL "BILLETERA Y RECARGA CON DATOS BANCARIOS OCULTOS" */}
      {mostrarModalRecargar && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-base flex items-center gap-2">
                💳 Billetera de Créditos Qvendes
              </h3>
              <button type="button" onClick={() => { setMostrarModalRecargar(false); setMostrarDatosBancarios(false); }} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-4 text-center space-y-1">
              <p className="text-xs font-bold text-amber-900 uppercase">Saldo Disponible</p>
              <p className="text-3xl font-black text-slate-900">${Number(user.saldo_billetera || 0).toFixed(2)}</p>
              <p className="text-[10px] text-amber-800">Usa tus créditos para destacar anuncios como TOP ($1.00/día) o PREMIUM ($1.50/día).</p>
            </div>

            {!mostrarDatosBancarios ? (
              <button 
                type="button" 
                onClick={() => setMostrarDatosBancarios(true)}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-black py-3.5 rounded-xl uppercase text-xs tracking-wider shadow-lg"
              >
                🏦 Ver Datos para Depósito / Transferencia Bancaria
              </button>
            ) : (
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 text-xs border border-amber-400 shadow-xl">
                <h4 className="font-black text-amber-400 uppercase text-xs border-b border-slate-700 pb-2">
                  📋 Datos para Depósito / Transferencia
                </h4>
                <div className="space-y-1.5 font-semibold text-slate-200">
                  <p><span className="text-amber-400 font-bold">Titular:</span> Luis Antonio Lozano</p>
                  <p><span className="text-amber-400 font-bold">Banco:</span> Banco Pichincha</p>
                  <p><span className="text-amber-400 font-bold">Tipo de Cuenta:</span> Cuenta de Ahorros</p>
                  <p><span className="text-amber-400 font-bold">Número de Cuenta:</span> 3995243200</p>
                  <p><span className="text-amber-400 font-bold">Cédula / RUC:</span> 1103858294</p>
                </div>

                <a 
                  href="https://wa.me/593986564646?text=Hola%20Luis,%20adjunto%20comprobante%20de%20recarga%20de%20creditos%20para%20Qvendes.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow transition-all mt-2"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>📱 Enviar Comprobante al 0986564646</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💬 MODAL "BUZÓN DE CHATS INTERNO" */}
      {mostrarModalBuzon && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-base flex items-center gap-2">
                💬 Buzón de Conversaciones
              </h3>
              <button type="button" onClick={() => setMostrarModalBuzon(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {cargandoBuzon ? (
              <p className="text-center text-xs text-slate-500 py-8">Cargando buzón de mensajes...</p>
            ) : conversacionesBuzon.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Aún no tienes conversaciones ni mensajes registrados.
              </div>
            ) : (
              <div className="space-y-2">
                {conversacionesBuzon.map(m => (
                  <div 
                    key={m.id}
                    onClick={() => {
                      setMostrarModalBuzon(false);
                      setChatAnuncioActivo({
                        id: m.anuncio_id,
                        vendedor_id: String(m.emisor_id) === String(user.id) ? m.receptor_id : m.emisor_id,
                        titulo: m.anuncio_titulo || 'Anuncio en Qvendes',
                        precio: 0,
                        condicion: 'nuevo',
                        categoria: 'general',
                        ciudad: 'Loja',
                        descripcion: '',
                        foto1: m.anuncio_foto,
                        es_top: false,
                        es_premium: false,
                        vendedor_nombre: m.emisor_nombre || 'Usuario',
                        vendedor_verificado: false,
                        creado_en: m.creado_en
                      });
                      setMostrarModalChat(true);
                      cargarHiloMensajes(m.anuncio_id, String(m.emisor_id) === String(user.id) ? m.receptor_id : m.emisor_id);
                    }}
                    className="bg-amber-50/60 border border-amber-200 hover:border-purple-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-black text-sm">
                        💬
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{m.anuncio_titulo || 'Consulta de Anuncio'}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-1">{m.mensaje}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(m.creado_en).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💬 MODAL CHAT DE HILO DIRECTO */}
      {mostrarModalChat && chatAnuncioActivo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl flex flex-col h-[500px]">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs sm:text-sm">{chatAnuncioActivo.titulo}</h3>
                <p className="text-[10px] text-slate-500">Vendedor: {chatAnuncioActivo.vendedor_nombre}</p>
              </div>
              <button type="button" onClick={() => setMostrarModalChat(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-amber-50/40 rounded-2xl border border-amber-200">
              {mensajesThread.map(m => {
                const esMio = user && String(m.emisor_id) === String(user.id);
                return (
                  <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${esMio ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-slate-900 border border-amber-300 rounded-bl-none'}`}>
                      <p className="font-semibold">{m.mensaje}</p>
                      <span className={`text-[9px] block text-right mt-1 ${esMio ? 'text-purple-200' : 'text-slate-400'}`}>
                        {new Date(m.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleEnviarMensaje} className="flex gap-2">
              <input 
                type="text" 
                value={nuevoMensajeTexto} 
                onChange={(e) => setNuevoMensajeTexto(e.target.value)} 
                placeholder="Escribe tu mensaje aquí..." 
                className="flex-1 bg-amber-50/60 border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
              />
              <button type="submit" disabled={enviandoMensaje} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📢 MODAL DETALLE DE ANUNCIOS */}
      {anuncioDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-sm sm:text-base">{anuncioDetalle.titulo}</h3>
              <button type="button" onClick={() => setAnuncioDetalle(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-60 bg-amber-100 rounded-2xl overflow-hidden border border-amber-200 relative flex items-center justify-center">
                {anuncioDetalle.foto1 ? (
                  <img src={anuncioDetalle.foto1} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl text-amber-300">📦</div>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-2xl font-black text-amber-700">${Number(anuncioDetalle.precio).toFixed(2)}</p>
                <p className="text-slate-600"><strong>Ciudad:</strong> {anuncioDetalle.ciudad}</p>
                <p className="text-slate-600"><strong>Condición:</strong> {anuncioDetalle.condicion}</p>
                <p className="text-slate-600"><strong>Vendedor:</strong> {anuncioDetalle.vendedor_nombre}</p>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <p className="text-[10px] font-black uppercase text-purple-700">Métodos Aceptados & Envíos</p>
                  <p className="text-slate-700 font-semibold">{anuncioDetalle.metodos_pago || 'Efectivo / Transferencia Directa / Pago por plataforma Qvendes'}</p>
                  <p className="text-slate-700 font-semibold">{anuncioDetalle.metodos_envio || 'Entrega personal / Envío a provincias'}</p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => { setAnuncioDetalle(null); abrirChatParaAnuncio(anuncioDetalle); }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl uppercase text-xs shadow flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Enviar Mensaje Interno
                  </button>

                  {user && anuncioDetalle.permitir_whatsapp !== false && (
                    <button 
                      type="button"
                      onClick={() => abrirWhatsappVendedor(anuncioDetalle)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl uppercase text-xs shadow flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4 fill-white" /> Contactar por WhatsApp Directo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-200 text-xs space-y-1">
              <h4 className="font-black text-slate-900 uppercase">Descripción</h4>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{anuncioDetalle.descripcion || 'Sin descripción adicional.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ➕ MODAL PUBLICAR ANUNCIO CON CHECKBOXES DE PAGO & ENVÍO */}
      {mostrarModalPublicar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-base">➕ Publicar Nuevo Anuncio</h3>
              <button type="button" onClick={() => setMostrarModalPublicar(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {pubExitoMensaje ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-center space-y-2">
                <p className="font-black text-sm">¡Publicación Exitosa!</p>
                <p className="text-xs">Tu anuncio ya se encuentra activo en la pantalla principal.</p>
              </div>
            ) : (
              <form onSubmit={handlePublicarSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Título del Anuncio *</label>
                  <input type="text" required value={pubTitulo} onChange={(e) => setPubTitulo(e.target.value)} placeholder="Ej. Laptop HP Core i7 en perfecto estado" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Precio ($USD) *</label>
                    <input type="number" step="0.01" required value={pubPrecio} onChange={(e) => setPubPrecio(e.target.value)} placeholder="0.00" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Condición *</label>
                    <select value={pubCondicion} onChange={(e) => setPubCondicion(e.target.value as any)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none">
                      <option value="nuevo">✨ Nuevo</option>
                      <option value="usado">📦 Usado</option>
                      <option value="servicio">🛠️ Servicio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Categoría</label>
                    <select value={pubCategoria} onChange={(e) => setPubCategoria(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none">
                      <option value="Vehículos">Vehículos</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Hogar">Hogar</option>
                      <option value="Moda">Moda</option>
                      <option value="Inmuebles">Inmuebles</option>
                      <option value="Servicios">Servicios</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Ciudad</label>
                    <select value={pubCiudad} onChange={(e) => setPubCiudad(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none">
                      {ciudadesEcuador.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* MÉTODOS DE PAGO SELECCIONABLES */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                  <label className="block text-[10px] font-black uppercase text-purple-700">Métodos de Pago Aceptados</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 font-semibold">
                      <input type="checkbox" checked={pagoEfectivo} onChange={(e) => setPagoEfectivo(e.target.checked)} className="rounded text-purple-600" /> Efectivo
                    </label>
                    <label className="flex items-center gap-2 font-semibold">
                      <input type="checkbox" checked={pagoTransferencia} onChange={(e) => setPagoTransferencia(e.target.checked)} className="rounded text-purple-600" /> Transferencia Directa
                    </label>
                    <label className="flex items-center gap-2 font-semibold">
                      <input type="checkbox" checked={pagoPlataforma} onChange={(e) => setPagoPlataforma(e.target.checked)} className="rounded text-purple-600" /> Pago por plataforma Qvendes
                    </label>
                  </div>
                </div>

                {/* MÉTODOS DE ENVÍO SELECCIONABLES */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                  <label className="block text-[10px] font-black uppercase text-purple-700">Métodos de Envío Aceptados</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 font-semibold">
                      <input type="checkbox" checked={envioPersonal} onChange={(e) => setEnvioPersonal(e.target.checked)} className="rounded text-purple-600" /> Entrega personal
                    </label>
                    <label className="flex items-center gap-2 font-semibold">
                      <input type="checkbox" checked={envioProvincias} onChange={(e) => setEnvioProvincias(e.target.checked)} className="rounded text-purple-600" /> Envío a provincias
                    </label>
                  </div>
                </div>

                {/* PERMITIR WHATSAPP DIRECTO */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Contacto Directo por WhatsApp</p>
                    <p className="text-[10px] text-slate-500">Permite que compradores registrados te escriban directo a tu celular.</p>
                  </div>
                  <input type="checkbox" checked={pubPermitirWhatsapp} onChange={(e) => setPubPermitirWhatsapp(e.target.checked)} className="w-5 h-5 accent-emerald-600 cursor-pointer" />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Descripción</label>
                  <textarea rows={3} value={pubDescripcion} onChange={(e) => setPubDescripcion(e.target.value)} placeholder="Describe tu producto..." className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-semibold text-slate-900 outline-none"></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Fotografía Principal *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleSubirFoto(e, 1)} className="w-full text-xs font-semibold" />
                </div>

                <button type="submit" disabled={pubProcesando} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black py-4 rounded-xl uppercase text-xs shadow-lg">
                  {pubProcesando ? 'Publicando...' : '🚀 Publicar Anuncio'}
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
                {modoAuth === 'login' ? '🔑 Iniciar Sesión en Qvendes' : '📝 Registro de Usuario'}
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
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authProcesando}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-black py-4 rounded-xl uppercase text-xs shadow-lg"
              >
                {authProcesando ? 'Procesando...' : modoAuth === 'login' ? '🔑 Ingresar a mi Cuenta' : '📝 Crear mi Cuenta'}
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

      {/* 👤 MODAL MI PERFIL DE USUARIO */}
      {mostrarModalPerfil && user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-300 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-black text-slate-900 uppercase text-base flex items-center gap-2">
                👤 Mi Perfil de Usuario
              </h3>
              <button type="button" onClick={() => setMostrarModalPerfil(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕ Cerrar</button>
            </div>

            {editExito && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-bold text-center">
                ¡Perfil actualizado correctamente!
              </div>
            )}

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Nombres Completos</label>
                <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Teléfono / Celular</label>
                <input type="text" value={editCelular} onChange={(e) => setEditCelular(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Ciudad</label>
                <select value={editCiudad} onChange={(e) => setEditCiudad(e.target.value)} className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none">
                  {ciudadesEcuador.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-purple-700 mb-1">Nueva Contraseña (Opcional)</label>
                <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Dejar en blanco para conservar la actual" className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-3 font-bold text-slate-900 outline-none" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={editProcesando} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl uppercase text-xs shadow">
                  {editProcesando ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setUser(null);
                    localStorage.removeItem('qvendes_user');
                    setMostrarModalPerfil(false);
                  }} 
                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-black uppercase"
                >
                  Salir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* <footer> */}
      <footer className="bg-slate-900 text-slate-400 border-t border-amber-400/40 py-6 px-4 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-bold text-slate-200">Qvendes.app • Mercado Libre de Ecuador</p>
          <p className="text-[11px] text-slate-500">© 2026 LatinRed Portal. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
