import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ArrowRightLeft, 
  Building2, 
  History, 
  Calculator, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Plus, 
  Sparkles, 
  DollarSign, 
  Coins, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { BancoTipoCambio, HistorialTipoCambio, ConfiguracionMoneda } from '../types';
import { 
  formatearCordobas, 
  formatearDolares, 
  convertirDolarACordoba, 
  convertirCordobaADolar 
} from '../utils/exchangeRates';

interface TipoCambioModalProps {
  isOpen: boolean;
  onClose: () => void;
  bancos: BancoTipoCambio[];
  historial: HistorialTipoCambio[];
  configMoneda: ConfiguracionMoneda;
  usuarioActual: string;
  onActualizarBanco: (bancoActualizado: BancoTipoCambio, motivo?: string) => void;
  onSeleccionarBancoActivo: (bancoId: string, tipoTasa?: 'compra' | 'venta' | 'oficial' | 'personalizada') => void;
  onCambiarMonedaPrincipal: (moneda: 'COR' | 'USD') => void;
  onAgregarHistorialManual: (registro: Omit<HistorialTipoCambio, 'id' | 'fecha'>) => void;
}

export const TipoCambioModal: React.FC<TipoCambioModalProps> = ({
  isOpen,
  onClose,
  bancos,
  historial,
  configMoneda,
  usuarioActual,
  onActualizarBanco,
  onSeleccionarBancoActivo,
  onCambiarMonedaPrincipal,
  onAgregarHistorialManual
}) => {
  const [tabActiva, setTabActiva] = useState<'bancos' | 'historial' | 'calculadora'>('bancos');
  const [bancoEditando, setBancoEditando] = useState<BancoTipoCambio | null>(null);
  const [editCompra, setEditCompra] = useState<string>('');
  const [editVenta, setEditVenta] = useState<string>('');
  const [editMotivo, setEditMotivo] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  // Estados para la Calculadora rápida
  const [montoCalcDolar, setMontoCalcDolar] = useState<string>('25');
  const [montoCalcCordoba, setMontoCalcCordoba] = useState<string>('923.75');

  if (!isOpen) return null;

  const mostrarNotif = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const iniciarEdicion = (b: BancoTipoCambio) => {
    setBancoEditando(b);
    setEditCompra(b.tasaCompra.toFixed(4));
    setEditVenta(b.tasaVenta.toFixed(4));
    setEditMotivo('Ajuste de tasa de cambio del día');
  };

  const guardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bancoEditando) return;

    const nuevaCompra = parseFloat(editCompra);
    const nuevaVenta = parseFloat(editVenta);

    if (isNaN(nuevaCompra) || nuevaCompra <= 0 || isNaN(nuevaVenta) || nuevaVenta <= 0) {
      mostrarNotif('Por favor ingrese valores numéricos válidos mayores a cero.');
      return;
    }

    const tasaActivaCalculada = bancoEditando.tipoTasaAplicada === 'compra' 
      ? nuevaCompra 
      : nuevaVenta;

    const bancoActualizado: BancoTipoCambio = {
      ...bancoEditando,
      tasaCompra: nuevaCompra,
      tasaVenta: nuevaVenta,
      tasaActiva: tasaActivaCalculada,
      ultimaActualizacion: new Date().toLocaleDateString('es-NI', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    onActualizarBanco(bancoActualizado, editMotivo.trim() || 'Actualización manual de tasas');
    setBancoEditando(null);
    mostrarNotif(`¡Tasas de ${bancoEditando.nombre} actualizadas con éxito!`);
  };

  // Manejo de calculadora
  const handleCambioDolar = (val: string) => {
    setMontoCalcDolar(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setMontoCalcCordoba((num * configMoneda.tasaActual).toFixed(2));
    } else {
      setMontoCalcCordoba('');
    }
  };

  const handleCambioCordoba = (val: string) => {
    setMontoCalcCordoba(val);
    const num = parseFloat(val);
    if (!isNaN(num) && configMoneda.tasaActual > 0) {
      setMontoCalcDolar((num / configMoneda.tasaActual).toFixed(2));
    } else {
      setMontoCalcDolar('');
    }
  };

  const bancoActivo = bancos.find(b => b.id === configMoneda.bancoActivoId) || bancos[0];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shadow-inner">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Tipo de Cambio Bancario & Comercial
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Nicaragua (NIO / USD)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Seleccione la tasa bancaria o comercial que regirá los precios y facturación en el sistema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación Toast Interna */}
        {toast && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-xs shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {/* Barra de Tasa Activa Global */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasa Activa en Sistema:</span>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono font-black text-sm text-slate-900">
                1 USD = {formatearCordobas(configMoneda.tasaActual)}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {bancoActivo?.siglas || configMoneda.bancoNombre} ({configMoneda.tipoTasa.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Selector de Moneda Principal Visual */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Moneda principal:</span>
            <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center text-xs font-bold border border-slate-300">
              <button
                type="button"
                onClick={() => onCambiarMonedaPrincipal('COR')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  configMoneda.monedaPrincipal === 'COR'
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Córdobas (C$)
              </button>
              <button
                type="button"
                onClick={() => onCambiarMonedaPrincipal('USD')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  configMoneda.monedaPrincipal === 'USD'
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dólares ($)
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 shrink-0">
          <button
            type="button"
            onClick={() => setTabActiva('bancos')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              tabActiva === 'bancos'
                ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Seleccionar Banco & Tasa Comercial</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('historial')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              tabActiva === 'historial'
                ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Últimas Actualizaciones</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-extrabold">
              {historial.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('calculadora')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              tabActiva === 'calculadora'
                ? 'border-blue-600 text-blue-700 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora Rápida C$ ⮂ $</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">

          {/* ========================================================= */}
          {/* TAB 1: GRILLA DE BANCOS Y TASA COMERCIAL */}
          {/* ========================================================= */}
          {tabActiva === 'bancos' && (
            <div className="space-y-4">
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 sm:p-4 text-xs text-blue-900 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    Control Multidivisa en Córdobas (C$) y Dólares ($)
                  </span>
                  <p className="text-blue-800 leading-relaxed text-[11px]">
                    Puedes elegir la tasa de cualquier banco oficial de Nicaragua (Banpro, BAC, LAFISE, BDF, Avanz, BCN) o la <strong>Tasa Comercial</strong> personalizada de tu negocio. Al hacer clic en <em>"Seleccionar esta Tasa"</em>, todo el inventario, catálogo, punto de venta y facturación se ajustará automáticamente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {bancos.map(b => {
                  const esActivo = configMoneda.bancoActivoId === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`relative bg-white rounded-2xl border transition-all p-4 shadow-xs flex flex-col justify-between ${
                        esActivo
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-gradient-to-b from-blue-50/30 to-white'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Badge Activo */}
                      {esActivo && (
                        <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Activo en Sistema</span>
                        </div>
                      )}

                      <div>
                        {/* Cabecera del Banco */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${b.color} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                              {b.siglas.slice(0, 3)}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                                {b.nombre}
                              </h3>
                              <span className="text-[10px] text-slate-500">
                                {b.esComercial ? 'Tasa Libre Comercial' : 'Mesa de Cambio Bancaria'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tasas Compra y Venta */}
                        <div className="grid grid-cols-2 gap-2 my-3">
                          {/* Tasa Compra */}
                          <div className={`p-2.5 rounded-xl border text-center ${
                            esActivo && configMoneda.tipoTasa === 'compra'
                              ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">
                              Compra
                            </span>
                            <span className="font-mono font-extrabold text-sm text-slate-900 block mt-0.5">
                              C$ {b.tasaCompra.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onSeleccionarBancoActivo(b.id, 'compra')}
                              className="mt-1 text-[9px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              Aplicar Compra
                            </button>
                          </div>

                          {/* Tasa Venta */}
                          <div className={`p-2.5 rounded-xl border text-center ${
                            esActivo && (configMoneda.tipoTasa === 'venta' || configMoneda.tipoTasa === 'personalizada' || configMoneda.tipoTasa === 'oficial')
                              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                              Venta (Recomendada)
                            </span>
                            <span className="font-mono font-black text-sm text-emerald-800 block mt-0.5">
                              C$ {b.tasaVenta.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onSeleccionarBancoActivo(b.id, b.esComercial ? 'personalizada' : 'venta')}
                              className="mt-1 text-[9px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                            >
                              Aplicar Venta
                            </button>
                          </div>
                        </div>

                        {/* Meta: Última Actualización */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 pb-3">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Actualizado: {b.ultimaActualizacion}</span>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(b)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition cursor-pointer"
                          title="Editar tasas de este banco"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSeleccionarBancoActivo(b.id, b.esComercial ? 'personalizada' : 'venta')}
                          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            esActivo
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{esActivo ? 'Tasa Seleccionada' : 'Seleccionar esta Tasa'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HISTORIAL DE ÚLTIMAS ACTUALIZACIONES */}
          {/* ========================================================= */}
          {tabActiva === 'historial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Registro de Actualizaciones de Tipo de Cambio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Historial cronológico de cambios de tasa realizados por los usuarios o bancos
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const bancoDefault = bancos[0];
                    iniciarEdicion(bancoDefault);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Actualización</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {historial.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No hay actualizaciones registradas aún.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {historial.map((reg) => (
                      <div key={reg.id} className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-900">
                                {reg.bancoNombre}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {reg.tipoTasa}
                              </span>
                            </div>
                            {reg.motivo && (
                              <p className="text-slate-600 text-[11px] mt-0.5">
                                {reg.motivo}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reg.fecha}
                              </span>
                              <span>• Por: <strong>{reg.usuario}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Comparación de Tasa */}
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block uppercase">Anterior</span>
                            <span className="font-mono text-slate-500 font-semibold line-through">
                              C$ {reg.tasaAnterior.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-slate-400">➔</span>
                          <div className="text-left">
                            <span className="text-[9px] text-emerald-600 font-bold block uppercase">Nueva Tasa</span>
                            <span className="font-mono font-black text-emerald-700 text-sm">
                              C$ {reg.tasaNueva.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CALCULADORA RÁPIDA CÓRDOBAS <-> DÓLARES */}
          {/* ========================================================= */}
          {tabActiva === 'calculadora' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="text-center pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Conversor Rápido de Divisas en Mostrador
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calcula equivalencias exactas utilizando la tasa activa ({bancoActivo?.siglas}: C$ {configMoneda.tasaActual.toFixed(2)})
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Entrada Dólares */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Monto en Dólares ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={montoCalcDolar}
                        onChange={e => handleCambioDolar(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono font-black text-base text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Entrada Córdobas */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Equivalente en Córdobas (C$ NIO)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">C$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={montoCalcCordoba}
                        onChange={e => handleCambioCordoba(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 font-mono font-black text-base text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Accesos rápidos de prueba */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-2">Montos habituales de billetes en dólares:</span>
                  <div className="flex flex-wrap gap-2">
                    {[5, 10, 20, 50, 100].map(billete => (
                      <button
                        key={billete}
                        type="button"
                        onClick={() => handleCambioDolar(String(billete))}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer border border-slate-200"
                      >
                        ${billete} = {formatearCordobas(billete * configMoneda.tasaActual)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Secundario: Edición de Tasas de un Banco */}
        {bancoEditando && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <h4 className="font-extrabold text-sm">
                    Modificar Tasas: {bancoEditando.nombre}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setBancoEditando(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={guardarEdicion} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tasa Compra (C$)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={editCompra}
                      onChange={e => setEditCompra(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">
                      Tasa Venta (C$)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={editVenta}
                      onChange={e => setEditVenta(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/30 font-mono font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Motivo o Referencia del Cambio
                  </label>
                  <input
                    type="text"
                    value={editMotivo}
                    onChange={e => setEditMotivo(e.target.value)}
                    placeholder="Ej: Publicación BCN matutina, ajuste de mercado..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBancoEditando(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar y Registrar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-500">
            Última actualización global: <strong>{configMoneda.ultimaActualizacion}</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
          >
            Aceptar y Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
