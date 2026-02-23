import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Au chargement, on récupère l'utilisateur depuis le localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('tasteByThy_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 2. Fonction Register
  const register = async (name, phone, pin) => {
    try {
      // Vérifier si le nom d'utilisateur est déjà pris
      const { data: existingUser, error: checkError } = await supabase
        .from('customers')
        .select('name')
        .eq('name', name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116: 0 rows, c'est ok
        throw checkError;
      }

      if (existingUser) {
        return { success: false, error: "Ce nom ou pseudo est déjà utilisé." };
      }

      // Vérifier si le numéro de téléphone est déjà inscrit
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('customers')
        .select('phone')
        .eq('phone', phone)
        .single();

      if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
        throw phoneCheckError;
      }

      if (existingPhone) {
        return { success: false, error: "Ce numéro est déjà inscrit. Veuillez vous connecter." };
      }

      // Créer le nouvel utilisateur
      const { data: newUser, error: insertError } = await supabase
        .from('customers')
        .insert({ name, phone, pin }) // Assurez-vous d'avoir une colonne 'pin' dans votre table
        .select()
        .single();

      if (insertError) throw insertError;

      // Connecter l'utilisateur automatiquement
      setCurrentUser(newUser);
      localStorage.setItem('tasteByThy_user', JSON.stringify(newUser));
      return { success: true };

    } catch (err) {
      console.error("Erreur d'inscription:", err.message);
      return { success: false, error: err.message };
    }
  };

  // 3. Fonction Login
  const login = async (name, pin) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('name', name)
        .eq('pin', pin) // ATTENTION: Stockage du PIN en clair. Considérez le hachage pour la sécurité.
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // 0 rows
          return { success: false, error: "Nom/pseudo ou code PIN incorrect." };
        }
        throw error;
      }

      setCurrentUser(data);
      localStorage.setItem('tasteByThy_user', JSON.stringify(data));
      return { success: true };

    } catch (err) {
      console.error("Erreur de connexion:", err.message);
      return { success: false, error: err.message };
    }
  };

  // 4. Fonction Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tasteByThy_user');
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}