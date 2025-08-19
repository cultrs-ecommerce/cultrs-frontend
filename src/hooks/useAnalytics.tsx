import React, { createContext, useContext, ReactNode } from 'react';
import { trackProductView as trackView } from '../lib/analytics';
import * as queries from '../lib/analyticsQueries';

interface AnalyticsContextType {
  trackProductView: (userId: string, productId: string) => void;
  getUserAnalyticsSummary: typeof queries.getUserAnalyticsSummary;
  getUserProductHistory: typeof queries.getUserProductHistory;
  getUserRecentlyViewedProducts: typeof queries.getUserRecentlyViewedProducts;
  getProductAnalytics: typeof queries.getProductAnalytics;
  getProductTopViewers: typeof queries.getProductTopViewers;
  getTrendingProducts: typeof queries.getTrendingProducts;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const value = {
    trackProductView: trackView,
    getUserAnalyticsSummary: queries.getUserAnalyticsSummary,
    getUserProductHistory: queries.getUserProductHistory,
    getUserRecentlyViewedProducts: queries.getUserRecentlyViewedProducts,
    getProductAnalytics: queries.getProductAnalytics,
    getProductTopViewers: queries.getProductTopViewers,
    getTrendingProducts: queries.getTrendingProducts,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
