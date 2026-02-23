/**
 * Ce fichier définit le Contexte React pour le panier et les données utilisateur associées.
 * Il centralise l'état et la logique pour le panier, les favoris, l'historique des commandes
 * et les points de fidélité, les rendant accessibles à tous les composants enfants.
 */
import React, { createContext, useState, useEffect, useContext, useMemo, useRef } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const prevUserRef = useRef(currentUser);

  // --- ÉTATS ---
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [orderHistory, setOrderHistory] = useState(() => JSON.parse(localStorage.getItem('orderHistory') || '[]'));
  const [loyaltyPoints, setLoyaltyPoints] = useState(() => parseInt(localStorage.getItem('loyaltyPoints') || '0', 10));
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // --- EFFETS ---

  // Sauvegarde dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    localStorage.setItem('loyaltyPoints', loyaltyPoints.toString());
  }, [cart, favorites, orderHistory, loyaltyPoints]);

  // Gère la synchronisation des données lors de la connexion/déconnexion
  useEffect(() => {
    const wasLoggedIn = prevUserRef.current;
    const isLoggedIn = currentUser;

    // Détection de la DÉCONNEXION : si un utilisateur était connecté et ne l'est plus.
    if (wasLoggedIn && !isLoggedIn) {
      // On vide toutes les données locales pour ne pas les laisser à un utilisateur anonyme.
      setCart([]);
      setFavorites([]);
      setOrderHistory([]);
      setLoyaltyPoints(0);
    } 
    // Détection de la CONNEXION : si l'utilisateur est connecté.
    else if (isLoggedIn) {
      const syncUserData = async () => {
        if (isLoggedIn.phone) {
          // 1. Charger les points
          const { data: customerData } = await supabase.from('customers').select('loyalty_points').eq('phone', isLoggedIn.phone).single();
          if (customerData) setLoyaltyPoints(customerData.loyalty_points || 0);

          // 2. Charger les favoris
          const { data: favoritesData } = await supabase.from('favorites').select('product_id').eq('customer_phone', isLoggedIn.phone);
          if (favoritesData) setFavorites(favoritesData.map(f => f.product_id));

          // 3. Charger l'historique
          const { data: ordersData } = await supabase.from('orders').select('*').eq('customer_phone', isLoggedIn.phone).order('created_at', { ascending: false });
          if (ordersData) setOrderHistory(ordersData);
        }
      };
      syncUserData();
    }

    // Mettre à jour la référence pour la prochaine exécution de l'effet
    prevUserRef.current = currentUser;
  }, [currentUser]);

  // --- TEMPS RÉEL : Écouter les changements de statut des commandes ---
  useEffect(() => {
    if (!currentUser || !currentUser.phone) return;

    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // On écoute uniquement les mises à jour (ex: changement de statut)
          schema: 'public',
          table: 'orders',
          filter: `customer_phone=eq.${currentUser.phone}`,
        },
        (payload) => {
          // Mise à jour locale de la commande modifiée
          setOrderHistory((prev) => prev.map((order) => (order.id === payload.new.id ? payload.new : order)));
          showToast("Statut de commande mis à jour ! 🔔");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // --- ACTIONS ---

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const addToCart = (product, qty) => {
    if (product.id.startsWith('c') && qty < 4) {
      showToast("Désolé, les crêpes se commandent par 4 minimum ! 🥞");
      return false;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prevCart, { ...product, qty }];
    });

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    showToast(`Ajouté : ${product.name}`);
    return true;
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleFavorite = async (productId) => {
    const isAdding = !favorites.includes(productId);
    const newFavorites = isAdding ? [...favorites, productId] : favorites.filter(id => id !== productId);
    setFavorites(newFavorites);
    showToast(isAdding ? "Ajouté aux favoris" : "Retiré des favoris");

    if (currentUser) {
      if (isAdding) {
        await supabase.from('favorites').insert({ customer_phone: currentUser.phone, product_id: productId });
      } else {
        await supabase.from('favorites').delete().match({ customer_phone: currentUser.phone, product_id: productId });
      }
    }
  };
  
  const addOrderToHistory = (newOrder) => {
    setOrderHistory(prev => [newOrder, ...prev]);
  };

  // --- VALEURS CALCULÉES ---

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);

  // --- EXPORT DU CONTEXTE ---

  const value = {
    cart,
    setCart,
    favorites,
    orderHistory,
    loyaltyPoints,
    setLoyaltyPoints,
    isCartOpen,
    setIsCartOpen,
    isAnimating,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    toggleFavorite,
    addOrderToHistory,
    showToast,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Toast Component */}
      <div className={`fixed left-1/2 z-[5000] -translate-x-1/2 rounded-full bg-marron px-6 py-3 text-sm font-medium text-white shadow-lg transition-all ${toastMsg ? 'bottom-8' : '-bottom-full'}`}>
        {toastMsg}
      </div>
    </CartContext.Provider>
  );
};