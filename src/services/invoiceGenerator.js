import { jsPDF } from 'jspdf';

/**
 * Client-side vector PDF generator for DevCraft Studio project invoices.
 * Generates and downloads a print-quality PDF.
 */
export const generateInvoicePDF = (invoice, settings, clientProfile) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette Definitions
  const primaryBlue = [26, 86, 219];   // #1A56DB
  const textDark = [17, 24, 39];       // #111827
  const textGray = [107, 114, 128];    // #6B7280
  const borderLight = [229, 231, 235]; // #E5E7EB
  const bgLight = [249, 250, 251];     // #F9FAFB

  // A4 dimensions: 210mm x 297mm
  const margin = 20;
  let yPos = margin;

  // --- TOP BAR ACCENT ---
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 210, 8, 'F');
  yPos += 4;

  // --- HEADER: BRAND & INVOICE TITLE ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryBlue);
  doc.text('DevCraft Studio', margin, yPos + 8);
  
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  doc.setFont('Helvetica', 'normal');
  doc.text('YOUR VISION. OUR CODE. DELIVERED.', margin, yPos + 12);

  // Invoice label on the right
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...textDark);
  doc.text('INVOICE', 210 - margin - 42, yPos + 9);

  yPos += 20;

  // --- COMPANY & CLIENT DETAILS ---
  // Horizontal line separating header
  doc.setDrawColor(...borderLight);
  doc.line(margin, yPos, 210 - margin, yPos);
  yPos += 8;

  // Left Column: Company details (Provider)
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text('DevCraft Studio', margin, yPos);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Developer: Amar Biswas', margin, yPos + 5);
  doc.text(`Phone: +91 ${settings.phone || '7047310066'}`, margin, yPos + 10);
  doc.text(`Email: ${settings.email || 'amarbiswas@gmail.com'}`, margin, yPos + 15);
  doc.text(settings.address || 'Krishnagar, West Bengal - 741163', margin, yPos + 20);

  // Right Column: Client details (Billed To)
  const rightColX = 120;
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text('BILLED TO:', rightColX, yPos);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text(clientProfile?.name || 'Valued Client', rightColX, yPos + 5);
  if (clientProfile?.phone) {
    doc.text(`Phone: ${clientProfile.phone}`, rightColX, yPos + 10);
  }
  doc.text(`Email: ${clientProfile?.email || 'N/A'}`, rightColX, yPos + 15);

  yPos += 30;

  // --- INVOICE METADATA PANEL (UPI / DATE) ---
  doc.setFillColor(...bgLight);
  doc.rect(margin, yPos, 210 - (margin * 2), 22, 'F');
  doc.rect(margin, yPos, 210 - (margin * 2), 22, 'S');

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...textGray);
  
  // Metadata labels
  doc.text('INVOICE NO.', margin + 6, yPos + 7);
  doc.text('DATE ISSUED', margin + 50, yPos + 7);
  doc.text('PAYMENT MODE', margin + 92, yPos + 7);
  doc.text('TRANSACTION REFERENCE (UTR)', margin + 130, yPos + 7);

  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text(invoice.invoiceNo || `DC-${Date.now().toString().slice(-4)}`, margin + 6, yPos + 14);
  
  const issueDate = invoice.createdAt ? new Date(invoice.createdAt?.seconds ? invoice.createdAt.seconds * 1000 : invoice.createdAt) : new Date();
  doc.text(issueDate.toLocaleDateString(), margin + 50, yPos + 14);
  doc.text(invoice.paymentMode || 'UPI / Manual', margin + 92, yPos + 14);
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(invoice.upiUtr || 'N/A', margin + 130, yPos + 14);

  yPos += 34;

  // --- TABLE: ITEMS & FEES ---
  // Table Headers
  doc.setFillColor(...primaryBlue);
  doc.rect(margin, yPos, 210 - (margin * 2), 10, 'F');
  
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION OF DEVELOPMENT SERVICES', margin + 6, yPos + 6.5);
  doc.text('AMOUNT (INR)', 210 - margin - 35, yPos + 6.5);

  yPos += 10;

  // Table Row Content
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, yPos, 210 - (margin * 2), 24, 'F');
  doc.rect(margin, yPos, 210 - (margin * 2), 24, 'S');

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...textDark);
  // Write custom description (e.g. Services chosen)
  doc.text('Bespoke Web Platform Development Services', margin + 6, yPos + 8);
  
  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Includes front-end coding, mobile design responsiveness layout,', margin + 6, yPos + 13);
  doc.text('custom Firestore indexing, and Cloudinary media configurations.', margin + 6, yPos + 18);

  // Price Amount
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text(`Rs. ${invoice.amount?.toLocaleString('en-IN')}.00`, 210 - margin - 35, yPos + 11);

  yPos += 30;

  // --- SUMMARY / TOTAL PRICE ---
  const summaryX = 130;
  doc.setFontSize(9.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Subtotal:', summaryX, yPos);
  doc.text(`Rs. ${invoice.amount?.toLocaleString('en-IN')}.00`, 210 - margin - 25, yPos);

  yPos += 6;
  doc.text('Tax (IGST Exempt):', summaryX, yPos);
  doc.text('Rs. 0.00', 210 - margin - 25, yPos);

  yPos += 4;
  // Border line under summary
  doc.setDrawColor(...borderLight);
  doc.line(summaryX, yPos, 210 - margin, yPos);
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('Total Paid:', summaryX, yPos);
  doc.text(`Rs. ${invoice.amount?.toLocaleString('en-IN')}.00`, 210 - margin - 25, yPos);

  // --- FOOTER: SIGNATURE STAMP & THANK YOU ---
  yPos = 245;

  // Verified Stamp graphic mockup
  doc.setDrawColor(16, 185, 129); // #10B981 emerald
  doc.setFillColor(240, 253, 250);
  doc.rect(margin + 5, yPos, 62, 14, 'DF');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text('PAYMENT VERIFIED & SECURED', margin + 9, yPos + 6);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('DevCraft Studio Accounting', margin + 17, yPos + 10);

  // Sign Line
  const signX = 145;
  doc.setDrawColor(...textGray);
  doc.line(signX, yPos + 8, 210 - margin, yPos + 8);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Authorized Signatory', signX + 5, yPos + 12);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text('Amar Biswas', signX + 11, yPos + 6);

  // Acknowledgment text at the bottom center
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  doc.text('This is a computer-generated invoice, no physical signature required.', 105, 275, { align: 'center' });
  doc.text('DevCraft Studio - Krishnagar, West Bengal 741163', 105, 279, { align: 'center' });

  // Save/Download PDF
  doc.save(`invoice_${invoice.invoiceNo || 'INV'}.pdf`);
};
