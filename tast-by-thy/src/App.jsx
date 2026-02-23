import React, { useState } from 'react';
import Home from './Home';
import Menu from './Menu';
import Events from './Events';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="font-poppins bg-bg-soft text-marron">
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
      {currentPage === 'menu' && <Menu onNavigate={setCurrentPage} />}
      {currentPage === 'events' && <Events onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App
