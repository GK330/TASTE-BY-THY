import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useCart } from './CartContext.jsx';
import Login from './Login.jsx';

// Import des données et composants
import { productsData, categories } from './data/menuData';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal.jsx';
import HistoryModal from './components/HistoryModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';

export default function Menu({ onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { favorites, toggleFavorite, loyaltyPoints, cartCount, isAnimating, isCartOpen, setIsCartOpen, showToast, setCart, addToCart } = useCart();

  // --- États locaux à la page Menu ---
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [modalProduct, setModalProduct] = useState(null);
  const [pendingSuggestion, setPendingSuggestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  useEffect(() => {
    const hasSeenHint = sessionStorage.getItem('hasSeenLoginHint');
    if (!currentUser && !hasSeenHint) {
      const timer = setTimeout(() => setShowLoginHint(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const dismissLoginHint = () => {
    setShowLoginHint(false);
    sessionStorage.setItem('hasSeenLoginHint', 'true');
 };

  // Filtrage
  const filteredProducts = useMemo(() => productsData.filter(product => {
    const matchesFavorites = selectedCategory === 'Favoris' ? favorites.includes(product.id) : true;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tout' || selectedCategory === 'Favoris' || product.category === selectedCategory;
    return matchesCategory && matchesSearch && matchesFavorites;
  }), [selectedCategory, searchTerm, favorites]);

  // --- ACTIONS ---

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Vous avez été déconnecté(e).");
    } catch {
      showToast("Erreur lors de la déconnexion.");
    }
  };

  const handleReorder = (oldCart) => {
    setCart(oldCart);
    setIsHistoryOpen(false);
    setIsCartOpen(true);
    showToast("Panier restauré ! 🛒");
  };

  return (
    <div>
      {/* NAVBAR */}
      <Navbar 
        onNavigate={onNavigate}
        currentUser={currentUser}
        logout={handleLogout}
        setIsLoginOpen={setIsLoginOpen}
        loyaltyPoints={loyaltyPoints}
        setIsHistoryOpen={setIsHistoryOpen}
        setIsCartOpen={setIsCartOpen}
        cartCount={cartCount}
        isAnimating={isAnimating}
      />
      
      {/* RECHERCHE */}
      <div className="px-[5%] pt-4">
        <div className="relative flex items-center rounded-2xl bg-gray-100 px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-marron/20">
          <i className="fa-solid fa-magnifying-glass mr-3 text-gray-400"></i>
          <input
            type="text"
            placeholder="Rechercher (ex: Crêpe, Jus...)"
            className="w-full bg-transparent text-marron placeholder-gray-400 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-marron">
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="flex gap-2.5 overflow-x-auto px-[5%] py-5 [scrollbar-width:none] -mx-[5%] px-[5%] sm:mx-0">
        {categories.concat(['Favoris']).map(cat => (
          <div
            key={cat}
            className={`cursor-pointer whitespace-nowrap rounded-full border border-transparent px-5 py-2 text-sm font-semibold shadow-sm transition-all ${selectedCategory === cat ? 'bg-marron text-white' : 'bg-white'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* GRID PRODUITS */}
      <main className="px-[5%] py-5">
        <h2 className="mt-4 flex items-center gap-3 font-fredoka text-2xl text-marron">
          <i className={`fa-solid ${selectedCategory === 'Tout' ? 'fa-utensils' : 'fa-tag'} text-orange`}></i>
          {selectedCategory === 'Tout' ? 'La Carte' : selectedCategory}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-5 py-2.5">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              openModal={setModalProduct}
              toggleFavorite={toggleFavorite}
              isFavorite={favorites.includes(product.id)}
            />
          ))}
        </div>
      </main>

      {/* --- COMPOSANTS MODAUX --- */}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onSuggest={setPendingSuggestion}
      />

      {/* CONFIRMATION SUGGESTION MODAL */}
      {pendingSuggestion && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPendingSuggestion(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-bump" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 text-xl font-bold text-marron text-center">Une petite envie ? 😋</h3>
            <p className="mb-6 text-center text-gray-600">
              Voulez-vous ajouter <strong>{pendingSuggestion.name}</strong> à votre panier pour <span className="font-bold text-orange">{pendingSuggestion.price}F</span> ?
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 rounded-xl border-2 border-gray-100 py-3 font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                onClick={() => setPendingSuggestion(null)}
              >
                Non merci
              </button>
              <button 
                className="flex-1 rounded-xl bg-marron py-3 font-semibold text-white transition-colors hover:bg-orange-doux"
                onClick={() => {
                  addToCart({ ...pendingSuggestion, category: 'Upsell' }, 1);
                  setPendingSuggestion(null);
                }}
              >
                Oui, ajouter !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginOpen && <Login onClose={() => setIsLoginOpen(false)} />}

      {/* HISTORIQUE MODAL */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onReorder={handleReorder}
      />

      {/* LOGIN HINT OVERLAY */}
      {showLoginHint && !currentUser && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">

          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { 
              from { opacity: 0; transform: translateY(20px) scale(0.95); } 
              to { opacity: 1; transform: translateY(0) scale(1); } 
            }
            .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
            .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          `}</style>


          <div className="absolute top-10 right-80 hidden sm:block z-[6003] animate-bounce">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-12 drop-shadow-lg">
              <path d="M30 90 C 10 80, 0 40, 40 30 C 60 25, 80 10, 90 10" stroke="white" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowhead)" className="animate-pulse"/>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                </marker>
              </defs>
            </svg>
            <p className="text-white font-hand text-xl -mt-4 -ml-10 rotate-[-10deg]">C'est par ici !</p>
          </div>


          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl animate-slide-up">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange/10 text-4xl text-orange">
                <i className="fa-solid fa-gift"></i>
              </div>
            </div>
            
            <h3 className="mb-3 font-bold text-2xl text-marron">
              Gagnez des points ! 🎁
            </h3>
            
            <p className="mb-8 text-gray-600 leading-relaxed">
              Connectez-vous pour gagner des points, faire des économies et retrouver vos plats favoris plus facilement !
            </p>

            <button 
              onClick={dismissLoginHint}
              className="w-full rounded-xl bg-marron p-4 font-bold text-white shadow-lg hover:bg-orange transition-all active:scale-95"
            >
              OK, j'ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
