import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates and downloads a PDF from a DOM element.
 * @param {string} elementId - The ID of the DOM element to convert to PDF.
 * @param {string} filename - The desired filename for the downloaded PDF.
 */
export const downloadConfirmationPDF = async (elementId, filename = 'ConfirmationPass.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  // Hide action buttons during capture
  const noPrintElements = element.querySelectorAll('.no-print');
  noPrintElements.forEach(el => {
    // Save original display style
    el.dataset.originalDisplay = el.style.display;
    el.style.display = 'none';
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true, // Allow cross-origin images
      logging: false,
      backgroundColor: '#0f172a' // Match app background, or set to null for transparent
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    // Restore action buttons
    noPrintElements.forEach(el => {
      el.style.display = el.dataset.originalDisplay || '';
    });
  }
};
