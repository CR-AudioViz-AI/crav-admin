// ============================================================================
// CR AUDIOVIZ AI - CROSS-SELL UI COMPONENTS
// Embeddable promotion components for apps
// Created: 2025-11-25
// Version: 1.0.0
// ============================================================================

'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface CrossSellConfig {
  apiBaseUrl: string;
  sourceAppId: string;
  customerId?: string;
  theme: 'light' | 'dark';
  onError?: (error: Error) => void;
}

interface Recommendation {
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

// ============================================================================
// CONTEXT
// ============================================================================

const CrossSellContext = createContext<CrossSellConfig | null>(null);

export function CrossSellProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: CrossSellConfig;
}) {
  return (
    <CrossSellContext.Provider value={config}>
      {children}
    </CrossSellContext.Provider>
  );
}

function useCrossSellConfig(): CrossSellConfig {
  const context = useContext(CrossSellContext);
  if (!context) {
    return {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
      sourceAppId: process.env.NEXT_PUBLIC_APP_ID || '',
      theme: 'light',
    };
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function fetchRecommendations(
  config: CrossSellConfig,
  placementZone: string,
  limit: number
): Promise<Recommendation[]> {
  try {
    const params = new URLSearchParams({
      source_app_id: config.sourceAppId,
      placement_zone: placementZone,
      limit: String(limit),
    });

    if (config.customerId) {
      params.append('customer_id', config.customerId);
    }

    const response = await fetch(
      `${config.apiBaseUrl}/api/marketing/recommendations?${params}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    config.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    return [];
  }
}

async function trackImpression(config: CrossSellConfig, rec: Recommendation): Promise<void> {
  try {
    await fetch(`${config.apiBaseUrl}/api/marketing/events/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        impression_id: rec.metadata.impression_id,
        campaign_id: rec.metadata.campaign_id,
        source_app_id: config.sourceAppId,
        target_app_id: rec.target_app.app_id,
        customer_id: config.customerId,
      }),
    });
  } catch (error) {
    console.error('Failed to track impression:', error);
  }
}

