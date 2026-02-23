import React from 'react';

export default function ProductCard({ product, openModal, toggleFavorite, isFavorite }) {
  return (
    <div
      className="group relative cursor-pointer rounded-2xl sm:rounded-3xl border-none bg-white p-2 shadow-md sm:shadow-lg transition-transform duration-300 hover:-translate-y-1.5"
      onClick={() => openModal(product)}
    >
      <button 
        className="absolute right-2 top-2 z-10 rounded-full bg-black/20 p-2 backdrop-blur-[2px] transition-transform active:scale-90" 
        onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id) }}
      >
        <i className={`fa-heart text-lg ${isFavorite ? "fa-solid text-red-500" : "fa-solid text-white"}`}></i>
      </button>
      <img src={product.img} className="mb-2 h-28 sm:h-36 w-full rounded-xl sm:rounded-2xl object-cover" alt={product.name} />
      <div className="p-1">
        <h3 className="m-1 text-sm sm:text-base font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
        <span className="font-bold text-orange">{product.price}F</span>
      </div>
    </div>
  );
}
