import React, { useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { jsPDF } from 'jspdf';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
import logoImg from './image/logo.jpg';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import migaImg from './image/miga.jfif';
import gateauImg from './image/gateau.jfif';
import crepeImg from './image/crepe.jfif';

// Données pour la galerie
const galleryImages = [
  { id: 1, src: migaImg, caption: 'Buffet Anniversaire' },
  { id: 2, src: gateauImg, caption: 'Plateau de Gâteaux' },
  { id: 3, src: crepeImg, caption: 'Bar à Crêpes Sucrées' },
  { id: 4, src: migaImg, caption: 'Cocktail Dînatoire' },
];

const DELIVERY_ZONES = [
  { name: 'Todman / Tokoin (Base)', price: 1000 },
  { name: 'Hedzranawoé', price: 1500 },
  { name: 'Kégué', price: 1500 },
  { name: 'Agbalépédogan', price: 2000 },
  { name: 'Agoè', price: 2500 },
  { name: 'Adidogomé', price: 2500 },
  { name: 'Baguida', price: 3000 },
  { name: 'Autre (À déterminer)', price: 0 }
];

// Icône personnalisée pour la carte
const customIcon = new L.Icon({
  iconUrl: logoImg,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: 'rounded-full border-2 border-marron shadow-xl'
});

// --- COMPOSANTS DE LA CARTE ---

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function MapSearch({ onCoordsChange }) {
  const map = useMap();

  React.useEffect(() => {
    let searchControl;
    let isMounted = true;

    import('leaflet-geosearch').then(({ GeoSearchControl, OpenStreetMapProvider }) => {
      if (!isMounted) return;

      const provider = new OpenStreetMapProvider({
        params: {
          countrycodes: 'tg',
          'accept-language': 'fr',
        },
      });

      searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        showMarker: false,
        autoClose: true,
        searchLabel: 'Rechercher: Hôtel, Quartier, Resto...',
      });
      const onLocationSelect = (result) => {
        const { y: lat, x: lng } = result.location;
        onCoordsChange({ lat, lng });
        map.flyTo([lat, lng], 15);
      };
      map.addControl(searchControl);
      map.on('geosearch/showlocation', onLocationSelect);
    });
    return () => {
      isMounted = false;
      if (searchControl) map.removeControl(searchControl);
    };
  }, [map, onCoordsChange]);
  return null;
}

