import { Producto, Cliente, Proveedor, VentaRegistro, Credito, MovimientoCaja } from '../types';

export const PRODUCTOS_INICIALES: Producto[] = [
  {
    codigo: 'PER-001',
    producto: 'Good Girl Eau de Parfum 80ml',
    categoria: 'Perfumes',
    marca: 'Carolina Herrera',
    existencia: 12,
    precioCompra: 48.00,
    precioVenta: 75.00,
    imagen: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'PER-002',
    producto: 'Sauvage Christian Dior 100ml',
    categoria: 'Perfumes',
    marca: 'Dior',
    existencia: 10,
    precioCompra: 55.00,
    precioVenta: 85.00,
    imagen: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'PER-003',
    producto: '212 VIP Rosé Carolina Herrera 80ml',
    categoria: 'Perfumes',
    marca: 'Carolina Herrera',
    existencia: 8,
    precioCompra: 45.00,
    precioVenta: 70.00,
    imagen: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'PER-004',
    producto: 'Chanel N°5 Eau de Parfum 100ml',
    categoria: 'Perfumes',
    marca: 'Chanel',
    existencia: 6,
    precioCompra: 65.00,
    precioVenta: 98.00,
    imagen: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'PER-005',
    producto: '1 Million Gold Paco Rabanne 100ml',
    categoria: 'Perfumes',
    marca: 'Paco Rabanne',
    existencia: 14,
    precioCompra: 50.00,
    precioVenta: 78.00,
    imagen: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'PER-006',
    producto: 'Bad Boy Eau de Toilette 100ml',
    categoria: 'Perfumes',
    marca: 'Carolina Herrera',
    existencia: 9,
    precioCompra: 52.00,
    precioVenta: 80.00,
    imagen: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'PER-007',
    producto: 'Invictus Paco Rabanne 100ml',
    categoria: 'Perfumes',
    marca: 'Paco Rabanne',
    existencia: 11,
    precioCompra: 48.00,
    precioVenta: 72.00,
    imagen: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'PER-008',
    producto: 'Bright Crystal Versace 90ml',
    categoria: 'Perfumes',
    marca: 'Versace',
    existencia: 15,
    precioCompra: 42.00,
    precioVenta: 65.00,
    imagen: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=500&q=80',
    sinImagen: false
  },
  {
    codigo: 'CRM-001',
    producto: 'Crema Corporal Pure Seduction 236ml',
    categoria: 'Cremas',
    marca: "Victoria's Secret",
    existencia: 25,
    precioCompra: 8.50,
    precioVenta: 15.00,
    imagen: '',
    sinImagen: true
  },
  {
    codigo: 'CRM-002',
    producto: 'Crema Warm Vanilla Sugar 236ml',
    categoria: 'Cremas',
    marca: 'Bath & Body Works',
    existencia: 20,
    precioCompra: 7.50,
    precioVenta: 14.00,
    imagen: '',
    sinImagen: true
  },
  {
    codigo: 'BOL-001',
    producto: 'Bolso Elegante Guess Dama',
    categoria: 'Bolsos',
    marca: 'Guess',
    existencia: 8,
    precioCompra: 25.00,
    precioVenta: 45.00,
    imagen: '',
    sinImagen: true
  },
  {
    codigo: 'CRT-001',
    producto: 'Cartera de Mano Michael Kors',
    categoria: 'Carteras',
    marca: 'Michael Kors',
    existencia: 7,
    precioCompra: 30.00,
    precioVenta: 55.00,
    imagen: '',
    sinImagen: true
  },
  {
    codigo: 'TOA-001',
    producto: 'Toallas Húmedas Cuidado Puro 80 unds',
    categoria: 'Toallas Húmedas',
    marca: 'Huggies',
    existencia: 40,
    precioCompra: 2.50,
    precioVenta: 4.50,
    imagen: '',
    sinImagen: true
  },
  {
    codigo: 'CAL-001',
    producto: 'Calzado Deportivo Casual Unisex',
    categoria: 'Calzado',
    marca: 'Variedades CS',
    existencia: 12,
    precioCompra: 28.00,
    precioVenta: 50.00,
    imagen: '',
    sinImagen: true
  },
  {
    codigo: 'ROP-001',
    producto: 'Blusa Casual de Moda Dama',
    categoria: 'Ropa',
    marca: 'Variedades CS',
    existencia: 18,
    precioCompra: 9.00,
    precioVenta: 18.00,
    imagen: '',
    sinImagen: true
  }
];

export const CLIENTES_INICIALES: Cliente[] = [
  {
    id: 'CLI-0001',
    nombre: 'Consumidor Final',
    telefono: '8888-8888',
    direccion: 'Mostrador / Tienda Principal',
    observaciones: 'Cliente general de mostrador'
  },
  {
    id: 'CLI-0002',
    nombre: 'Uriel Castillo (Cliente Frecuente)',
    telefono: '8999-1234',
    direccion: 'Managua, Nicaragua',
    observaciones: 'Cliente preferencial de perfumería'
  }
];

export const PROVEEDORES_INICIALES: Proveedor[] = [
  {
    id: 'PRV-0001',
    nombre: 'Distribuidora Internacional de Perfumes S.A.',
    telefono: '2270-1122',
    direccion: 'Zona Franca / Managua',
    observaciones: 'Proveedor de fragancias originales y selladas'
  },
  {
    id: 'PRV-0002',
    nombre: 'Importaciones y Cosméticos CS',
    telefono: '2255-4433',
    direccion: 'Managua, Nicaragua',
    observaciones: 'Proveedor de cremas, bolsos y artículos de cuidado'
  }
];

export const VENTAS_INICIALES: VentaRegistro[] = [];

export const CREDITOS_INICIALES: Credito[] = [];

export const CAJA_INICIAL: MovimientoCaja[] = [
  {
    id: 'CJ-00001',
    fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
    tipo: 'Apertura',
    concepto: 'Apertura de Caja Inicial (Fondo de cambio)',
    monto: 100.00,
    usuario: 'ADMINISTRADOR',
    saldo: 100.00
  }
];
