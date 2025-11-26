// ============================================================================
// CR AUDIOVIZ AI - USE CROSS-SELL HOOK
// Custom hook for marketing and cross-sell functionality
// Created: 2025-11-25
// Version: 1.0.0
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface MarketingRecommendation {
  target_app: {
    app_id: string;
    name: string;
    slug: string;
    icon_url?: string;
    category: string;
  };
  placement: {
    headline: string;
    body: string;
    cta: string;
    destination_url: string;
    image_url?: string;
  };
  metadata: {
    impression_id: string;
    campaign_id?: string;
    relevance_score: number;
  };
}

export interface CrossSellConfig {
  apiBaseUrl: string;
  sourceAppId: string;
  customerId?: string;
  placementZone: 'sidebar' | 'banner' | 'modal' | 'in-app' | 'footer' | 'dashboard';
  limit?: number;
  theme?: 'light' | 'dark';
}

export interface UseCrossSellOptions {
  placementZone?: CrossSellConfig['placementZone'];
  limit?: number;
  enabled?: boolean;
}

export interface UseCrossSellReturn {
  recommendations: MarketingRecommendation[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  trackImpression: (recommendation: MarketingRecommendation) => Promise<void>;
  trackClick: (recommendation: MarketingRecommendation) => Promise<void>;
  trackConversion: (recommendation: MarketingRecommendation, conversionValue?: number) => Promise<void>;
}

// ============================================================================
// CONTEXT CONFIG (to be provided by CrossSellProvider)
// ============================================================================

const DEFAULT_CONFIG: CrossSellConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  sourceAppId: process.env.NEXT_PUBLIC_APP_ID || '',
  placementZone: 'sidebar',
  limit: 3,
  theme: 'light',
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useCrossSell(options: UseCrossSellOptions = {}): UseCrossSellReturn {
  const {
    placementZone = 'sidebar',
    limit = 3,
    enabled = true,
  } = options;

  const [recommendations, setRecommendations] = useState<MarketingRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        source_app_id: DEFAULT_CONFIG.sourceAppId,
        placement_zone: placementZone,
        limit: String(limit),
      });

      if (DEFAULT_CONFIG.customerId) {
        params.append('customer_id', DEFAULT_CONFIG.customerId);
      }

      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/recommendations?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [placementZone, limit, enabled]);

  // Track impression
  const trackImpression = useCallback(async (recommendation: MarketingRecommendation) => {
    try {
      await fetch(`${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/events/impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impression_id: recommendation.metadata.impression_id,
          campaign_id: recommendation.metadata.campaign_id,
          source_app_id: DEFAULT_CONFIG.sourceAppId,
          target_app_id: recommendation.target_app.app_id,
          customer_id: DEFAULT_CONFIG.customerId,
          placement_zone: placementZone,
        }),
      });
    } catch (err) {
      console.error('Failed to track impression:', err);
    }
  }, [placementZone]);

  // Track click
  const trackClick = useCallback(async (recommendation: MarketingRecommendation) => {
    try {
      await fetch(`${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/events/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impression_id: recommendation.metadata.impression_id,
          campaign_id: recommendation.metadata.campaign_id,
          source_app_id: DEFAULT_CONFIG.sourceAppId,
          target_app_id: recommendation.target_app.app_id,
          customer_id: DEFAULT_CONFIG.customerId,
          placement_zone: placementZone,
        }),
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }
  }, [placementZone]);

  // Track conversion
  const trackConversion = useCallback(async (
    recommendation: MarketingRecommendation,
    conversionValue?: number
  ) => {
    try {
      await fetch(`${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/events/conversion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impression_id: recommendation.metadata.impression_id,
          campaign_id: recommendation.metadata.campaign_id,
          source_app_id: DEFAULT_CONFIG.sourceAppId,
          target_app_id: recommendation.target_app.app_id,
          customer_id: DEFAULT_CONFIG.customerId,
          conversion_value: conversionValue || 0,
        }),
      });
    } catch (err) {
      console.error('Failed to track conversion:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    trackImpression,
    trackClick,
    trackConversion,
  };
}

// ============================================================================
// ANALYTICS HOOK
// ============================================================================

export interface MarketingAnalytics {
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  ctr: number;
  conversion_rate: number;
  revenue_per_conversion: number;
}

export interface UseMarketingAnalyticsOptions {
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  appId?: string;
}

export function useMarketingAnalytics(options: UseMarketingAnalyticsOptions = {}) {
  const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);
      if (options.campaignId) params.append('campaign_id', options.campaignId);
      if (options.appId) params.append('app_id', options.appId);

      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/analytics/dashboard?${params}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.startDate, options.endDate, options.campaignId, options.appId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

// ============================================================================
// CAMPAIGNS HOOK
// ============================================================================

export interface Campaign {
  campaign_id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  campaign_type: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export function useMarketingCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/campaigns`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (campaignData: Partial<Campaign>) => {
    try {
      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/campaigns`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create campaign: ${response.statusText}`);
      }

      await fetchCampaigns();
      return await response.json();
    } catch (err) {
      throw err;
    }
  }, [fetchCampaigns]);

  const updateCampaign = useCallback(async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/campaigns/${campaignId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update campaign: ${response.statusText}`);
      }

      await fetchCampaigns();
      return await response.json();
    } catch (err) {
      throw err;
    }
  }, [fetchCampaigns]);

  const toggleCampaign = useCallback(async (campaignId: string, action: 'activate' | 'pause') => {
    try {
      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/campaigns/${campaignId}/${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} campaign: ${response.statusText}`);
      }

      await fetchCampaigns();
    } catch (err) {
      throw err;
    }
  }, [fetchCampaigns]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    createCampaign,
    updateCampaign,
    toggleCampaign,
  };
}

// ============================================================================
// APP LEADERBOARD HOOK
// ============================================================================

export interface AppLeaderboardEntry {
  app_id: string;
  name: string;
  slug: string;
  rating: string;
  rating_score: number;
  mrr: number;
  active_users: number;
  cross_sell_enabled: boolean;
}

export function useAppLeaderboard() {
  const [apps, setApps] = useState<AppLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/analytics/leaderboard`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const data = await response.json();
      setApps(data.apps || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRatings = useCallback(async () => {
    try {
      const response = await fetch(
        `${DEFAULT_CONFIG.apiBaseUrl}/api/marketing/ratings/update-all`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update ratings: ${response.statusText}`);
      }

      await fetchLeaderboard();
    } catch (err) {
      throw err;
    }
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { apps, loading, error, refetch: fetchLeaderboard, updateRatings };
}

export default useCrossSell;