export default function Events({ onNavigate }) {
  const { currentUser } = useAuth();
  const [guests, setGuests] = useState(50);
  const [date, setDate] = useState('');
  const [theme, setTheme] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    time: ''
  });
  const [gpsLink, setGpsLink] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [tempMapCoords, setTempMapCoords] = useState(null);
  
  const piecesPerPerson = 3;
  const totalPieces = guests * piecesPerPerson;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      showToast("Localisation en cours... ⏳");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const link = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          setGpsLink(link);
          showToast("Position trouvée ! 📍");
        },
        () => showToast("Impossible de récupérer la position 😕")
      );
    } else {
      showToast("Géolocalisation non supportée");
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

  const sendQuoteRequest = () => {
    if (!date || !customerInfo.name || !customerInfo.phone) {
      showToast("Veuillez remplir la date et vos coordonnées ! 📝");
      return;
    }

    // Sauvegarde Supabase
    if (currentUser) {
      supabase.from('event_requests').insert({
        customer_phone: currentUser.phone,
        event_date: date,
        guests: guests,
        theme: theme,
        details: customerInfo
      }).then(({ error }) => { if (error) console.error(error); });
    }

    const message = `📋 *DEMANDE DE DEVIS*\n` +
      `*Taste By Thy* 🎉\n` +
      `--------------------------------\n` +
      `👤 *Client :* ${customerInfo.name}\n` +
      `📞 *Tél :* ${customerInfo.phone}\n` +
      `📅 *Date :* ${date} à ${customerInfo.time || '???'}\n` +
      `--------------------------------\n` +
      `👥 *Invités :* ${guests} pers.\n` +
      `🧁 *Besoin estimé :* ~${totalPieces} pièces\n` +
      `🎨 *Thème :* ${theme || 'Non spécifié'}\n` +
      `--------------------------------\n` +
      (gpsLink ? `🌍 *Lieu (GPS) :* ${gpsLink}\n` : `📍 *Lieu :* À définir\n`) +
      `\nMerci de me recontacter pour le devis !`;
    
    window.open(`https://wa.me/22899434943?text=${encodeURIComponent(message)}`, '_blank');
    downloadQuote(() => {
      const message = `👋 *DEMANDE DE DEVIS - TASTE BY THY*\n` +
        `--------------------------------\n` +
        `👤 *Client :* ${customerInfo.name}\n` +
        `📅 *Date :* ${date}\n` +
        `👥 *Invités :* ${guests} pers.\n` +
        (gpsLink ? `🌍 *Localisation :* ${gpsLink}\n` : `📍 *Lieu :* À définir\n`) +
        `\n📎 *Détails :* Voir le PDF ci-joint (Estimation incluse).`;
      
      window.open(`https://wa.me/22899434943?text=${encodeURIComponent(message)}`, '_blank');
      showToast("PDF téléchargé ! Joignez-le à votre message WhatsApp 📎");
    });
  };

  const downloadQuote = (onComplete) => {
    if (!date || !customerInfo.name) {
      showToast("Veuillez remplir au moins la date et votre nom ! 📝");
      return;
    }

      const doc = new jsPDF();

      const img = new Image();
      img.src = logoImg;
      img.onload = () => {
        // En-tête
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
        
        doc.setDrawColor(200);
        doc.line(15, 40, 195, 40);
        
        // Titre
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("DEVIS ESTIMATIF", 105, 55, { align: "center" });

        // Infos Client & Event
        doc.setFontSize(12);
        doc.setTextColor(93, 64, 55);
        doc.text("Détails de l'événement", 15, 70);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text(`Client : ${customerInfo.name}`, 15, 80);
        doc.text(`Date prévue : ${date}`, 15, 86);
        doc.text(`Heure : ${customerInfo.time || 'Non spécifiée'}`, 15, 92);
        doc.text(`Invités : ${guests} personnes`, 15, 98);
        doc.text(`Thème : ${theme || 'Non spécifié'}`, 15, 104);

        // Encadré Estimation
        doc.setDrawColor(217, 119, 6);
        doc.rect(15, 115, 180, 30);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(217, 119, 6);
        doc.setFontSize(14);
        doc.text(`Estimation recommandée : ~${totalPieces} pièces`, 105, 130, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`(Sur une base de ${piecesPerPerson} pièces par personne)`, 105, 138, { align: "center" });

        doc.save("devis_tastebythy.pdf");
        if (typeof onComplete === 'function') onComplete();
      };
  };

  return (
    <div className="min-h-screen bg-bg-soft pb-10 font-poppins text-marron">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-white/90 px-4 sm:px-[5%] py-3 sm:py-4 shadow-sm backdrop-blur-lg">
        <button onClick={() => onNavigate('menu')} className="w-10 cursor-pointer text-xl text-marron transition-transform hover:-translate-x-1">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="flex-1 text-center font-fredoka text-2xl">Événements</div>
        <div className="w-10"></div>
      </nav>

      <div className="px-[5%] py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          
          {/* Calculateur */}
          <div className="rounded-3xl bg-white p-6 shadow-lg animate-bump">
            <h2 className="mb-4 flex items-center gap-2 font-fredoka text-xl text-marron">
              <i className="fa-solid fa-calculator text-orange"></i> Calculateur de Quantité
            </h2>
            
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-600">Nombre d'invités</label>
              <input 
                type="number" 
                min="1"
                value={guests} 
                onChange={(e) => setGuests(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-lg font-bold text-marron outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
              />
            </div>

            <div className="rounded-2xl bg-orange-doux/10 p-5 text-center border border-orange-doux/20">
              <p className="text-sm text-gray-600">Quantité recommandée :</p>
              <div className="my-1 text-4xl font-fredoka text-orange">
                {totalPieces} <span className="text-lg text-marron">mignardises</span>
              </div>
              <p className="text-xs text-gray-500">Soit {piecesPerPerson} pièces par personne</p>
            </div>
          </div>

          {/* Formulaire Devis */}
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-fredoka text-xl text-marron">
              <i className="fa-solid fa-calendar-check text-orange"></i> Pré-commande & Devis
            </h2>
            <p className="mb-6 text-sm text-gray-500">Les mignardises sont idéales pour vos mariages et anniversaires !</p>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-marron">Date de l'événement</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border-2 border-marron bg-orange-doux/10 p-3 font-bold text-marron outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-orange"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">Thème / Couleurs</label>
                <input 
                  type="text" 
                  placeholder="Ex: Pastel, Doré & Blanc..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">Votre Nom</label>
                  <input 
                    type="text" 
                    placeholder="Votre nom"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-600">Téléphone</label>
                  <input 
                    type="tel" 
                    placeholder="90 00 00 00"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">Lieu & Livraison</label>
                
                <div className="mb-3">
                  <label className="mb-2 block text-sm font-semibold text-gray-600">Heure de l'événement</label>
                  <input 
                    type="time" 
                    value={customerInfo.time}
                    onChange={(e) => setCustomerInfo({...customerInfo, time: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                  />
                </div>
                <button 
                  onClick={() => setIsMapOpen(true)}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border p-3 text-sm font-bold transition-colors ${gpsLink ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <i className={`fa-solid ${gpsLink ? 'fa-check' : 'fa-map-location-dot'}`}></i>
                  {gpsLink ? 'Position enregistrée !' : 'Choisir le lieu sur la carte'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button 
                  onClick={downloadQuote}
                  className="flex-1 rounded-xl border-2 border-marron bg-transparent p-3 font-bold text-marron hover:bg-marron hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-file-pdf"></i> PDF
                </button>
                <button 
                  onClick={sendQuoteRequest}
                  className="flex-[2] rounded-xl bg-marron p-3 font-bold text-white shadow-md transition-transform active:scale-95 hover:bg-orange-doux flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp"></i> Demander devis
                </button>
              </div>
            </div>
          </div>

          {/* Galerie Photos */}
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-fredoka text-xl text-marron">
              <i className="fa-solid fa-camera-retro text-orange"></i> Nos Réalisations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {galleryImages.map((image) => (
                <div key={image.id} className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md">
                  <img 
                    src={image.src} 
                    alt={image.caption} 
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 w-full bg-black/40 p-2 text-center text-xs font-semibold text-white backdrop-blur-sm">
                    {image.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MAP MODAL */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative h-[70vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between bg-white px-4 py-3 border-b">
              <h3 className="font-fredoka text-lg text-marron">📍 Touchez ou recherchez une position</h3>
              <button onClick={() => setIsMapOpen(false)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <div className="flex-1 relative">
              <MapContainer center={[6.1375, 1.2125]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© OpenStreetMap contributors'
                />
                <MapSearch onCoordsChange={setTempMapCoords} />
                <MapClickHandler onClick={setTempMapCoords} />
                {tempMapCoords && <Marker position={tempMapCoords} icon={customIcon} />}
              </MapContainer>
              
              <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2 w-max">
                <button onClick={handleMapConfirm} disabled={!tempMapCoords} className="rounded-full bg-marron px-8 py-3 font-bold text-white shadow-xl disabled:opacity-50 hover:bg-orange-doux transition-all hover:scale-105">
                  Valider cette position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`fixed left-1/2 z-[5000] -translate-x-1/2 rounded-full bg-marron px-6 py-3 text-sm font-medium text-white shadow-lg transition-all ${toastMsg ? 'bottom-8' : '-bottom-full'}`}>
        {toastMsg}
      </div>
    </div>
  );
}