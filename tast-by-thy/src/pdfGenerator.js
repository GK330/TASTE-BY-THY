/**
 * Ce fichier contient la logique pour générer le reçu de commande au format PDF.
 * Il exporte une fonction `downloadReceipt` qui prend les détails de la commande
 * et génère un fichier PDF téléchargeable.
 */
import { jsPDF } from 'jspdf';
import logoImg from './image/logo.jpg';

export const downloadReceipt = ({ cart, customerInfo, finalTotal, deliveryMethod, deliveryZone, usePoints, pointsDiscount, kitchenNotes, onComplete }) => {
  if (cart.length === 0) return;

  const doc = new jsPDF();
  const POINT_VALUE = 5; // Doit être partagé ou passé en prop

  const img = new Image();
  img.src = logoImg;
  img.onload = () => {
    const orderId = `CMD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    doc.addImage(img, 'JPEG', 15, 10, 25, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(93, 64, 55);
    doc.text("Taste By Thy", 45, 20);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(217, 119, 6);
    doc.text("Eat your feelings...", 45, 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 195, 20, { align: "right" });
    doc.text(`N°: ${orderId}`, 195, 25, { align: "right" });

    doc.setDrawColor(200);
    doc.line(15, 40, 195, 40);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Information Client", 15, 50);

    doc.setFontSize(10);
    doc.text(`Nom : ${customerInfo.name}`, 15, 60);
    doc.text(`Tél : ${customerInfo.phone}`, 15, 66);
    doc.text(`Pour : ${customerInfo.deliveryTime.replace('T', ' à ')}`, 15, 72);

    if (kitchenNotes) {
      doc.setFontSize(10);
      doc.setTextColor(217, 119, 6);
      doc.text(`Note : ${kitchenNotes}`, 15, 79);
      doc.setTextColor(0);
    }

    doc.setFontSize(14);
    doc.text("Détails de la commande", 15, 85);

    const packItemsPDF = cart.filter(item => item.category === 'Mignardises');
    const otherItemsPDF = cart.filter(item => item.category !== 'Mignardises');

    let y = 95;
    doc.setFontSize(10);

    if (packItemsPDF.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(217, 119, 6); // Orange
      doc.text("Votre Pack Mignardises", 15, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);

      packItemsPDF.forEach(item => {
        doc.text(`• ${item.qty} x ${item.name}`, 20, y);
        doc.text(`${(item.price * item.qty).toLocaleString()} F`, 195, y, { align: "right" });
        y += 8;
      });
      y += 5;
    }

    if (otherItemsPDF.length > 0) {
      if (packItemsPDF.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(93, 64, 55); // Marron
        doc.text("Autres Articles", 15, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
      }

      otherItemsPDF.forEach(item => {
        doc.text(`• ${item.qty} x ${item.name}`, 15, y);
        doc.text(`${(item.price * item.qty).toLocaleString()} F`, 195, y, { align: "right" });
        y += 8;
      });
    }

    y += 5;
    doc.line(15, y, 195, y);
    y += 10;

    if (deliveryMethod === 'delivery') {
      doc.text("Livraison :", 140, y);
      doc.text(`${deliveryZone.price.toLocaleString()} F`, 195, y, { align: "right" });
      y += 8;
    }

    if (usePoints && pointsDiscount > 0) {
      doc.setTextColor(217, 119, 6);
      doc.text(`Points fidélité (-${Math.ceil(pointsDiscount / POINT_VALUE)} pts) :`, 100, y);
      doc.text(`-${pointsDiscount.toLocaleString()} F`, 195, y, { align: "right" });
      doc.setTextColor(0);
      y += 8;
    }

    y += 2;
    doc.setFontSize(16);
    doc.setTextColor(93, 64, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Total :", 130, y);
    doc.text(`${finalTotal.toLocaleString()} F`, 195, y, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text("Merci de votre confiance !", 105, 280, { align: "center" });

    doc.save("recu_tastebythy.pdf");
    if (typeof onComplete === 'function') onComplete();
  };
};