/**
 * Ce composant est le "tiroir" du panier (Cart Drawer).
 * Il utilise le `useCart` hook pour accéder aux données du panier et aux actions.
 * Il gère l'état local pour le processus de commande (infos client, etc.).
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useCart } from '../CartContext.jsx';
import { useAuth } from '../AuthContext';
import { downloadReceipt } from '../pdfGenerator';
import { PROMO_CODES, DELIVERY_ZONES } from '../data/menuData';
import MapModal from './MapModal';

const POINT_VALUE = 5;

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, cartTotal, loyaltyPoints, setLoyaltyPoints, addOrderToHistory, showToast, setCart } = useCart();
  const { currentUser } = useAuth();

  // États locaux pour le processus de commande
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', deliveryTime: '' });
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [promoInput, setPromoInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryZone, setDeliveryZone] = useState(DELIVERY_ZONES[0]);
  const [gpsLink, setGpsLink] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [tempMapCoords, setTempMapCoords] = useState(null);
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // Pré-remplir les infos si l'utilisateur est connecté
  useEffect(() => {
    if (currentUser) {
      setCustomerInfo(prev => ({ ...prev, name: currentUser.name || '', phone: currentUser.phone || '' }));
    }
  }, [currentUser, isOpen]);

  // Réinitialiser à l'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      setCheckoutStep(0);
    }
  }, [isOpen]);

  // Calculs pour le total
  const promoDiscountAmount = cartTotal * discount;
  const subTotalAfterPromo = cartTotal - promoDiscountAmount;
  const pointsDiscount = usePoints ? Math.min(loyaltyPoints * POINT_VALUE, subTotalAfterPromo) : 0;
  const deliveryCost = deliveryMethod === 'delivery' ? deliveryZone.price : 0;
  const finalTotal = subTotalAfterPromo - pointsDiscount + deliveryCost;

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase();
    if (PROMO_CODES[code]) {
      setDiscount(PROMO_CODES[code]);
      showToast(`Super ! -${PROMO_CODES[code] * 100}% appliqués 🎁`);
    } else {
      setDiscount(0);
      showToast("Code promo invalide 😕");
    }
  };

  const handleMapConfirm = () => {
    if (tempMapCoords) {
      const link = `https://www.google.com/maps?q=${tempMapCoords.lat},${tempMapCoords.lng}`;
      setGpsLink(link);
      setIsMapOpen(false);
      showToast("Position enregistrée ! 📍");
    }
  };

  const sendOrder = async () => {
    if (cart.length === 0) return showToast("Votre panier est vide ! 🛒");
    if (!customerInfo.name || !customerInfo.phone || (deliveryMethod === 'delivery' && !gpsLink) || !customerInfo.deliveryTime) {
      return showToast("Veuillez remplir les infos et choisir votre position ! 📍");
    }

    // --- Referral Logic ---
    if (referralCode && currentUser) {
      // Check if it's the user's first order
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_phone', currentUser.phone);

      if (countError) {
        console.error("Error checking order count:", countError);
      }

      // If it's the first order (count is 0) and the referral code is valid and not their own
      if (count === 0 && referralCode.trim() !== currentUser.phone) {
        // Find the referrer
        const { data: referrer, error: referrerError } = await supabase
          .from('customers')
          .select('loyalty_points')
          .eq('phone', referralCode.trim())
          .single();

        if (referrer) {
          // Award points to the referrer
          const newPoints = (referrer.loyalty_points || 0) + 50;
          await supabase
            .from('customers')
            .update({ loyalty_points: newPoints })
            .eq('phone', referralCode.trim());
          
          showToast("Parrainage réussi ! Votre ami a gagné 50 points. 🎉");
        }
      }
    }

    let currentPoints = loyaltyPoints;
    if (usePoints && pointsDiscount > 0) {
      currentPoints -= Math.ceil(pointsDiscount / POINT_VALUE);
    }
    const pointsEarned = Math.floor(finalTotal / 100);
    currentPoints += pointsEarned;
    setLoyaltyPoints(currentPoints);

    const newOrder = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total: finalTotal,
      method: deliveryMethod,
      customer_phone: currentUser?.phone,
      status: 'pending', // Statut initial : Commande reçue 🟠
      referral_code: referralCode || null
    };

    let orderForHistory = newOrder;

    if (currentUser) {
      // On insère et on récupère la donnée insérée (avec le vrai ID et le statut)
      const { data } = await supabase.from('orders').insert({ ...newOrder, id: undefined, date: undefined }).select().single();
      if (data) orderForHistory = data;
      
      await supabase.from('customers').update({ loyalty_points: currentPoints }).eq('phone', currentUser.phone);
    }

    addOrderToHistory(orderForHistory);

    const onPdfGenerated = () => {
      let message = "";
      if (deliveryMethod === 'delivery') {
        message = `📍 *Ma position :* ${gpsLink}\n\n📄 *Commande :* Voir le PDF ci-joint.`;
      } else {
        message = `🛍️ *Commande à emporter*\n\n📄 *Commande :* Voir le PDF ci-joint.`;
      }

      window.open(`https://wa.me/22899434943?text=${encodeURIComponent(message)}`, '_blank');
      showToast(`PDF téléchargé ! +${pointsEarned} points gagnés 🎁`);
      setCart([]); // Vider le panier après la commande
      onClose();
    };

    downloadReceipt({ cart, customerInfo, finalTotal, deliveryMethod, deliveryZone, usePoints, pointsDiscount, kitchenNotes, onComplete: onPdfGenerated });
  };

  return (
    <>
      <div className={`fixed inset-0 z-[2500] bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 z-[3000] flex h-full w-full sm:max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center border-b border-gray-200 p-4 sm:p-6">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 mr-4" onClick={onClose}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h3 className="font-fredoka text-xl"><i className="fa-solid fa-bag-shopping mr-2"></i> {checkoutStep === 0 ? 'Mon Panier' : 'Livraison'}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {checkoutStep === 0 ? (
            cart.length === 0 ? <div className="text-center text-gray-500">Votre panier est vide</div> :
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-100 py-4">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.qty} x {item.price} F</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{(item.price * item.qty).toLocaleString()} F</span>
                  <button className="text-red-500" onClick={() => removeFromCart(item.id)}><i className="fa-solid fa-trash-can"></i></button>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4 animate-bump">
              <div className="rounded-xl bg-orange-doux/10 p-4 text-sm text-marron border border-orange-doux/30"><i className="fa-solid fa-triangle-exclamation mr-2 text-orange"></i><strong>Important :</strong> Veuillez commander au moins <strong>15h à l'avance</strong> !</div>
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${deliveryMethod === 'delivery' ? 'bg-white text-marron shadow-sm' : 'text-gray-500'}`} onClick={() => setDeliveryMethod('delivery')}>🚚 Livraison</button>
                <button className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${deliveryMethod === 'pickup' ? 'bg-white text-marron shadow-sm' : 'text-gray-500'}`} onClick={() => setDeliveryMethod('pickup')}>🛍️ À emporter</button>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Votre Nom</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-marron" placeholder="Ex: Thy" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Numéro de téléphone</label>
                <input type="tel" className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-marron" placeholder="Ex: 90 00 00 00" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="animate-bump">
                  <button onClick={() => setIsMapOpen(true)} className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border p-3 text-sm font-bold transition-colors ${gpsLink ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                    <i className={`fa-solid ${gpsLink ? 'fa-check' : 'fa-map-location-dot'}`}></i>
                    {gpsLink ? 'Position enregistrée !' : 'Choisir ma position sur la carte'}
                  </button>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Date et Heure de livraison</label>
                <input type="datetime-local" className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-marron" value={customerInfo.deliveryTime} onChange={e => setCustomerInfo({ ...customerInfo, deliveryTime: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Notes pour la cuisine (Optionnel)</label>
                <textarea className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-marron" placeholder="Ex: Sans piment, allergie aux arachides..." rows="2" value={kitchenNotes} onChange={e => setKitchenNotes(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white p-6">
          {checkoutStep === 0 ? (
            <>
              <div className="mb-4 flex gap-2">
                <input type="text" placeholder="Code promo (ex: THY10)" className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-marron" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-bold text-white hover:bg-black" onClick={handleApplyPromo}>OK</button>
              </div>

              {loyaltyPoints > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-orange-doux/10 p-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-marron"><i className="fa-solid fa-crown text-orange"></i><span>Utiliser {loyaltyPoints} points (-{Math.min(loyaltyPoints * POINT_VALUE, subTotalAfterPromo).toLocaleString()} F)</span></div>
                  <div className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${usePoints ? 'bg-orange' : 'bg-gray-300'}`} onClick={() => setUsePoints(!usePoints)}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${usePoints ? 'left-6' : 'left-1'}`}></div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total à payer</span>
                  <span className={(discount > 0 || pointsDiscount > 0) ? "text-orange" : ""}>{finalTotal.toLocaleString()} F CFA</span>
                </div>
                {deliveryMethod === 'delivery' && <div className="text-right text-xs text-gray-500">Dont livraison : {deliveryZone.price.toLocaleString()} F</div>}
                {discount > 0 && <div className="text-right text-xs text-gray-500 line-through">Sous-total : {cartTotal.toLocaleString()} F</div>}
                {usePoints && pointsDiscount > 0 && <div className="text-right text-xs text-orange">Points : -{pointsDiscount.toLocaleString()} F</div>}
              </div>
              <button className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-marron p-4 text-base font-semibold text-white hover:bg-orange-doux" onClick={() => { if (cart.length > 0) setCheckoutStep(1); else showToast("Panier vide !"); }}>
                Passer la commande
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button onClick={() => setCheckoutStep(0)} className="rounded-xl border border-gray-300 px-4 py-3 text-gray-600 hover:bg-gray-50"><i className="fa-solid fa-arrow-left"></i></button>
                <button className="flex-1 flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#25D366] p-4 text-base font-semibold text-white hover:bg-[#20ba5a]" onClick={sendOrder} title="Télécharge le reçu et ouvre WhatsApp">
                  <i className="fa-brands fa-whatsapp"></i> Envoyer la commande
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} onConfirm={handleMapConfirm} tempMapCoords={tempMapCoords} setTempMapCoords={setTempMapCoords} />
    </>
  );
}