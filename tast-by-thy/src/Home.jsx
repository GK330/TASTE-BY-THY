import React from 'react';
import logoImg from './image/logo.jpg';
import crepeImg from './image/crepe.jfif';
import bissapImg from './image/bissap.jfif';
import gateauImg from './image/gateau.jfif';
import migaImg from './image/miga.jfif';

export default function Home({ onNavigate }) {
  return (
    <div>
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-[8%] py-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="h-11 w-11 rounded-full object-cover" />
          <span className="font-fredoka text-xl">Taste By Thy</span>
        </div>
        <ul className="flex list-none gap-8">
          <li><a onClick={() => onNavigate('home')} className="cursor-pointer font-semibold">Accueil</a></li>
          <li><a onClick={() => onNavigate('menu')} className="cursor-pointer font-semibold">Menu</a></li>
        </ul>
      </nav>

      <header className="flex min-h-[80vh] flex-col items-center justify-between gap-10 px-[8%] py-16 lg:flex-row">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-8 flex items-center justify-center gap-5 lg:justify-start">
            <img src={logoImg} alt="Logo" className="h-[110px] w-[110px] rounded-full border-4 border-marron object-cover p-1 shadow-lg" />
            <div>
              <h1 className="font-fredoka text-4xl">Taste By Thy</h1>
              <em className="text-lg text-orange">Eat your feelings...</em>
            </div>
          </div>

          <div>
            <h2 className="mb-5 font-fredoka text-5xl leading-tight">L'art de la gourmandise<br />créative.</h2>
            <p className="mx-auto mb-8 max-w-[450px] text-base opacity-80 lg:mx-0">Bienvenue dans notre univers sucré où chaque bouchée raconte une histoire. Découvrez nos gaufres, brownies et créations uniques.</p>
            <div className="mb-4 flex flex-wrap justify-center gap-4 lg:justify-start">
              <button onClick={() => onNavigate('menu')} className="cursor-pointer rounded-full bg-marron px-8 py-4 font-semibold text-white transition-all hover:bg-orange hover:-translate-y-1">Découvrir le Menu</button>
              <button onClick={() => onNavigate('events')} className="cursor-pointer rounded-full border-2 border-marron bg-white px-8 py-4 font-semibold text-marron transition-all hover:bg-gray-50 hover:-translate-y-1">Événements & Devis</button>
            </div>
            <small className="opacity-70">Fait maison à Lomé • Commande simple par WhatsApp • Goût inoubliable</small>
          </div>
        </div>

        <div className="relative grid flex-1 grid-cols-2 gap-5 p-5 lg:flex-1.2">
          <div className="rounded-md bg-white p-2.5 pb-10 shadow-xl transition-transform duration-300 hover:z-10 hover:scale-105 hover:rotate-0 lg:-rotate-6"><img src={crepeImg} alt="Brownie" className="h-[180px] w-full rounded-sm object-cover" /></div>
          <div className="mt-8 rounded-md bg-white p-2.5 pb-10 shadow-xl transition-transform duration-300 hover:z-10 hover:scale-105 hover:rotate-0 lg:rotate-[4deg]"><img src={bissapImg} alt="Gaufre" className="h-[180px] w-full rounded-sm object-cover" /></div>
          <div className="-mt-5 rounded-md bg-white p-2.5 pb-10 shadow-xl transition-transform duration-300 hover:z-10 hover:scale-105 hover:rotate-0 lg:rotate-3"><img src={gateauImg} alt="Flan" className="h-[180px] w-full rounded-sm object-cover" /></div>
          <div className="rounded-md bg-white p-2.5 pb-10 shadow-xl transition-transform duration-300 hover:z-10 hover:scale-105 hover:rotate-0 lg:-rotate-[4deg]"><img src={migaImg} alt="Crêpe" className="h-[180px] w-full rounded-sm object-cover" /></div>
        </div>
      </header>

      <footer className="mt-12 rounded-t-[40px] bg-marron px-[8%] py-10 text-white">
        <div className="flex flex-col items-center justify-between gap-12 text-center lg:flex-row lg:text-left">
          <div>
            <h3 className="mb-4 font-fredoka text-3xl">
              Réseaux sociaux & localisation
            </h3>
            <div className="flex justify-center gap-4 lg:justify-start">
              <a href="https://wa.me/22899434943" className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl transition-colors duration-300 hover:bg-[#25D366]">
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a href="https://www.instagram.com/j_anieeee?igsh=cTA5eW03OGpjcHk5" className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl transition-colors duration-300 hover:bg-[#E1306C]">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.tiktok.com/@tastebythy?_r=1&_t=ZS-93cinVxddJ4" className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl transition-colors duration-300 hover:bg-black">
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href="https://snapchat.com/t/5Pyfmr5E" className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors duration-300 hover:bg-[#FFFC00] hover:text-black">
                <i className="fa-brands fa-snapchat"></i>
              </a>
            </div>
          </div>

          <div className="h-[180px] max-w-[450px] flex-1 overflow-hidden rounded-3xl border-4 border-white/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d1.2223!3d6.1319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMDcnNTQuOCJOIDHCsDEzJzIwLjMiRQ!5e0!3m2!1sfr!2stg!4v1634567890123!5m2!1sfr!2stg"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </footer>
    </div>
  );
}