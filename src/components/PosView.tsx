import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Receipt,
  UserCheck,
  User,
  Coins,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Package,
  ImageOff,
  Image as ImageIcon,
  ArrowRightLeft
} from 'lucide-react';
import { Producto, ItemCarrito, Cliente, ConfiguracionMoneda } from '../types';
import { obtenerImagenSugerida } from '../utils/perfumeBrands';
import { formatearCordobas, formatearDolares } from '../utils/exchangeRates';

interface PosProps {
  productos: Producto[];
  clientes: Cliente[];
  carrito: ItemCarrito[];
  setCarrito: React.Dispatch<React.SetStateAction<ItemCarrito[]>>;
  modoSinImagenes?: boolean;
  onToggleModoSinImagenes?: () => void;
  configMoneda?: ConfiguracionMoneda;
  onAbrirTipoCambio?: () => void;
  onFinalizarVenta: (datosVenta: {
    items: ItemCarrito[];
    formaPago: string;
    descuento: number;
    idCliente?: string;
    nombreCliente?: string;
    efectivoRecibido?: number;
    cambio?: number;
    fechaVencimiento?: string;
    tasaCambio?: number;
    bancoTipoCambio?: string;
    monedaCobro?: 'USD' | 'COR';
    totalCordobas?: number;
  }) => { success: boolean; mensaje: string; numeroVenta?: string };
}

