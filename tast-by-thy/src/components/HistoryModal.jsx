/**
 * Ce composant affiche la modale de l'historique des commandes.
 * Il utilise le `useCart` hook pour obtenir l'historique et les points,
 * et permet à l'utilisateur de recommander un panier précédent.
 */
import React from 'react';
import { useCart } from '../CartContext.jsx';
import { useAuth } from '../AuthContext.jsx';

const getStatusInfo = (status) => {
  switch (status) {
    case 'preparing':
      return { label: '🥣 En préparation', sub: 'On chauffe la crêpière !', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'delivering':
      return { label: '🛵 En route', sub: 'Le livreur arrive vers chez vous...', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    case 'delivered':
      return { label: '✅ Livré', sub: 'Bon appétit et à bientôt !', color: 'bg-green-100 text-green-700 border-green-200' };
    case 'pending':
    default:
      return { label: '🟠 Commande reçue', sub: 'En attente de validation', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  }
};

export default function HistoryModal({ isOpen, onClose, onReorder }) {
  const { orderHistory, loyaltyPoints } = useCart();
  const { currentUser } = useAuth();

  const handleShare = () => {
    if (!currentUser) return;
    const shareData = {
      title: 'Parrainage Taste By Thy',
      text: `Salut ! Commande de délicieuses gourmandises chez Taste By Thy et utilise mon code de parrainage pour me faire gagner des points : ${currentUser.phone}`,
      url: window.location.origin,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback for desktop: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert("Code de parrainage copié dans le presse-papiers !");
    }
  };

  const browniePoints = 500;
  const progress = Math.min((loyaltyPoints / browniePoints) * 100, 100);
  const pointsNeeded = Math.max(0, browniePoints - loyaltyPoints);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="relative h-full w-full sm:h-[80vh] sm:max-w-md rounded-none sm:rounded-3xl bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center border-b border-gray-200 p-4 sm:px-6 sm:py-4">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 mr-4">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h3 className="font-fredoka text-xl text-marron">📜 Mes Commandes</h3>
          <div className="flex-1 text-right sm:hidden">
            <span className="inline-flex items-center gap-1 rounded-lg bg-orange-doux/10 px-2 py-1 text-xs font-bold text-orange">
              <i className="fa-solid fa-crown"></i> {loyaltyPoints} pts</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* --- Parrainage Gourmand Section --- */}
          {currentUser && (
            <div className="mb-6 rounded-2xl border-2 border-dashed border-orange p-4 text-center">
              <h4 className="font-fredoka text-lg text-marron">Parrainage Gourmand 🎁</h4>
              <p className="mt-1 text-sm text-gray-600">Partagez votre code et gagnez <span className="font-bold">50 points</span> quand un ami passe sa première commande !</p>
              <div className="my-3 flex items-center justify-center gap-2 rounded-lg bg-gray-100 p-2">
                <span className="text-sm font-semibold text-gray-500">Votre code :</span>
                <span className="font-mono font-bold text-marron">{currentUser.phone}</span>
              </div>
              <button onClick={handleShare} className="w-full rounded-lg bg-orange py-2 text-sm font-bold text-white transition-colors hover:bg-orange-doux">
                <i className="fa-solid fa-share-nodes mr-2"></i> Partager mon code
              </button>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <p className="text-xs font-bold text-marron">Objectif : Brownie Offert ! 🍫</p>
                <div className="my-1 h-4 w-full overflow-hidden rounded-full bg-orange-doux/20">
                  <div 
                    className="h-full rounded-full bg-orange transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{pointsNeeded > 0 ? `${pointsNeeded} points restants` : "Félicitations ! Réclamez votre brownie !"}</p>
              </div>
            </div>
          )}

          {orderHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <i className="fa-solid fa-clock-rotate-left text-4xl mb-3 text-gray-300"></i>
              <p>Aucune commande passée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.map(order => {
                const status = getStatusInfo(order.status || 'pending');
                return (
                  <div key={order.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className={`mb-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${status.color}`}>
                          {status.label}
                        </div>
                        <p className="font-bold text-marron">{new Date(order.created_at || order.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{order.items.length} articles • {order.method === 'delivery' ? 'Livraison' : 'Emporter'}</p>
                      </div>
                      <span className="font-bold text-orange">{order.total.toLocaleString()} F</span>
                    </div>
                    
                    {/* Message de statut "Lomé-Style" */}
                    <div className="mb-3 rounded-lg bg-gray-50 p-2 text-xs italic text-gray-600">
                      "{status.sub}"
                    </div>

                    <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                    </div>
                    <button
                      onClick={() => onReorder(order.items)}
                      className="w-full rounded-lg bg-orange-doux/10 py-2 text-sm font-bold text-orange hover:bg-orange-doux hover:text-white transition-colors"
                    >
                      <i className="fa-solid fa-rotate-right mr-2"></i> Commander à nouveau
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}