import React, { useState, useEffect } from 'react';
import { RouterProvider, Route } from './components/Router';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Storefront from './components/Storefront';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Synchronize document dir direction attribute and HTML body font styles
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
    
    // Set appropriate font family
    if (lang === 'fa') {
      root.style.fontFamily = '"Inter", system-ui, sans-serif';
    } else {
      root.style.fontFamily = '"Inter", sans-serif';
    }
  }, [lang]);

  // Synchronize dark class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0a0a0a';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f9f9f9';
    }
  }, [darkMode]);

  return (
    <RouterProvider>
      {/* 1. Landing Page Routing */}
      <Route 
        pattern="/" 
        element={
          <LandingPage 
            lang={lang} 
            setLang={setLang} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />
        } 
      />

      {/* 2. Merchant Dashboard Subrouting */}
      <Route 
        pattern="/dashboard/*" 
        element={
          <Dashboard 
            lang={lang} 
            setLang={setLang} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />
        } 
      />

      {/* 3. Customer Storefront Route */}
      <Route 
        pattern="/shop/:shop_slug/product/:product_id" 
        element={
          <Storefront 
            lang={lang} 
            setLang={setLang} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />
        } 
      />
    </RouterProvider>
  );
}
