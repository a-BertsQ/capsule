'use client';

import { useState, useEffect } from 'react';
import { generateInvoicePDF } from '@/lib/invoicePDF';

interface InvoiceButtonProps {
  invoice: {
    invoiceNumber: string;
    createdAt: Date;
    dueDate: Date;
    paidAt?: Date | null;
    status: string;
    amountCents: number;
  };
  plan: {
    name: string;
    priceCents: number;
  };
  user: {
    name: string;
    email: string;
  };
  paymentMethod: string;
}

export default function InvoiceDownloadButton({ invoice, plan, user, paymentMethod }: InvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');

  // Load logo on component mount
  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Try to load the logo image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Create canvas to convert to base64
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setLogoDataUrl(dataUrl);
            console.log('Logo loaded successfully');
          }
        };
        
        img.onerror = (error) => {
          console.error('Failed to load logo image:', error);
        };
        
        img.src = '/logo/logo capsule.png';
      } catch (error) {
        console.error('Failed to load logo:', error);
      }
    };
    
    loadLogo();
  }, []);

  const handleViewInvoice = async () => {
    setIsGenerating(true);
    try {
      console.log('Generating invoice with data:', {
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        userName: user.name,
        hasLogo: !!logoDataUrl,
      });
      
      const pdf = generateInvoicePDF({
        invoiceNumber: invoice.invoiceNumber,
        createdAt: new Date(invoice.createdAt),
        dueDate: new Date(invoice.dueDate),
        paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
        status: invoice.status,
        userName: user.name,
        userEmail: user.email,
        planName: plan.name,
        planPrice: plan.priceCents,
        paymentMethod,
        logoDataUrl: logoDataUrl || undefined,
      });
      
      console.log('PDF generated successfully');
      
      // Open in new tab
      const pdfOutput = pdf.output('blob');
      const url = URL.createObjectURL(pdfOutput);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert(`Gagal membuat invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsGenerating(true);
    try {
      const pdf = generateInvoicePDF({
        invoiceNumber: invoice.invoiceNumber,
        createdAt: new Date(invoice.createdAt),
        dueDate: new Date(invoice.dueDate),
        paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
        status: invoice.status,
        userName: user.name,
        userEmail: user.email,
        planName: plan.name,
        planPrice: plan.priceCents,
        paymentMethod,
        logoDataUrl: logoDataUrl || undefined,
      });
      
      // Download directly
      pdf.save(`${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert(`Gagal mengunduh invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="invoice-button-group">
      <button
        onClick={handleViewInvoice}
        disabled={isGenerating}
        className="btn-view-invoice"
        title="Lihat Invoice"
      >
        {isGenerating ? (
          <span className="loading-spinner">⏳</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
        Lihat
      </button>
      
      <button
        onClick={handleDownloadInvoice}
        disabled={isGenerating}
        className="btn-download-invoice"
        title="Download Invoice"
      >
        {isGenerating ? (
          <span className="loading-spinner">⏳</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        )}
        Download
      </button>
    </div>
  );
}