async function trackClick(config: CrossSellConfig, rec: Recommendation): Promise<void> {
  try {
    await fetch(`${config.apiBaseUrl}/api/marketing/events/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        impression_id: rec.metadata.impression_id,
        campaign_id: rec.metadata.campaign_id,
        source_app_id: config.sourceAppId,
        target_app_id: rec.target_app.app_id,
        customer_id: config.customerId,
      }),
    });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
}

// ============================================================================
// SIDEBAR PROMOTION
// ============================================================================

interface SidebarPromotionProps {
  className?: string;
  maxItems?: number;
  title?: string;
}

export function SidebarPromotion({
  className = '',
  maxItems = 3,
  title = 'Recommended for You',
}: SidebarPromotionProps) {
  const config = useCrossSellConfig();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [impressionsSent, setImpressionsSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      setLoading(true);
      const recs = await fetchRecommendations(config, 'sidebar', maxItems);
      setRecommendations(recs);
      setLoading(false);
    }
    load();
  }, [config, maxItems]);

  // Track impressions
  useEffect(() => {
    recommendations.forEach((rec) => {
      if (!impressionsSent.has(rec.metadata.impression_id)) {
        trackImpression(config, rec);
        setImpressionsSent((prev) => new Set([...prev, rec.metadata.impression_id]));
      }
    });
  }, [recommendations, config, impressionsSent]);

  if (loading || recommendations.length === 0) return null;

  const isDark = config.theme === 'dark';

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      } ${className}`}
    >
      <h3
        className={`text-sm font-semibold mb-3 ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {title}
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <a
            key={rec.metadata.impression_id}
            href={rec.placement.destination_url}
            onClick={() => trackClick(config, rec)}
            className={`block p-3 rounded-lg transition-all hover:scale-[1.02] ${
              isDark
                ? 'bg-gray-750 hover:bg-gray-700 border border-gray-600'
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {rec.target_app.icon_url ? (
                <img
                  src={rec.target_app.icon_url}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {rec.target_app.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium text-sm truncate ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {rec.placement.headline}
                </h4>
                <p
                  className={`text-xs mt-0.5 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {rec.placement.body}
                </p>
                <span className="inline-block mt-2 text-xs text-blue-500 font-medium">
                  {rec.placement.cta} →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BANNER PROMOTION
// ============================================================================

interface BannerPromotionProps {
  className?: string;
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function BannerPromotion({
  className = '',
  position = 'top',
  dismissible = true,
  onDismiss,
}: BannerPromotionProps) {
  const config = useCrossSellConfig();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [impressionSent, setImpressionSent] = useState(false);

  useEffect(() => {
    async function load() {
      const recs = await fetchRecommendations(config, 'banner', 1);
      if (recs.length > 0) {
        setRecommendation(recs[0]);
      }
    }
    load();
  }, [config]);

  useEffect(() => {
    if (recommendation && !impressionSent) {
      trackImpression(config, recommendation);
      setImpressionSent(true);
    }
  }, [recommendation, config, impressionSent]);

  if (dismissed || !recommendation) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const isDark = config.theme === 'dark';

  return (
    <div
      className={`w-full px-4 py-3 ${
        isDark
          ? 'bg-gradient-to-r from-blue-900 to-purple-900'
          : 'bg-gradient-to-r from-blue-500 to-purple-500'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {recommendation.target_app.icon_url && (
            <img
              src={recommendation.target_app.icon_url}
              alt=""
              className="w-8 h-8 rounded-lg object-cover hidden sm:block"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm sm:text-base truncate">
              {recommendation.placement.headline}
            </p>
            <p className="text-white/80 text-xs sm:text-sm truncate hidden sm:block">
              {recommendation.placement.body}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={recommendation.placement.destination_url}
            onClick={() => trackClick(config, recommendation)}
            className="px-4 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            {recommendation.placement.cta}
          </a>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="p-1 text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL PROMOTION
// ============================================================================

interface ModalPromotionProps {
  isOpen: boolean;
  onClose: () => void;
  triggerEvent?: string;
  title?: string;
}

export function ModalPromotion({
  isOpen,
  onClose,
  triggerEvent,
  title = 'You Might Also Like',
}: ModalPromotionProps) {
  const config = useCrossSellConfig();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [impressionsSent, setImpressionsSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function load() {
        setLoading(true);
        const recs = await fetchRecommendations(config, 'modal', 3);
        setRecommendations(recs);
        setLoading(false);
      }
      load();
    }
  }, [isOpen, config]);

  useEffect(() => {
    if (isOpen && recommendations.length > 0 && !impressionsSent) {
      recommendations.forEach((rec) => trackImpression(config, rec));
      setImpressionsSent(true);
    }
  }, [isOpen, recommendations, config, impressionsSent]);

  if (!isOpen) return null;

  const isDark = config.theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md rounded-2xl shadow-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1 rounded-lg ${
              isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            ✕
          </button>

          <div className="p-6">
            <h2
              className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-sm mb-6 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Discover more tools to boost your productivity
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <a
                    key={rec.metadata.impression_id}
                    href={rec.placement.destination_url}
                    onClick={() => {
                      trackClick(config, rec);
                      onClose();
                    }}
                    className={`block p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                      isDark
                        ? 'bg-gray-750 border-gray-600 hover:border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {rec.target_app.icon_url ? (
                        <img
                          src={rec.target_app.icon_url}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {rec.target_app.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {rec.placement.headline}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {rec.placement.body}
                        </p>
                        <span className="inline-block mt-2 text-sm text-blue-500 font-medium">
                          {rec.placement.cta} →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div
            className={`px-6 py-4 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            }`}
          >
            <button
              onClick={onClose}
              className={`w-full py-2 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// IN-APP CARD
// ============================================================================

interface InAppCardProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

export function InAppCard({ className = '', variant = 'compact' }: InAppCardProps) {
  const config = useCrossSellConfig();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [impressionSent, setImpressionSent] = useState(false);

  useEffect(() => {
    async function load() {
      const recs = await fetchRecommendations(config, 'in-app', 1);
      if (recs.length > 0) {
        setRecommendation(recs[0]);
      }
    }
    load();
  }, [config]);

  useEffect(() => {
    if (recommendation && !impressionSent) {
      trackImpression(config, recommendation);
      setImpressionSent(true);
    }
  }, [recommendation, config, impressionSent]);

  if (!recommendation) return null;

  const isDark = config.theme === 'dark';

  if (variant === 'compact') {
    return (
      <a
        href={recommendation.placement.destination_url}
        onClick={() => trackClick(config, recommendation)}
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
        } ${className}`}
      >
        {recommendation.target_app.icon_url ? (
          <img
            src={recommendation.target_app.icon_url}
            alt=""
            className="w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {recommendation.target_app.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {recommendation.placement.headline}
          </p>
          <p className="text-xs text-blue-500">{recommendation.placement.cta} →</p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={recommendation.placement.destination_url}
      onClick={() => trackClick(config, recommendation)}
      className={`block p-4 rounded-xl transition-all hover:scale-[1.02] ${
        isDark
          ? 'bg-gray-800 border border-gray-700 hover:border-blue-500'
          : 'bg-white border border-gray-200 hover:border-blue-500 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-start gap-4">
        {recommendation.target_app.icon_url ? (
          <img
            src={recommendation.target_app.icon_url}
            alt=""
            className="w-14 h-14 rounded-xl object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            {recommendation.target_app.name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <h4
            className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {recommendation.placement.headline}
          </h4>
          <p
            className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {recommendation.placement.body}
          </p>
          <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            {recommendation.placement.cta}
          </button>
        </div>
      </div>
    </a>
  );
}

// ============================================================================
// FOOTER PROMOTION
// ============================================================================

interface FooterPromotionProps {
  className?: string;
}

export function FooterPromotion({ className = '' }: FooterPromotionProps) {
  const config = useCrossSellConfig();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [impressionsSent, setImpressionsSent] = useState(false);

  useEffect(() => {
    async function load() {
      const recs = await fetchRecommendations(config, 'footer', 4);
      setRecommendations(recs);
    }
    load();
  }, [config]);

  useEffect(() => {
    if (recommendations.length > 0 && !impressionsSent) {
      recommendations.forEach((rec) => trackImpression(config, rec));
      setImpressionsSent(true);
    }
  }, [recommendations, config, impressionsSent]);

  if (recommendations.length === 0) return null;

  const isDark = config.theme === 'dark';

  return (
    <div
      className={`py-8 ${
        isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t border-gray-200'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Explore More Tools
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((rec) => (
            <a
              key={rec.metadata.impression_id}
              href={rec.placement.destination_url}
              onClick={() => trackClick(config, rec)}
              className={`p-4 rounded-xl transition-all hover:scale-105 ${
                isDark
                  ? 'bg-gray-800 border border-gray-700 hover:border-blue-500'
                  : 'bg-white border border-gray-200 hover:border-blue-500 shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {rec.target_app.icon_url ? (
                  <img
                    src={rec.target_app.icon_url}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover mb-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mb-3">
                    {rec.target_app.name.charAt(0)}
                  </div>
                )}
                <h4
                  className={`font-medium text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {rec.target_app.name}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {rec.target_app.category}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD WIDGET
// ============================================================================

interface DashboardWidgetProps {
  className?: string;
  title?: string;
  maxItems?: number;
}

export function DashboardWidget({
  className = '',
  title = 'Recommended Apps',
  maxItems = 3,
}: DashboardWidgetProps) {
  const config = useCrossSellConfig();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [impressionsSent, setImpressionsSent] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const recs = await fetchRecommendations(config, 'dashboard', maxItems);
      setRecommendations(recs);
      setLoading(false);
    }
    load();
  }, [config, maxItems]);

  useEffect(() => {
    if (recommendations.length > 0 && !impressionsSent) {
      recommendations.forEach((rec) => trackImpression(config, rec));
      setImpressionsSent(true);
    }
  }, [recommendations, config, impressionsSent]);

  const isDark = config.theme === 'dark';

  return (
    <div
      className={`rounded-xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${className}`}
    >
      <div
        className={`px-4 py-3 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <h3
          className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {title}
        </h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recommendations.length === 0 ? (
          <p
            className={`text-sm text-center py-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            No recommendations available
          </p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <a
                key={rec.metadata.impression_id}
                href={rec.placement.destination_url}
                onClick={() => trackClick(config, rec)}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                }`}
              >
                {rec.target_app.icon_url ? (
                  <img
                    src={rec.target_app.icon_url}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {rec.target_app.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {rec.target_app.name}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {rec.placement.headline}
                  </p>
                </div>
                <span className="text-blue-500 text-sm">→</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div
        className={`px-4 py-3 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <a
          href="/apps"
          className={`text-sm ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          } hover:underline`}
        >
          View all apps →
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  CrossSellContext,
  useCrossSellConfig,
  trackImpression,
  trackClick,
};
