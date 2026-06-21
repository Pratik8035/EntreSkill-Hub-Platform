import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/ai-mentor');

  return (
    <div className={`min-h-screen flex flex-col ${isChatPage ? 'h-screen overflow-hidden' : ''}`}>
      <Navbar />

      <main className={`flex-grow flex flex-col ${isChatPage ? 'min-h-0 overflow-hidden' : ''}`}>
        {children}
      </main>

      {!isChatPage && <Footer />}
    </div>
  );
};

export default PageWrapper;