export const PosView: React.FC<PosProps> = ({
  productos,
  clientes,
  carrito,
  setCarrito,
  modoSinImagenes = false,
  onToggleModoSinImagenes,
  configMoneda,
  onAbrirTipoCambio,
  onFinalizarVenta
}) => {
  const tasa = configMoneda?.tasaActual || 36.95;
  const bancoNombre = configMoneda?.bancoNombre || 'Banpro';

  const [busqueda, setBusqueda] = useState('');
  const [formaPago, setFormaPago] = useState('Efectivo');
  const [monedaPago, setMonedaPago] = useState<'COR' | 'USD'>('COR');
  const [descuento, setDescuento] = useState(0);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [efectivoEntregado, setEfectivoEntregado] = useState<string>('');
  const [pestanaMovil, setPestanaMovil] = useState<'catalogo' | 'carrito'>('catalogo');
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [alerta, setAlerta] = useState<{ tipo: 'error' | 'success'; mensaje: string } | null>(null);

  // Filtro de productos
  const productosFiltrados = productos.filter(p => 
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar al carrito
  const agregarAlCarrito = (prod: Producto) => {
    setAlerta(null);
    if (prod.existencia <= 0) {
      setAlerta({ tipo: 'error', mensaje: `El producto "${prod.producto}" está AGOTADO.` });
      return;
    }

    const itemExistente = carrito.find(item => item.codigo === prod.codigo);
    if (itemExistente) {
      if (itemExistente.cantidad + 1 > prod.existencia) {
        setAlerta({ 
          tipo: 'error', 
          mensaje: `Existencia insuficiente para "${prod.producto}". Stock disponible: ${prod.existencia}` 
        });
        return;
      }
      setCarrito(carrito.map(item => 
        item.codigo === prod.codigo
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      const sinFoto = modoSinImagenes || prod.sinImagen || !prod.imagen;
      setCarrito([...carrito, {
        codigo: prod.codigo,
        producto: prod.producto,
        precioUnitario: prod.precioVenta,
        cantidad: 1,
        categoria: prod.categoria,
        marca: prod.marca,
        imagen: sinFoto ? '' : prod.imagen,
        sinImagen: sinFoto,
        maxStock: prod.existencia
      }]);
    }
  };

  // Modificar cantidad en carrito
  const modificarCantidad = (codigo: string, nuevaCantidad: number) => {
    setAlerta(null);
    const prod = productos.find(p => p.codigo === codigo);
    if (!prod) return;

    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(codigo);
      return;
    }

    if (nuevaCantidad > prod.existencia) {
      setAlerta({ 
        tipo: 'error', 
        mensaje: `Solo hay ${prod.existencia} unidades disponibles de "${prod.producto}".` 
      });
      return;
    }

    setCarrito(carrito.map(item => 
      item.codigo === codigo 
        ? { ...item, cantidad: nuevaCantidad } 
        : item
    ));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (codigo: string) => {
    setCarrito(carrito.filter(item => item.codigo !== codigo));
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarrito([]);
    setDescuento(0);
    setClienteSeleccionado('');
    setEfectivoEntregado('');
  };

  // Totales
  const subtotal = carrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  const totalFinal = Math.max(0, subtotal - descuento);
  const totalFinalCordobas = totalFinal * tasa;
  const totalPrendas = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // Cambio
  const montoEntregadoNum = Number(efectivoEntregado) || 0;
  let montoEntregadoUSD = montoEntregadoNum;
  let montoEntregadoCOR = montoEntregadoNum;
  let cambioUSD = 0;
  let cambioCOR = 0;

  if (monedaPago === 'COR') {
    montoEntregadoCOR = montoEntregadoNum;
    montoEntregadoUSD = tasa > 0 ? montoEntregadoNum / tasa : 0;
    if (montoEntregadoCOR >= totalFinalCordobas) {
      cambioCOR = montoEntregadoCOR - totalFinalCordobas;
      cambioUSD = tasa > 0 ? cambioCOR / tasa : 0;
    }
  } else {
    montoEntregadoUSD = montoEntregadoNum;
    montoEntregadoCOR = montoEntregadoNum * tasa;
    if (montoEntregadoUSD >= totalFinal) {
      cambioUSD = montoEntregadoUSD - totalFinal;
      cambioCOR = cambioUSD * tasa;
    }
  }

  // Procesar Cobro
  const procesarCobro = () => {
    setAlerta(null);

    if (carrito.length === 0) {
      setAlerta({ tipo: 'error', mensaje: 'El carrito está vacío.' });
      return;
    }

    // Validar crédito
    if (formaPago === 'Crédito' && !clienteSeleccionado) {
      setAlerta({ 
        tipo: 'error', 
        mensaje: 'Debe seleccionar un cliente registrado para realizar una venta a Crédito.' 
      });
      return;
    }

    // Validar efectivo
    if (formaPago === 'Efectivo' && efectivoEntregado !== '') {
      if (monedaPago === 'COR' && montoEntregadoCOR < totalFinalCordobas) {
        setAlerta({ 
          tipo: 'error', 
          mensaje: `El efectivo recibido en Córdobas (C$ ${montoEntregadoCOR.toFixed(2)}) es menor al total a pagar (C$ ${totalFinalCordobas.toFixed(2)}).` 
        });
        return;
      }
      if (monedaPago === 'USD' && montoEntregadoUSD < totalFinal) {
        setAlerta({ 
          tipo: 'error', 
          mensaje: `El efectivo recibido en Dólares ($${montoEntregadoUSD.toFixed(2)}) es menor al total a pagar ($${totalFinal.toFixed(2)}).` 
        });
        return;
      }
    }

    const clienteObj = clientes.find(c => c.id === clienteSeleccionado);

    const resultado = onFinalizarVenta({
      items: carrito,
      formaPago,
      descuento,
      idCliente: clienteSeleccionado || undefined,
      nombreCliente: clienteObj ? clienteObj.nombre : (clienteSeleccionado ? clienteSeleccionado : 'Consumidor Final'),
      efectivoRecibido: formaPago === 'Efectivo' && montoEntregadoUSD > 0 ? montoEntregadoUSD : totalFinal,
      cambio: formaPago === 'Efectivo' ? cambioUSD : 0,
      fechaVencimiento: formaPago === 'Crédito' ? fechaVencimiento : undefined,
      tasaCambio: tasa,
      bancoTipoCambio: bancoNombre,
      monedaCobro: monedaPago,
      totalCordobas: totalFinalCordobas
    });

    if (resultado.success) {
      setAlerta({ tipo: 'success', mensaje: resultado.mensaje });
      vaciarCarrito();
      setPestanaMovil('catalogo');
    } else {
      setAlerta({ tipo: 'error', mensaje: resultado.mensaje });
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      
      {/* Selector de Pestañas Móvil: Catálogo vs Carrito */}
      <div className="lg:hidden flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setPestanaMovil('catalogo')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            pestanaMovil === 'catalogo'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catálogo ({productosFiltrados.length})</span>
        </button>

        <button
          onClick={() => setPestanaMovil('carrito')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition relative ${
            pestanaMovil === 'carrito'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Carrito</span>
          {carrito.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              pestanaMovil === 'carrito' ? 'bg-white text-blue-700' : 'bg-amber-500 text-slate-950'
            }`}>
              {totalPrendas} • ${totalFinal.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {/* Grid Principal Adaptado: En desktop es 2 columnas lado a lado; en móvil se muestra según pestaña activa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================== */}
        {/* 1. CATÁLOGO DE PRODUCTOS (Visible en desktop o si pestaña es catalogo) */}
        {/* ======================================================== */}
        <div className={`space-y-4 ${
          pestanaMovil === 'catalogo' ? 'block' : 'hidden lg:block'
        } lg:col-span-7`}>
          
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="pos-search-input"
                placeholder="Buscar perfume, crema, bolso, toallas, calzado, ropa, cartera o código..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
            {onToggleModoSinImagenes && (
              <button
                type="button"
                onClick={onToggleModoSinImagenes}
                title={modoSinImagenes ? "Modo sin fotos activo (Clic para ver fotos)" : "Fotos activas (Clic para ocultar/quitar fotos)"}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                  modoSinImagenes 
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {modoSinImagenes ? (
                  <>
                    <ImageOff className="w-4 h-4 text-amber-600" />
                    <span className="hidden sm:inline">Sin Fotos</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Con Fotos</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Banner Informativo de Tasa de Cambio Activa */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-200/80 flex items-center justify-center text-amber-800 shrink-0 font-bold">
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-amber-950 block sm:inline mr-1.5">
                  Tasa Activa: 1 USD = C$ {tasa.toFixed(2)}
                </span>
                <span className="text-[11px] text-amber-800 font-medium">
                  ({bancoNombre}) • Precios calculados en C$ y $
                </span>
              </div>
            </div>

            {onAbrirTipoCambio && (
              <button
                type="button"
                onClick={onAbrirTipoCambio}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] border border-amber-300 transition cursor-pointer shrink-0"
              >
                Cambiar Banco / T/C
              </button>
            )}
          </div>

          {/* Mensaje de alerta */}
          {alerta && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
              alerta.tipo === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {alerta.tipo === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{alerta.mensaje}</span>
            </div>
          )}

          {/* Cuadrícula de Tarjetas de Productos (Adaptada a teléfono y PC) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {productosFiltrados.map(prod => {
              const esAgotado = prod.existencia <= 0;
              const enCarrito = carrito.find(c => c.codigo === prod.codigo);
              const sinFoto = modoSinImagenes || prod.sinImagen || !prod.imagen;

              return (
                <div
                  key={prod.codigo}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between relative select-none ${
                    esAgotado
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : enCarrito 
                        ? 'bg-blue-50/40 border-blue-300 shadow-2xs' 
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs active:scale-[0.98]'
                  }`}
                  onClick={() => !esAgotado && agregarAlCarrito(prod)}
                >
                  {/* Badge de cantidad en carrito si ya fue agregado */}
                  {enCarrito && (
                    <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                      {enCarrito.cantidad}
                    </div>
                  )}

                  {/* Imagen del perfume / producto o encabezado en modo sin foto */}
                  {sinFoto ? (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono truncate">
                        {prod.codigo}
                      </span>
                      {prod.marca ? (
                        <span className="bg-pink-100 text-pink-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-[110px]">
                          {prod.marca}
                        </span>
                      ) : (
                        <Package className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-24 mb-2 rounded-xl overflow-hidden bg-pink-50/40 border border-slate-100 flex items-center justify-center relative">
                      <img 
                        src={prod.imagen} 
                        alt={prod.producto}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {prod.marca && (
                        <span className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          {prod.marca}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    {!sinFoto && (
                      <div className="flex items-center gap-1 mb-1 pr-6">
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono truncate">
                          {prod.codigo}
                        </span>
                      </div>
                    )}
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug">
                      {prod.producto}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{prod.categoria}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {/* Precio dual en Córdobas y Dólares */}
                      <span className="text-xs sm:text-sm font-black text-blue-700 block leading-tight">
                        C$ {(prod.precioVenta * tasa).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        ${prod.precioVenta.toFixed(2)} USD
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        Stock: {prod.existencia}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={esAgotado}
                      className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition shadow-2xs ${
                        esAgotado 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No se encontraron productos con el filtro "{busqueda}".
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. CARRITO Y COBRO (Visible en desktop o si pestaña es carrito) */}
        {/* ======================================================== */}
        <div className={`space-y-4 ${
          pestanaMovil === 'carrito' ? 'block' : 'hidden lg:block'
        } lg:col-span-5`}>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
            
            {/* Encabezado del Carrito */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {/* Botón volver a catálogo en teléfono */}
                <button
                  onClick={() => setPestanaMovil('catalogo')}
                  className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg"
                  title="Volver a ver productos"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Receipt className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Carrito ({totalPrendas} productos)
                </h3>
              </div>
              {carrito.length > 0 && (
                <button
                  onClick={vaciarCarrito}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Lista de items en el carrito */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {carrito.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                  <p className="font-medium">El carrito está vacío.</p>
                  <button
                    onClick={() => setPestanaMovil('catalogo')}
                    className="lg:hidden px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs"
                  >
                    Seleccionar productos del catálogo
                  </button>
                </div>
              ) : (
                carrito.map(it => (
                  <div key={it.codigo} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2.5">
                    {/* Miniatura del producto en carrito */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                      {!modoSinImagenes && !it.sinImagen && it.imagen ? (
                        <img 
                          src={it.imagen} 
                          alt={it.producto}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="font-extrabold text-xs text-slate-900 truncate">{it.producto}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {it.codigo} · ${it.precioUnitario.toFixed(2)} c/u
                      </p>
                    </div>

                    {/* Controles táctiles de cantidad para dedos */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => modificarCantidad(it.codigo, it.cantidad - 1)}
                        className="w-7 h-7 rounded-md text-slate-700 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-black text-xs text-slate-900">
                        {it.cantidad}
                      </span>
                      <button
                        onClick={() => modificarCantidad(it.codigo, it.cantidad + 1)}
                        className="w-7 h-7 rounded-md text-slate-700 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-black text-xs text-blue-700 block leading-tight">
                        C$ {(it.cantidad * it.precioUnitario * tasa).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        ${(it.cantidad * it.precioUnitario).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => eliminarDelCarrito(it.codigo)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Resumen numérico con Precios en Córdobas y Dólares */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalPrendas} productos)</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800">C$ {(subtotal * tasa).toFixed(2)}</span>
                  <span className="text-[11px] text-slate-400 ml-1.5 font-medium">(${subtotal.toFixed(2)})</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Descuento ($)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ≈ C$ {(descuento * tasa).toFixed(2)}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={descuento}
                    onChange={e => setDescuento(Math.max(0, Number(e.target.value) || 0))}
                    className="w-20 text-right px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-blue-950 text-xs uppercase tracking-wide">
                    TOTAL A PAGAR (C$)
                  </span>
                  <span className="font-black text-blue-700 text-xl font-mono">
                    C$ {totalFinalCordobas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-blue-800 border-t border-blue-100 pt-1">
                  <span className="font-semibold text-[11px]">Equivalente en Dólares ($):</span>
                  <span className="font-extrabold text-slate-800 font-mono">${totalFinal.toFixed(2)} USD</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-0.5 flex justify-between">
                  <span>T/C aplicado: 1$ = C$ {tasa.toFixed(2)}</span>
                  <span className="font-medium text-slate-600">{bancoNombre}</span>
                </div>
              </div>
            </div>

            {/* Cliente y Forma de pago */}
            <div className="pt-2 space-y-3">
              {/* Selector de Cliente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cliente {formaPago === 'Crédito' ? '*' : '(Opcional)'}</span>
                  </label>
                  {clienteSeleccionado && (
                    <button
                      type="button"
                      onClick={() => setClienteSeleccionado('')}
                      className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      Consumidor Final
                    </button>
                  )}
                </div>
                <select
                  value={clienteSeleccionado}
                  onChange={e => setClienteSeleccionado(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Consumidor Final / Venta Rápida</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.id}) {c.telefono ? `- Tel: ${c.telefono}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones de Selección de Forma de Pago */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  Forma de Pago
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito'].map(fp => (
                    <button
                      key={fp}
                      type="button"
                      onClick={() => setFormaPago(fp)}
                      className={`py-2.5 px-3 rounded-xl border font-bold transition text-center cursor-pointer ${
                        formaPago === fp
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {fp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opciones cuando es Efectivo: Cobro en Córdobas o Dólares */}
              {formaPago === 'Efectivo' && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Efectivo Recibido en:</span>
                    </span>

                    {/* Conmutador de Moneda de Cobro: Córdobas vs Dólares */}
                    <div className="flex bg-white rounded-lg p-0.5 border border-emerald-300">
                      <button
                        type="button"
                        onClick={() => {
                          setMonedaPago('COR');
                          setEfectivoEntregado(totalFinalCordobas.toFixed(2));
                        }}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                          monedaPago === 'COR' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Córdobas (C$)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMonedaPago('USD');
                          setEfectivoEntregado(totalFinal.toFixed(2));
                        }}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                          monedaPago === 'USD' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Dólares ($)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-700">
                          Recibido ({monedaPago === 'COR' ? 'C$' : '$'})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEfectivoEntregado(
                              monedaPago === 'COR' 
                                ? totalFinalCordobas.toFixed(2) 
                                : totalFinal.toFixed(2)
                            );
                          }}
                          className="text-[9px] font-black text-emerald-700 hover:underline cursor-pointer"
                        >
                          Exacto
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step={monedaPago === 'COR' ? '10' : '1'}
                        placeholder={monedaPago === 'COR' ? `C$ ${totalFinalCordobas.toFixed(2)}` : `$${totalFinal.toFixed(2)}`}
                        value={efectivoEntregado}
                        onChange={e => setEfectivoEntregado(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Cambio / Vuelto
                      </label>
                      <div className={`p-1.5 rounded-lg border text-center ${
                        (monedaPago === 'COR' ? montoEntregadoCOR >= totalFinalCordobas : montoEntregadoUSD >= totalFinal)
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        <span className="font-mono font-black text-sm block leading-tight">
                          C$ {cambioCOR.toFixed(2)}
                        </span>
                        <span className="font-mono font-semibold text-[10px] text-emerald-800 block">
                          (${cambioUSD.toFixed(2)} USD)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de denominaciones rápidas según la moneda seleccionada */}
                  <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto">
                    {monedaPago === 'COR' ? (
                      [500, 1000, 2000, 5000].map(den => (
                        <button
                          key={den}
                          type="button"
                          onClick={() => setEfectivoEntregado(den.toString())}
                          className="px-2 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-[10px] hover:bg-emerald-100 shrink-0 font-mono cursor-pointer"
                        >
                          C$ {den}
                        </button>
                      ))
                    ) : (
                      [10, 20, 50, 100].map(den => (
                        <button
                          key={den}
                          type="button"
                          onClick={() => setEfectivoEntregado(den.toString())}
                          className="px-2 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-[10px] hover:bg-emerald-100 shrink-0 font-mono cursor-pointer"
                        >
                          ${den}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Opciones cuando es crédito */}
              {formaPago === 'Crédito' && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-rose-950 font-black">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <CreditCard className="w-4 h-4 text-rose-600" />
                      <span>Venta a Crédito</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200/90 text-rose-900 text-[10px] font-black uppercase">
                      Por Cobrar
                    </span>
                  </div>

                  {/* MONTO A DEBER PROMINENTE */}
                  <div className="p-3 bg-white border border-rose-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                        Saldo Pendiente
                      </span>
                      <span className="text-xs font-black text-rose-900 uppercase">
                        CRÉDITO: MONTO A DEBER
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-rose-600 font-mono block leading-tight">
                        C$ {totalFinalCordobas.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 font-mono block">
                        (${totalFinal.toFixed(2)} USD)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Fecha Límite de Pago *
                    </label>
                    <input
                      type="date"
                      value={fechaVencimiento}
                      onChange={e => setFechaVencimiento(e.target.value)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  {!clienteSeleccionado && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5 bg-white p-2 rounded-lg border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Seleccione un cliente arriba para autorizar la deuda a crédito.</span>
                    </p>
                  )}
                </div>
              )}

              {/* Botón Cobrar */}
              <button
                id="btn-pos-cobrar"
                onClick={procesarCobro}
                disabled={carrito.length === 0}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  carrito.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : formaPago === 'Crédito'
                      ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99] shadow-rose-600/20'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {formaPago === 'Crédito'
                    ? `Confirmar Crédito (C$ ${totalFinalCordobas.toFixed(2)} / $${totalFinal.toFixed(2)})`
                    : `Confirmar y Cobrar (C$ ${totalFinalCordobas.toFixed(2)} / $${totalFinal.toFixed(2)})`}
                </span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. BARRA FLOTANTE DE ACCESO RÁPIDO AL CARRITO EN TELÉFONO */}
      {/* ======================================================== */}
      {pestanaMovil === 'catalogo' && carrito.length > 0 && (
        <div className="lg:hidden fixed bottom-18 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setPestanaMovil('carrito')}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-between border border-slate-700/80 hover:bg-slate-800 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-500 text-white font-black text-xs flex items-center justify-center">
                {totalPrendas}
              </div>
              <div className="text-left">
                <span className="text-xs font-black block leading-none">Ver Carrito</span>
                <span className="text-[10px] text-slate-300">
                  {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs font-black text-emerald-400 block leading-tight">
                  C$ {totalFinalCordobas.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold text-slate-300 block">
                  ${totalFinal.toFixed(2)}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
};
