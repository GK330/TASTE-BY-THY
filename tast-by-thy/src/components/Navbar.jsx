import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({ onNavigate, currentUser, logout, setIsLoginOpen, loyaltyPoints, setIsHistoryOpen, setIsCartOpen, cartCount, isAnimating }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event) {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        burgerRef.current && !burgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-[1000] flex items-center justify-between border-b border-black/5 bg-white/90 px-4 sm:px-[5%] py-3 sm:py-4 backdrop-blur-lg transition-all">
        <button onClick={() => onNavigate('home')} className="w-10 cursor-pointer text-xl text-marron">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="flex-1 text-center font-fredoka text-xl sm:text-2xl text-marron truncate px-2">Taste By Thy</div>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <button onClick={logout} title="Déconnexion" className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-marron hover:bg-gray-200 transition-colors">
                <span className="truncate max-w-20">{currentUser.name || currentUser.phone}</span>
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="rounded-xl bg-marron px-3 py-2 text-sm font-bold text-white hover:bg-orange-doux transition-colors">
                Se connecter
              </button>
            )}

            <div className="flex items-center gap-1 rounded-xl bg-orange-doux/10 px-3 py-2 text-sm font-bold text-orange">
              <i className="fa-solid fa-crown"></i>
              <span>{loyaltyPoints} pts</span>
            </div>
            <button onClick={() => onNavigate('events')} className="rounded-xl bg-orange-doux/10 px-3 py-2 text-sm font-bold text-marron hover:bg-orange-doux hover:text-white transition-colors">
              🎉 Événements
            </button>
            <button onClick={() => setIsHistoryOpen(true)} className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-marron hover:bg-gray-200 transition-colors">
              📜 Historique
            </button>
          </div>

          {/* Mobile Burger Button */}
          <button ref={burgerRef} onClick={() => setIsMenuOpen(!isMenuOpen)} className="sm:hidden text-2xl text-marron">
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>

          {/* Cart Icon (Always visible) */}
          <div className={`relative w-10 cursor-pointer ${isAnimating ? 'animate-bump' : ''}`} onClick={() => setIsCartOpen(true)}>
            <i className="fa-solid fa-bag-shopping text-2xl text-marron"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-orange-doux text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <>
          {/* Backdrop Blur */}
          <div className="fixed inset-0 top-[60px] z-[890] bg-black/20 backdrop-blur-sm sm:hidden" onClick={() => setIsMenuOpen(false)}></div>
          
          <div ref={menuRef} className="fixed inset-x-0 top-[60px] z-[900] flex flex-col gap-2 border-b border-gray-100 bg-white p-4 shadow-lg sm:hidden animate-slide-down">
            {/* Fun Detail */}
            <i className="fa-solid fa-cookie-bite absolute -top-2 right-10 text-4xl text-orange/10 -rotate-12"></i>
            
            {currentUser ? (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="font-bold text-marron">{currentUser.name || currentUser.phone}</span>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-sm text-red-500 font-bold">Déconnexion</button>
              </div>
            ) : (
              <button onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }} className="w-full rounded-lg bg-gray-50 p-3 text-left font-bold text-marron hover:bg-gray-100">Se connecter</button>
            )}
          
          <div className="flex items-center justify-between rounded-lg bg-orange-doux/10 p-3 text-orange font-bold">
            <span><i className="fa-solid fa-crown mr-2"></i> Mes points</span>
            <span>{loyaltyPoints} pts</span>
          </div>
          
          <button onClick={() => { onNavigate('events'); setIsMenuOpen(false); }} className="w-full rounded-lg bg-gray-50 p-3 text-left font-bold text-marron hover:bg-gray-100">🎉 Événements</button>
          <button onClick={() => { setIsHistoryOpen(true); setIsMenuOpen(false); }} className="w-full rounded-lg bg-gray-50 p-3 text-left font-bold text-marron hover:bg-gray-100">📜 Historique des commandes</button>
          </div>
        </>
      )}
    </>
  );
}
