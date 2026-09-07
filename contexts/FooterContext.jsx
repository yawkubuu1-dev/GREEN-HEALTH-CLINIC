import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const FooterContext = createContext();

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
};

export const FooterProvider = ({ children }) => {
  // Initialize state from localStorage (web) or default to expanded
  const [isFooterExpanded, setIsFooterExpanded] = useState(() => {
    if (Platform.OS === 'web') {
      try {
        const stored = localStorage.getItem('footerExpanded');
        return stored !== null ? JSON.parse(stored) : true; // Default to expanded
      } catch (error) {
        console.error('Failed to read footer state from localStorage:', error);
        return true; // Default to expanded on error
      }
    }
    return true; // Default to expanded on native
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('footerExpanded', JSON.stringify(isFooterExpanded));
      } catch (error) {
        console.error('Failed to save footer state to localStorage:', error);
      }
    }
  }, [isFooterExpanded]);

  const toggleFooter = () => {
    setIsFooterExpanded(prev => !prev);
  };

  const value = {
    isFooterExpanded,
    toggleFooter,
    setIsFooterExpanded
  };

  return (
    <FooterContext.Provider value={value}>
      {children}
    </FooterContext.Provider>
  );
};