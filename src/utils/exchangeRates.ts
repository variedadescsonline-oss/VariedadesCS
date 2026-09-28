import { BancoTipoCambio, HistorialTipoCambio, ConfiguracionMoneda } from '../types';

export const BANCOS_INICIALES: BancoTipoCambio[] = [
  {
    id: 'banpro',
    nombre: 'Banpro Grupo Promerica',
    siglas: 'Banpro',
    tasaCompra: 36.50,
    tasaVenta: 36.95,
    tasaActiva: 36.95,
    tipoTasaAplicada: 'venta',
    ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    color: 'from-emerald-600 to-teal-700',
    esComercial: false
  },
  {
    id: 'bac',
    nombre: 'BAC Credomatic Nicaragua',
    siglas: 'BAC',
    tasaCompra: 36.52,
    tasaVenta: 36.97,
    tasaActiva: 36.97,
    tipoTasaAplicada: 'venta',
    ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    color: 'from-red-600 to-rose-700',
    esComercial: false
  },
  {
    id: 'lafise',
    nombre: 'Banco LAFISE Bancentro',
    siglas: 'LAFISE',
    tasaCompra: 36.50,
    tasaVenta: 36.96,
    tasaActiva: 36.96,
    tipoTasaAplicada: 'venta',
    ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    color: 'from-green-600 to-emerald-800',
    esComercial: false
  },
  {
    id: 'bdf',
    nombre: 'Banco de Finanzas (BDF)',
    siglas: 'BDF',
    tasaCompra: 36.48,
    tasaVenta: 36.95,
    tasaActiva: 36.95,
    tipoTasaAplicada: 'venta',
    ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    color: 'from-blue-600 to-indigo-800',
    esComercial: false
  },
  {
    id: 'avanz',
    nombre: 'Banco Avanz Nicaragua',
    siglas: 'Avanz',
    tasaCompra: 36.51,
    tasaVenta: 36.98,
    tasaActiva: 36.98,
    tipoTasaAplicada: 'venta',
    ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    color: 'from-cyan-600 to-blue-700',
    esComercial: false
  },
  {
    id: 'bcn',
    nombre: 'Banco Central de Nicaragua (BCN)',
    siglas: 'BCN Oficial',
    tasaCompra: 36.6241,
    tasaVenta: 36.6241,
    tasaOficial: 36.6241,
    tasaActiva: 36.6241,
    tipoTasaAplicada: 'oficial',
    ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    color: 'from-amber-600 to-amber-800',
    esComercial: false
  },
  {
    id: 'comercial',
    nombre: 'Tasa Comercial / Paralelo Variedades CS',
    siglas: 'Comercial',
    tasaCompra: 36.80,
    tasaVenta: 37.00,
    tasaActiva: 37.00,
    tipoTasaAplicada: 'personalizada',
    ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    color: 'from-purple-600 to-pink-700',
    esComercial: true
  }
];

export const HISTORIAL_INICIAL: HistorialTipoCambio[] = [
  {
    id: 'tc-init-1',
    fecha: new Date(Date.now() - 3600000 * 2).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    bancoId: 'comercial',
    bancoNombre: 'Tasa Comercial Variedades CS',
    tipoTasa: 'Venta Comercial',
    tasaAnterior: 36.85,
    tasaNueva: 37.00,
    usuario: 'VARIEDADES CS ADMIN',
    motivo: 'Ajuste de tasa comercial para facturación y cobro en mostrador'
  },
  {
    id: 'tc-init-2',
    fecha: new Date(Date.now() - 3600000 * 6).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    bancoId: 'banpro',
    bancoNombre: 'Banpro Grupo Promerica',
    tipoTasa: 'Venta Banpro',
    tasaAnterior: 36.90,
    tasaNueva: 36.95,
    usuario: 'Sistema BCN / Bancos',
    motivo: 'Actualización diaria de mesa de cambio bancaria'
  },
  {
    id: 'tc-init-3',
    fecha: new Date(Date.now() - 3600000 * 12).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    bancoId: 'bac',
    bancoNombre: 'BAC Credomatic',
    tipoTasa: 'Venta BAC',
    tasaAnterior: 36.92,
    tasaNueva: 36.97,
    usuario: 'Sistema Bancario',
    motivo: 'Sincronización matutina'
  }
];

export const CONFIG_MONEDA_DEFECTO: ConfiguracionMoneda = {
  monedaPrincipal: 'COR',
  bancoActivoId: 'banpro',
  bancoNombre: 'Banpro Grupo Promerica',
  tipoTasa: 'venta',
  tasaActual: 36.95,
  ultimaActualizacion: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
};

// Conversiones
export function convertirDolarACordoba(montoUSD: number, tasa: number): number {
  if (!montoUSD || isNaN(montoUSD) || !tasa || isNaN(tasa)) return 0;
  return Number((montoUSD * tasa).toFixed(2));
}

export function convertirCordobaADolar(montoCordobas: number, tasa: number): number {
  if (!montoCordobas || isNaN(montoCordobas) || !tasa || tasa <= 0) return 0;
  return Number((montoCordobas / tasa).toFixed(2));
}

// Formateos
export function formatearCordobas(monto: number): string {
  const num = isNaN(monto) ? 0 : monto;
  return `C$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatearDolares(monto: number): string {
  const num = isNaN(monto) ? 0 : monto;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatearDual(montoUSD: number, tasa: number, monedaPrincipal: 'COR' | 'USD' = 'COR') {
  const cordobas = convertirDolarACordoba(montoUSD, tasa);
  if (monedaPrincipal === 'COR') {
    return {
      principal: formatearCordobas(cordobas),
      secundario: formatearDolares(montoUSD)
    };
  }
  return {
    principal: formatearDolares(montoUSD),
    secundario: formatearCordobas(cordobas)
  };
}
