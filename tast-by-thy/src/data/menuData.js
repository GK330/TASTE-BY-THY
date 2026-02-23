import crepeImg from '../image/crepe.jfif';
import migaImg from '../image/miga.jfif';
import gateauImg from '../image/gateau.jfif';
import bissapImg from '../image/bissap.jfif';

export const productsData = [
  { id: 'c1', name: 'Crêpe Nature', price: 250, category: 'Crêpes', img: crepeImg, desc: 'Généreuse au chocolat.' },
  { id: 'c2', name: 'Crêpe Nutella', price: 400, category: 'Crêpes', img: crepeImg, desc: 'Généreuse au chocolat.' },
  { id: 'c3', name: 'Crêpe Salée Jambon', price: 800, category: 'Crêpes', img: crepeImg, desc: 'Généreuse au chocolat.' },
  { id: 'c4', name: 'Crêpe Salée viande', price: 1000, category: 'Crêpes', img: crepeImg, desc: 'Généreuse au chocolat.' },
  
  { id: 'g1', name: 'Brownie Choco', price: 1000, category: 'Gaufres', img: migaImg, desc: 'Fondant intense.' },
  { id: 'g2', name: 'Gaufre Sucre', price: 1000, category: 'Gaufres', img: migaImg, desc: 'Croustillante.' },
  
  { id: 'f1', name: 'Flan Caramel', price: 1500, category: 'Flan', img: gateauImg, desc: 'Le classique fondant.' },
  
  { id: 'y1', name: 'Yaourt Naturel', price: 800, category: 'Yaourts', img: gateauImg, desc: 'Délicieux et rafraîchissant.' },
  { id: 'y2', name: 'Yaourt Framboise', price: 900, category: 'Yaourts', img: gateauImg, desc: 'Délicieux et rafraîchissant.' },
  
  { id: 'j1', name: 'Jus Pomme', price: 700, category: 'Jus', img: bissapImg, desc: 'Rafraîchissant et naturel.' },
  { id: 'j2', name: 'Jus Orange', price: 700, category: 'Jus', img: bissapImg, desc: 'Rafraîchissant et naturel.' },
  
  { id: 'mig1', name: 'Mini Pizza', price: 500, category: 'Mignardises', img: migaImg, desc: 'Garniture savoureuse.' },
  { id: 'mig2', name: 'Mini Burger', price: 600, category: 'Mignardises', img: migaImg, desc: 'Classique et efficace.' },
  { id: 'mig3', name: 'Mini Wrap Poulet', price: 500, category: 'Mignardises', img: migaImg, desc: 'Frais et léger.' },
  { id: 'mig4', name: 'Verrine Salée', price: 700, category: 'Mignardises', img: gateauImg, desc: 'Élégant et gourmand.' },
];

export const suggestionsData = {
  'Crêpes': [{ id: 'j1', name: 'Jus de Pomme', price: 700, img: bissapImg }],
  'Gaufres': [{ id: 'j3', name: 'Jus de Fraise', price: 700, img: bissapImg }],
  'Flan': [{ id: 'y2', name: 'Yaourt Vanille', price: 800, img: gateauImg }],
  'Yaourts': [{ id: 'j4', name: 'Jus de Mangue', price: 700, img: bissapImg }],
  'Jus': [{ id: 'm1', 'name': 'Mini Brownie', price: 500, img: migaImg }],
  'Mignardises': [{ id: 'j5', name: 'Jus de Bissap', price: 700, img: bissapImg }]
};

export const categories = ['Tout', 'Crêpes', 'Gaufres', 'Flan', 'Yaourts', 'Jus', 'Mignardises'];

export const PROMO_CODES = {
  'THY10': 0.10,
  'BIENVENUE': 0.15
};

export const DELIVERY_ZONES = [
  { name: 'Todman / Tokoin (Base)', price: 1000 },
  { name: 'Hedzranawoé', price: 1500 },
  { name: 'Kégué', price: 1500 },
  { name: 'Agbalépédogan', price: 2000 },
  { name: 'Agoè', price: 2500 },
  { name: 'Adidogomé', price: 2500 },
  { name: 'Baguida', price: 3000 },
  { name: 'Autre (À déterminer)', price: 0 }
];
