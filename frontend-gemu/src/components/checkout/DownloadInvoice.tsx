"use client";

import { jsPDF } from "jspdf";

interface OrderData {
  id: string;
  numeroFactura: string;
  fecha: string;
  cliente: {
    nombre: string;
    email: string;
    direccion: string;
  };
  productos: {
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
  totalSinIVA: number;
  iva: number;
  total: number;
}

const DownloadInvoice = ({ orderData }: { orderData: OrderData }) => {
  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("GEMU", 20, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Factura #${orderData.numeroFactura}`, 20, 35);
    doc.text(
      `Fecha: ${new Date(orderData.fecha).toLocaleDateString("es-ES")}`,
      20,
      42
    );

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 50, pageWidth - 20, 50);

    // Datos del cliente
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del cliente", 20, 62);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(orderData.cliente.nombre, 20, 72);
    doc.text(orderData.cliente.email, 20, 79);
    doc.text(orderData.cliente.direccion, 20, 86);

    // Tabla de productos
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Productos", 20, 102);

    // Cabecera de tabla
    let y = 112;
    doc.setFillColor(51, 51, 51);
    doc.rect(20, y - 6, pageWidth - 40, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Producto", 22, y);
    doc.text("Cant.", 110, y);
    doc.text("Precio", 135, y);
    doc.text("Subtotal", 165, y);

    // Filas de productos
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 12;

    orderData.productos.forEach((producto) => {
      doc.text(producto.nombre.substring(0, 35), 22, y);
      doc.text(producto.cantidad.toString(), 115, y);
      doc.text(`${producto.precio.toFixed(2)}€`, 135, y);
      doc.text(`${producto.subtotal.toFixed(2)}€`, 165, y);
      y += 8;
    });

    // Línea separadora
    y += 5;
    doc.line(20, y, pageWidth - 20, y);

    // Totales
    y += 12;
    doc.setFontSize(11);
    doc.text("Subtotal (sin IVA):", 120, y);
    doc.text(`${orderData.totalSinIVA.toFixed(2)}€`, 170, y);

    y += 8;
    doc.text("IVA (21%):", 120, y);
    doc.text(`${orderData.iva.toFixed(2)}€`, 170, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TOTAL:", 120, y);
    doc.text(`${orderData.total.toFixed(2)}€`, 168, y);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Gracias por tu compra en GEMU - Tu tienda de videojuegos",
      pageWidth / 2,
      280,
      { align: "center" }
    );

    // Descargar
    doc.save(`factura-${orderData.numeroFactura}.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-6 py-3 bg-[#0072F5] text-white rounded-md hover:bg-[#0060d3] transition-all"
    >
      Descargar factura PDF
    </button>
  );
};

export default DownloadInvoice;
