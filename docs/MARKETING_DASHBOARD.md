# CR AudioViz AI - Marketing & Cross-Sell Dashboard

> **Version:** 2.0.0 | **Created:** November 25, 2025 | **Status:** Production Ready

A complete, investor-grade marketing dashboard with cross-sell engine, A/B testing, funnel visualization, third-party advertiser management, and real-time analytics. Built mobile-first with Fortune 50 quality standards.

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Quick Start](#-quick-start)
3. [Components](#-components)
4. [API Reference](#-api-reference)
5. [Integration Guide](#-integration-guide)
6. [Configuration](#-configuration)
7. [Database Schema](#-database-schema)
8. [Helpdesk & Support](#-helpdesk--support)

---

## ✨ Features

### Core Marketing Dashboard
- **📊 Overview Tab** - Health score, KPIs, revenue attribution, funnel metrics
- **🎯 Campaigns Tab** - Create, manage, pause/activate campaigns
- **📱 Apps Tab** - App leaderboard with A-F ratings, cross-sell toggles
- **💼 Advertisers Tab** - Third-party advertiser approval workflow
- **🧪 A/B Tests Tab** - Statistical testing with confidence levels
- **🔄 Funnel Tab** - Visual funnel with stage-by-stage conversion rates
- **🔔 Alerts Tab** - Real-time notifications and warnings
- **⚙️ Settings Tab** - Configuration and preferences

### Cross-Sell Components
- `SidebarPromotion` - Sidebar widget for app recommendations
- `BannerPromotion` - Top/bottom page banners
- `ModalPromotion` - Triggered promotional modals
- `InAppCard` - Embedded content cards
- `FooterPromotion` - Footer recommendation grid
- `DashboardWidget` - Dashboard recommendation widget

### Advanced Features
- ✅ Mobile-first responsive design
- ✅ Dark mode support
- ✅ Real-time analytics tracking
- ✅ Multi-touch attribution
- ✅ Revenue breakdown by channel
- ✅ Automatic impression/click tracking
- ✅ A/B testing with statistical significance
- ✅ Third-party advertiser portal
- ✅ Helpdesk integration links

---

## 🚀 Quick Start

### Installation

```bash
# Copy components to your project
cp -r marketing-dashboard/src/components/admin/* your-project/src/components/admin/
cp -r marketing-dashboard/src/components/cross-sell/* your-project/src/components/cross-sell/
cp -r marketing-dashboard/src/hooks/* your-project/src/hooks/
```

### Basic Usage

```tsx
// In your admin dashboard
import { MarketingDashboardCard } from '@/components/admin/MarketingDashboardCard';

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1>Admin Dashboard</h1>
      
      {/* Marketing card - expands to full dashboard */}
      <MarketingDashboardCard 
        apiBaseUrl="https://api.craudiovizai.com"
        defaultExpanded={false}
      />
    </div>
  );
}
```

### Add Cross-Sell to Apps

```tsx
// In your app layout
import { 
  CrossSellProvider, 
  SidebarPromotion,
  BannerPromotion 
} from '@/components/cross-sell/CrossSellComponents';

export default function AppLayout({ children }) {
  const config = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
    sourceAppId: 'APPX-market-oracle',
    theme: 'light',
  };

  return (
    <CrossSellProvider config={config}>
      <BannerPromotion position="top" dismissible />
      
      <div className="flex">
        <main className="flex-1">{children}</main>
        <aside className="w-80 p-4">
          <SidebarPromotion maxItems={3} />
        </aside>
      </div>
    </CrossSellProvider>
  );
}
```

---

## 📦 Components

### MarketingDashboardCard

The main admin dashboard card component.

```tsx
interface MarketingDashboardCardProps {
  apiBaseUrl?: string;      // API base URL
  className?: string;        // Additional CSS classes
  defaultExpanded?: boolean; // Start expanded
}
```

**Tabs:**
| Tab | Description |
|-----|-------------|
| Overview | KPIs, health score, revenue breakdown |
| Campaigns | Campaign management and creation |
| Apps | App leaderboard and ratings |
| Advertisers | Third-party advertiser management |
| A/B Tests | Statistical testing dashboard |
| Funnel | Marketing funnel visualization |
| Alerts | Notifications and warnings |
| Settings | Configuration options |

### Cross-Sell Components

#### SidebarPromotion
```tsx
<SidebarPromotion 
  maxItems={3}
  title="Recommended for You"
  className="my-4"
/>
```

#### BannerPromotion
```tsx
<BannerPromotion 
  position="top"
  dismissible={true}
  onDismiss={() => console.log('Banner dismissed')}
/>
```

#### ModalPromotion
```tsx
<ModalPromotion 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="You Might Also Like"
/>
```

#### InAppCard
```tsx
<InAppCard 
  variant="compact" // or "detailed"
  className="my-4"
/>
```

#### FooterPromotion
```tsx
<FooterPromotion />
```

#### DashboardWidget
```tsx
<DashboardWidget 
  title="Recommended Apps"
  maxItems={3}
/>
```

---

## 📡 API Reference

### Recommendations

```
GET /api/marketing/recommendations
  ?source_app_id=APPX-xxx
  &placement_zone=sidebar|banner|modal|in-app|footer|dashboard
  &customer_id=CUST-xxx (optional)
  &limit=3
```

**Response:**
```json
{
  "recommendations": [
    {
      "target_app": {
        "app_id": "APPX-001",
        "name": "Market Oracle",
        "slug": "market-oracle",
        "icon_url": "https://...",
        "category": "Finance"
      },
      "placement": {
        "headline": "Track AI Stock Picks",
        "body": "See which AI models are winning...",
        "cta": "Try Free",
        "destination_url": "https://..."
      },
      "metadata": {
        "impression_id": "IMP-xxx",
        "campaign_id": "CMP-xxx",
        "relevance_score": 0.92
      }
    }
  ]
}
```

### Events

```
POST /api/marketing/events/impression
POST /api/marketing/events/click
POST /api/marketing/events/conversion
```

**Body:**
```json
{
  "impression_id": "IMP-xxx",
  "campaign_id": "CMP-xxx",
  "source_app_id": "APPX-001",
  "target_app_id": "APPX-002",
  "customer_id": "CUST-xxx",
  "conversion_value": 29.99
}
```

### Campaigns

```
GET    /api/marketing/campaigns
GET    /api/marketing/campaigns/:id
POST   /api/marketing/campaigns
PATCH  /api/marketing/campaigns/:id
POST   /api/marketing/campaigns/:id/activate
POST   /api/marketing/campaigns/:id/pause
```

### Analytics

```
GET /api/marketing/analytics/dashboard
GET /api/marketing/analytics/leaderboard
GET /api/marketing/analytics/cross-sell?start_date=&end_date=
```

### Ratings

```
POST /api/marketing/ratings/update/:appId
POST /api/marketing/ratings/update-all
```

---

## 🔧 Integration Guide

### Step 1: Add to Admin Dashboard

```tsx
// pages/admin/index.tsx
import { MarketingDashboardCard } from '@/components/admin/MarketingDashboardCard';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Other dashboard cards... */}
      
      <MarketingDashboardCard 
        apiBaseUrl={process.env.NEXT_PUBLIC_API_URL}
      />
    </div>
  );
}
```

### Step 2: Set Up Cross-Sell Provider

```tsx
// app/providers.tsx
import { CrossSellProvider } from '@/components/cross-sell/CrossSellComponents';

export function Providers({ children }: { children: React.ReactNode }) {
  const crossSellConfig = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
    sourceAppId: process.env.NEXT_PUBLIC_APP_ID!,
    theme: 'light' as const,
  };

  return (
    <CrossSellProvider config={crossSellConfig}>
      {children}
    </CrossSellProvider>
  );
}
```

### Step 3: Add Cross-Sell Components

```tsx
// In sidebar
<SidebarPromotion maxItems={3} />

// At page top
<BannerPromotion position="top" />

// After signup/purchase
<ModalPromotion isOpen={showUpsell} onClose={() => setShowUpsell(false)} />

// In content area
<InAppCard variant="detailed" />

// In footer
<FooterPromotion />

// In dashboard widgets
<DashboardWidget title="Try These Apps" />
```

### Step 4: Track Custom Conversions

```tsx
import { useCrossSell } from '@/hooks/useCrossSell';

function PurchaseComplete({ recommendation }) {
  const { trackConversion } = useCrossSell();
  
  useEffect(() => {
    // Track the conversion with revenue
    trackConversion(recommendation, 49.99);
  }, []);
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=https://api.craudiovizai.com
NEXT_PUBLIC_APP_ID=APPX-your-app-id

# Optional
NEXT_PUBLIC_CUSTOMER_ID=CUST-xxx  # For personalization
```

### Theme Configuration

```tsx
const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  sourceAppId: 'APPX-001',
  customerId: user?.id,
  theme: isDarkMode ? 'dark' : 'light',
  onError: (error) => console.error('Cross-sell error:', error),
};
```

---

## 🗄️ Database Schema

### Required Tables

```sql
-- Core marketing tables (see migration file for complete schema)
marketing_campaigns
marketing_campaign_creatives
marketing_placements
marketing_events
marketing_app_ratings
marketing_advertisers
marketing_ab_tests
marketing_ab_test_variants
```

### Views

```sql
-- Analytics views
dashboard_summary
app_leaderboard
cross_sell_performance
funnel_metrics
```

---

## 🎧 Helpdesk & Support

### Documentation Links
- 📖 **Full Docs:** https://docs.craudiovizai.com/marketing
- 🎬 **Tutorials:** https://docs.craudiovizai.com/marketing/tutorials
- 🔌 **API Reference:** https://docs.craudiovizai.com/api/marketing

### Support Channels
- 🎧 **Helpdesk:** https://support.craudiovizai.com
- 💬 **Slack:** #marketing-support
- 📧 **Email:** support@craudiovizai.com

### Common Issues

| Issue | Solution |
|-------|----------|
| No recommendations showing | Check `sourceAppId` is correct |
| Impressions not tracking | Verify API endpoint is accessible |
| Dark mode not working | Pass `theme: 'dark'` in config |
| Mobile layout broken | Ensure Tailwind responsive classes |

---

## 📊 Metrics & KPIs

### Key Metrics Tracked

| Metric | Description |
|--------|-------------|
| Impressions | Promotion views across all apps |
| Clicks | Click-throughs to promoted apps |
| Conversions | Successful cross-sell purchases |
| CTR | Click-through rate (clicks/impressions) |
| Conversion Rate | Conversions/clicks |
| Revenue | Total cross-sell + ad revenue |
| ROAS | Return on ad spend |
| Health Score | Overall marketing performance (0-100) |

### Attribution Channels

- **Organic** - SEO, direct traffic
- **Paid** - Ad campaigns, PPC
- **Referral** - Partner links, affiliates
- **Direct** - Direct navigation

---

## 🚀 Deployment Checklist

- [ ] API endpoints deployed and accessible
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Cross-sell provider wrapped around apps
- [ ] Admin dashboard card integrated
- [ ] Impression tracking verified
- [ ] Click tracking verified
- [ ] Conversion tracking verified
- [ ] Mobile responsiveness tested
- [ ] Dark mode tested
- [ ] Error handling confirmed

---

## 📝 Changelog

### v2.0.0 (2025-11-25)
- ✨ Complete rewrite with investor-grade UI
- ✨ Added A/B testing dashboard
- ✨ Added funnel visualization
- ✨ Added third-party advertiser management
- ✨ Added real-time alerts
- ✨ Mobile-first responsive design
- ✨ Dark mode support
- ✨ Multi-touch attribution
- ✨ Comprehensive analytics

### v1.0.0 (2025-11-24)
- 🎉 Initial release

---

## 📄 License

Proprietary - CR AudioViz AI, LLC. All rights reserved.

---

**Built with ❤️ by CR AudioViz AI Engineering Team**

*"Your Story. Our Design."*
