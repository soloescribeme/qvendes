'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Clock, Calendar, CheckCircle2, AlertCircle, Sparkles, Search } from 'lucide-react';

interface Patrocinador {
  id: number;
  cliente_nombre: string;
  cliente_email?: string;
  num_comprobante?: string;
  monto: number;
  palabras_clave: string;
  titulo: string;
  descripcion?: string;
  foto1?: string;
  url_destino?: string;
  periodo_tipo: 'horas' | 'dias';
  periodo_valor: number;
  franja_inicio: string;
  franja_fin: string;
  fecha_vencimiento?: string;
  estado: 'vigente' | 'caducado' | 'pendiente_pago';
  creado_en: string;
}

export default function AdminPatrocinadoresPage() {
  const router = useRouter();

  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<'vigentes' | 'caducados' | 'pendientes'>('vigentes');

  // FORMULARIO DE NUEVO PATROCINADOR
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [numComprobante, setNumComprobante] = useState('');
  const [monto, setMonto] = useState('');
  const [palabrasClave, setPalabrasClave] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto1, setFoto1] = useState('');
  const [urlDestino, setUrlDestino] = useState('');
  const [periodoTipo, setPeriodoTipo] = useState<'horas' | 'dias'>('dias');
  const [periodoValor, setPeriodoValor] = useState('7');
  const [franjaInicio, setFranjaInicio] = useState('08:00');
  const [franjaFin, setFranjaFin] = useState('20:00');
  const [guardando, setGuardando] = useState(false);

  const cargarPatrocinadores = async () => {
    try {
      const res = await fetch('/api/admin/patrocinadores');
      if (res.ok) {
        const data = await res.json();
        setPatrocinadores(data);
      }
    } catch (e) {
      console.error('Error cargando patrocinadores:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPatrocinadores();
  }, []);

  const handleCrearPatrocinador = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = await fetch('/api/admin/patrocinadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: clienteNombre,
          cliente_email: clienteEmail,
          num_comprobante: numComprobante,
          monto: monto,
          palabras_clave: palabrasClave,
          titulo: titulo,
          descripcion: descripcion,
          foto1: foto1,
          url_destino: urlDestino,
          periodo_tipo: periodoTipo,
          periodo_valor: periodoValor,
          franja_inicio: franjaInicio,
          franja_fin: franjaFin
        })
      });

      if (res.ok) {
        setMostrarModalCrear(false);
        // Reset form
        setClienteNombre('');
        setClienteEmail('');
        setNumComprobante('');
        setMonto('');
        setPalabrasClave('');
        setTitulo('');
        setDescripcion('');
        setFoto1('');
        cargarPatrocinadores();
      }
    } catch (e) {
      console.error('Error al guardar patrocinador:', e);
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch('/api/admin/patrocinadores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
      if (res.ok) {
        cargarPatrocinadores();
      }
    } catch (e) {
      console.error('Error cambiando estado:', e);
    }
  };

  const vigentes = patrocinadores.filter(p => p.estado === 'vigente');
  const caducados = patrocinadores.filter(p => p.estado === 'caducado');
  const pendientes = patrocinadores.filter(p => p.estado === 'pendiente_pago');

  const listaFiltrada = tab === 'vigentes' ? vigentes : tab === 'caducados' ? caducados : pendientes;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      
      {/* ENCABEZADO */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Panel de Administración <span className="text-purple-400">Qvendes</span>
            </h1>
            <p className="text-xs text-slate-400">Gestión de Anuncios Patrocinados por Palabras Clave y Horarios</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold"
          >
            ⬅️ Volver al Marketplace
          </button>

          <button
            type="button"
            onClick={() => setMostrarModalCrear(true)}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-90 text-white font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Nuevo Anuncio Patrocinado
          </button>
        </div>
      </div>

      {/* PESTAÑAS DE CONTROL DE ESTADOS */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-850">
        <button
          type="button"
          onClick={() => setTab('vigentes')}
          className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
            tab === 'vigentes'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Vigentes ({vigentes.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('pendientes')}
          className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
            tab === 'pendientes'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Pendientes de Pago ({pendientes.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('caducados')}
          className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
            tab === 'caducados'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-400" />
          Caducados ({caducados.length})
        </button>
      </div>

      {/* MODAL CREAR ANUNCIO PATROCINADO */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-2xl w-full space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="font-black text-white uppercase text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Crear Anuncio de Patrocinador
              </h3>
              <button type="button" onClick={() => setMostrarModalCrear(false)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCrearPatrocinador} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nombre del Cliente / Vendedor *</label>
                  <input type="text" required value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Ej. Comercial Lozano" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email del Cliente</label>
                  <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} placeholder="cliente@email.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">N° Comprobante de Depósito / Transferencia *</label>
                  <input type="text" required value={numComprobante} onChange={(e) => setNumComprobante(e.target.value)} placeholder="Ej. TR-998811" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Monto Cobrado ($ USD) *</label>
                  <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej. 25.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-bold" />
                </div>
              </div>

              {/* PALABRAS CLAVE VINCULADAS */}
              <div className="bg-purple-950/20 p-3 rounded-2xl border border-purple-500/30 space-y-1">
                <label className="block text-[10px] font-black uppercase text-purple-300 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" /> Palabras Clave de Búsqueda (separadas por comas) *
                </label>
                <input type="text" required value={palabrasClave} onChange={(e) => setPalabrasClave(e.target.value)} placeholder="Ej. laptop, electronica, computadoras, ofertas" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-medium" />
                <span className="text-[9px] text-slate-400">Este anuncio aparecerá de forma destacada cuando el usuario busque estas palabras.</span>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Título del Anuncio *</label>
                <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. ¡Laptops i7 con 30% Descuento en Comercial Lozano!" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-bold" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Descripción / Oferta</label>
                <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles de la promoción o contacto..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500" />
              </div>

              {/* PERIODO DE VIGENCIA Y FRANJA HORARIA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Periodo de Vigencia *
                  </label>
                  <div className="flex gap-2">
                    <input type="number" min="1" value={periodoValor} onChange={(e) => setPeriodoValor(e.target.value)} className="w-20 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center text-white font-bold" />
                    <select value={periodoTipo} onChange={(e) => setPeriodoTipo(e.target.value as 'horas' | 'dias')} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold">
                      <option value="dias">Días</option>
                      <option value="horas">Horas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Franja Horaria de Publicación *
                  </label>
                  <div className="flex gap-2 items-center">
                    <input type="time" value={franjaInicio} onChange={(e) => setFranjaInicio(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-white font-bold text-xs" />
                    <span className="text-slate-500 font-bold">a</span>
                    <input type="time" value={franjaFin} onChange={(e) => setFranjaFin(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-white font-bold text-xs" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                {guardando ? 'Guardando Anuncio...' : '✅ Registrar Anuncio Patrocinado'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LISTA DE ANUNCIOS PATROCINADOS */}
      <div className="max-w-7xl mx-auto space-y-4">
        {cargando ? (
          <p className="text-center text-xs text-slate-400 py-12">Cargando anuncios del administrador...</p>
        ) : listaFiltrada.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-12 bg-slate-900/40 rounded-3xl border border-slate-850">
            No hay anuncios patrocinados registradas en esta pestaña.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listaFiltrada.map((p) => (
              <div key={p.id} className="bg-slate-900 p-5 rounded-3xl border border-slate-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      ⭐ Patrocinado ID #{p.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      Comprobante: {p.num_comprobante || 'S/N'}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ${Number(p.monto).toFixed(2)} USD
                    </span>
                  </div>

                  <h3 className="font-black text-white text-base">{p.titulo}</h3>
                  <p className="text-xs text-slate-300 font-medium">{p.descripcion}</p>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-1 text-xs">
                    <p className="text-purple-300 font-bold">
                      🔍 Palabras Clave: <span className="text-white">{p.palabras_clave}</span>
                    </p>
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <span>👤 Cliente: <strong className="text-white">{p.cliente_nombre}</strong></span>
                      <span>📅 Vigencia: <strong className="text-white">{p.periodo_valor} {p.periodo_tipo}</strong></span>
                      <span>🕒 Franja Horaria: <strong className="text-white">{p.franja_inicio} a {p.franja_fin}</strong></span>
                      {p.fecha_vencimiento && (
                        <span>⏳ Vence: <strong className="text-amber-400">{new Date(p.fecha_vencimiento).toLocaleString()}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  {p.estado !== 'vigente' && (
                    <button
                      type="button"
                      onClick={() => handleCambiarEstado(p.id, 'vigente')}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-500/30 uppercase"
                    >
                      Aprobar Vigente
                    </button>
                  )}

                  {p.estado !== 'pendiente_pago' && (
                    <button
                      type="button"
                      onClick={() => handleCambiarEstado(p.id, 'pendiente_pago')}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-500/30 uppercase"
                    >
                      Marcar Pendiente
                    </button>
                  )}

                  {p.estado !== 'caducado' && (
                    <button
                      type="button"
                      onClick={() => handleCambiarEstado(p.id, 'caducado')}
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-500/30 uppercase"
                    >
                      Marcar Caducado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
