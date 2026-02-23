import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Login({ onClose }) {
  const { login, register } = useAuth();
  const [isNewUser, setIsNewUser] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isNewUser) {
      if (!name || !phone || !pin) {
        setError("Veuillez remplir tous les champs.");
        setLoading(false);
        return;
      }
      result = await register(name, phone, pin);
    } else {
      if (!name || !pin) {
        setError("Veuillez remplir le nom et le code PIN.");
        setLoading(false);
        return;
      }
      result = await login(name, pin);
    }

    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        
        <div className="text-center mb-6">
          <h3 className="font-fredoka text-2xl text-marron mb-2">
            {isNewUser ? "Créer un compte" : "👋 Bon retour !"}
          </h3>
          <p className="text-gray-500 text-sm">
            {isNewUser 
              ? "Créez votre compte pour gagner des points et plus encore." 
              : "Connectez-vous pour retrouver vos avantages."}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Nom ou Pseudo" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-marron focus:ring-2 focus:ring-orange/20" 
            />
          </div>

          {isNewUser && (
            <div className="animate-bump">
              <input 
                type="tel" 
                placeholder="Numéro WhatsApp (ex: 90000000)" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-marron focus:ring-2 focus:ring-orange/20" 
              />
            </div>
          )}
          
          <div>
            <input 
              type="password"
              placeholder="Code PIN (4 chiffres)" 
              value={pin}
              maxLength="4"
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-marron focus:ring-2 focus:ring-orange/20" 
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-marron p-4 font-bold text-white shadow-lg hover:bg-orange-doux transition-transform active:scale-95">
            {loading ? 'Chargement...' : (isNewUser ? 'Créer mon compte' : 'Se connecter')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsNewUser(!isNewUser);
              setError('');
              setName('');
              setPhone('');
              setPin('');
            }} 
            className="text-sm font-semibold text-marron underline decoration-orange decoration-2 underline-offset-4 hover:text-orange"
          >
            {isNewUser ? "J'ai déjà un compte" : "Créer un nouveau compte"}
          </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"><i className="fa-solid fa-xmark"></i></button>
      </div>
    </div>
  );
}
