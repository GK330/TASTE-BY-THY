/**
 * Ce composant affiche la modale pour un produit spécifique.
 * Il permet à l'utilisateur de voir les détails, d'ajuster la quantité,
 * de voir des suggestions et d'ajouter le produit au panier.
 */
import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext.jsx';
import { suggestionsData } from '../data/menuData';

export default function ProductModal({ product, onClose, onSuggest }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setQty(1);
    }
  }, [product]);

  const handleAddToCart = () => {
    const wasAdded = addToCart(product, qty);
    if (wasAdded) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <>
      <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/70 p-0 sm:p-5 backdrop-blur-sm" onClick={onClose}>
        <div className="relative mx-auto w-full h-full sm:h-auto sm:max-w-md rounded-none sm:rounded-3xl bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Desktop close button */}
          <button className="hidden sm:block absolute right-4 top-4 z-20 h-8 w-8 rounded-full bg-black/30 text-xl text-white" onClick={onClose}>&times;</button>
          
          {/* Mobile Header with back arrow */}
          <div className="sm:hidden absolute top-0 left-0 p-4 z-20">
            <button onClick={onClose} className="h-10 w-10 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-sm">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <img src={product.img} className="h-64 sm:h-52 w-full sm:rounded-t-3xl object-cover" alt={product.name} />
            <div className="p-6">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="mb-5 text-gray-600">{product.desc}</p>

              <div className="my-5 flex items-center justify-between">
                <div className="flex items-center gap-4 rounded-full bg-gray-100 px-4 py-1">
                  <button className="text-2xl text-marron" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                  <span className="text-lg font-bold">{qty}</span>
                  <button className="text-2xl text-marron" onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                <div className="text-2xl font-bold text-orange">
                  <span>{(product.price * qty).toLocaleString()}</span> F
                </div>
              </div>

              {suggestionsData[product.category] && (
                <div className="mt-5 border-t border-dashed border-gray-300 pt-4">
                  <p className="mb-2 text-sm font-semibold text-marron">Accompagnez cela avec... 😍</p>
                  <div className="flex gap-2.5 overflow-x-auto pb-2">
                    {suggestionsData[product.category].map(sugg => (
                      <div
                        key={sugg.id}
                        className="min-w-[120px] cursor-pointer rounded-xl border border-gray-200 bg-white p-2 text-center transition-transform hover:scale-105"
                        onClick={() => onSuggest(sugg)}
                      >
                        <img src={sugg.img} alt={sugg.name} className="h-16 w-full rounded-lg object-cover" />
                        <h4 className="my-1 text-xs">{sugg.name}</h4>
                        <span className="text-xs font-bold text-orange-doux">+ {sugg.price}F</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="mt-5 w-full cursor-pointer rounded-2xl border-none bg-marron p-4 text-base font-bold text-white transition-colors hover:bg-orange-doux" onClick={handleAddToCart}>
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}