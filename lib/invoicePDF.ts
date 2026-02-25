import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  invoiceNumber: string;
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date | null;
  status: string;
  
  // User info
  userName: string;
  userEmail: string;
  
  // Plan info
  planName: string;
  planPrice: number; // in cents
  
  // Payment info
  paymentMethod?: string;
  
  // Logo
  logoDataUrl?: string;
}

export function generateInvoicePDF(data: InvoiceData) {
  try {
    const doc = new jsPDF();
    
    // Colors (Capsule branding)
    const burgundy = [86, 28, 36]; // #561C24
    const burgundyLight = [109, 41, 50]; // #6D2932
    const cream = [232, 216, 196]; // #E8D8C4
    const creamLight = [249, 246, 242]; // #F9F6F2
    const darkText = [45, 45, 45];
    const lightGray = [150, 150, 150];
  
  // ========== HEADER SECTION ==========
  // Main header background (cream)
  doc.setFillColor(creamLight[0], creamLight[1], creamLight[2]);
  doc.rect(0, 0, 210, 55, 'F');
  
  // Top burgundy accent stripe
  doc.setFillColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.rect(0, 0, 210, 3, 'F');
  
  // Company Logo (if provided) - temporarily disabled for debugging
  // if (data.logoDataUrl) {
  //   try {
  //     doc.addImage(data.logoDataUrl, 'PNG', 20, 12, 20, 20);
  //   } catch (error) {
  //     console.error('Failed to add logo:', error);
  //   }
  // }
  
  // Company Name & Tagline (logo position)
  doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CAPSULE', 25, 23);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(burgundyLight[0], burgundyLight[1], burgundyLight[2]);
  doc.text('Platform E-Learning Farmasi', 25, 30);
  
  // Right side - Invoice Info Box
  const infoBoxX = 130;
  const infoBoxY = 10;
  const infoBoxWidth = 70;
  const infoBoxHeight = 35;
  
  // Invoice info box background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 2, 2, 'F');
  
  // Invoice info box border
  doc.setDrawColor(cream[0], cream[1], cream[2]);
  doc.setLineWidth(1);
  doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 2, 2, 'S');
  
  // "INVOICE" label
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', infoBoxX + 5, infoBoxY + 7);
  
  // Invoice number
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(data.invoiceNumber, infoBoxX + 5, infoBoxY + 14);
  
  // Status badge
  const statusColors: Record<string, number[]> = {
    paid: [34, 197, 94], // green
    unpaid: [239, 68, 68], // red
    pending: [251, 146, 60], // orange
  };
  
  const statusColor = statusColors[data.status.toLowerCase()] || [150, 150, 150];
  const statusText = data.status === 'paid' ? 'LUNAS' : data.status === 'unpaid' ? 'BELUM DIBAYAR' : 'PENDING';
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(infoBoxX + 5, infoBoxY + 20, infoBoxWidth - 10, 8, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, infoBoxX + infoBoxWidth / 2, infoBoxY + 25.5, { align: 'center' });
  
  // Bottom divider line
  doc.setDrawColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setLineWidth(0.5);
  doc.line(20, 53, 190, 53);
  
  // ========== INVOICE DETAILS SECTION ==========
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let y = 67;
  
  // Left column - Customer info
  doc.setFont('helvetica', 'bold');
  doc.text('DITAGIHKAN KEPADA:', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(data.userName, 20, y);
  y += 5;
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(data.userEmail, 20, y);
  
  // Right column - Invoice dates
  y = 67;
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TANGGAL:', 150, y);
  doc.setFont('helvetica', 'normal');
  y += 7;
  
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Dibuat:', 150, y);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(formatDate(data.createdAt), 175, y);
  y += 5;
  
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Jatuh Tempo:', 150, y);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(formatDate(data.dueDate), 175, y);
  
  if (data.paidAt) {
    y += 5;
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Dibayar:', 150, y);
    doc.setTextColor(34, 197, 94); // green
    doc.text(formatDate(data.paidAt), 175, y);
  }
  
  // Items table with modern styling
  y = 105;
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(cents / 100);
  };
  
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Deskripsi', 'Harga']],
    body: [
      [
        'Langganan Plan',
        `${data.planName} - E-Learning Farmasi`,
        formatCurrency(data.planPrice),
      ],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [creamLight[0], creamLight[1], creamLight[2]], // light cream
      textColor: [burgundy[0], burgundy[1], burgundy[2]], // burgundy
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 8,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 8,
      textColor: [45, 45, 45],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 90 },
      2: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Total section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(130, finalY, 190, finalY);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text('TOTAL:', 130, finalY + 8);
  doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setFontSize(14);
  doc.text(formatCurrency(data.planPrice), 190, finalY + 8, { align: 'right' });
  
  // Payment method
  if (data.paymentMethod) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`Metode Pembayaran: ${capitalizeFirst(data.paymentMethod)}`, 20, finalY + 8);
  }
  
  // ========== FOOTER SECTION ==========
  const footerY = 265;
  
  // Footer background
  doc.setFillColor(creamLight[0], creamLight[1], creamLight[2]);
  doc.rect(0, footerY, 210, 32, 'F');
  
  // Top border line
  doc.setDrawColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setLineWidth(0.5);
  doc.line(0, footerY, 210, footerY);
  
  // Bottom burgundy stripe
  doc.setFillColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.rect(0, 294, 210, 3, 'F');
  
  // Footer content - 3 columns layout
  const footerContentY = footerY + 10;
  
  // Left column - Company info
  doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CAPSULE', 20, footerContentY);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(burgundyLight[0], burgundyLight[1], burgundyLight[2]);
  doc.text('Platform E-Learning Farmasi', 20, footerContentY + 5);
  doc.text('Terdepan untuk Pendidikan Farmasi', 20, footerContentY + 9);
  
  // Center column - Thank you message
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text('Terima kasih atas kepercayaan Anda', 105, footerContentY + 2, { align: 'center' });
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setFontSize(7);
  doc.text('Invoice ini sah tanpa tanda tangan', 105, footerContentY + 7, { align: 'center' });
  
  // Right column - Copyright
  doc.setFontSize(7);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(`© ${new Date().getFullYear()} Capsule`, 190, footerContentY + 2, { align: 'right' });
  doc.text('All rights reserved', 190, footerContentY + 7, { align: 'right' });
  
    return doc;
  } catch (error) {
    console.error('Error in generateInvoicePDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function formatDate(date: Date): string {
  try {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
