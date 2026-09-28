export interface Producto {
  codigo: string;
  producto: string;
  categoria: string;
  existencia: number;
  precioCompra: number;
  precioVenta: number;
  marca?: string;
  imagen?: string;
  sinImagen?: boolean;
}

export interface ItemCarrito {
  codigo: string;
  producto: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  maxStock: number;
  marca?: string;
  imagen?: string;
  sinImagen?: boolean;
}

export interface VentaRegistro {
  numeroVenta: string;
  fecha: string;
  codigo: string;
  producto: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  formaPago: string;
  cliente?: string;
  idCliente?: string;
  efectivoRecibido?: number;
  cambio?: number;
  fechaVencimiento?: string;
  numCredito?: string;
  usuario: string;
  estado: 'COMPLETADA' | 'ANULADA';
  fechaAnulacion?: string;
  motivo?: string;
  tasaCambio?: number;
  bancoTipoCambio?: string;
  monedaCobro?: 'USD' | 'COR';
  totalCordobas?: number;
}

export interface CompraRegistro {
  numeroCompra: string;
  fecha: string;
  codigo: string;
  producto: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  precioCompra?: number;
  total: number;
  proveedor?: string;
  pagadoDesdeCaja?: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  observaciones: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  observaciones: string;
}

export interface Credito {
  numeroCredito: string;
  fecha: string;
  idCliente: string;
  cliente: string;
  numeroVenta: string;
  totalCredito: number;
  abonado: number;
  saldo: number;
  vencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'ANULADO';
}

export interface Abono {
  numeroAbono: string;
  fecha: string;
  numeroCredito: string;
  idCliente: string;
  cliente: string;
  montoAbonado: number;
  metodoPago: string;
  observaciones: string;
}

export interface CuentaPorCobrar {
  idCliente: string;
  cliente: string;
  totalCreditos: number;
  totalAbonado: number;
  saldoPendiente: number;
  creditosPendientes: number;
  estado: string;
}

export interface MovimientoCaja {
  id: string;
  fecha: string;
  tipo: string;
  concepto: string;
  monto: number;
  usuario: string;
  saldo: number;
}

export interface Usuario {
  usuario: string;
  pass: string;
  rol: string;
}

export interface BancoTipoCambio {
  id: string; // 'banpro' | 'bac' | 'lafise' | 'bdf' | 'avanz' | 'bcn' | 'comercial'
  nombre: string;
  siglas: string;
  tasaCompra: number;
  tasaVenta: number;
  tasaOficial?: number;
  tasaActiva: number; // La tasa efectiva que se usa para convertir cuando se selecciona
  tipoTasaAplicada: 'compra' | 'venta' | 'oficial' | 'personalizada';
  ultimaActualizacion: string;
  color: string;
  esComercial?: boolean;
}

export interface HistorialTipoCambio {
  id: string;
  fecha: string;
  bancoId: string;
  bancoNombre: string;
  tipoTasa: string;
  tasaAnterior: number;
  tasaNueva: number;
  usuario: string;
  motivo?: string;
}

export interface ConfiguracionMoneda {
  monedaPrincipal: 'COR' | 'USD';
  bancoActivoId: string;
  bancoNombre: string;
  tipoTasa: 'compra' | 'venta' | 'oficial' | 'comercial' | 'personalizada';
  tasaActual: number;
  ultimaActualizacion: string;
}

