# Marketing Dashboard Integration Guide

> **For:** CR AudioViz AI Development Team  
> **Version:** 2.0.0  
> **Updated:** November 25, 2025

---

## 🎯 Quick Integration Checklist

### Admin Dashboard Integration (5 minutes)

```tsx
// 1. Import the component
import { MarketingDashboardCard } from '@/components/admin/MarketingDashboardCard';

// 2. Add to your admin dashboard layout
<MarketingDashboardCard apiBaseUrl={process.env.NEXT_PUBLIC_API_URL} />
```

**That's it!** The card handles everything internally.

---

### App Cross-Sell Integration (10 minutes)

#### Step 1: Wrap your app with the provider

```tsx
// app/layout.tsx or _app.tsx
import { CrossSellProvider } from '@/components/cross-sell/CrossSellComponents';

export default function RootLayout({ children }) {
  return (
    <CrossSellProvider config={{
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
      sourceAppId: 'APPX-your-app-id',
      theme: 'light',
    }}>
      {children}
    </CrossSellProvider>
  );
}
```

#### Step 2: Add promotion components where needed

```tsx
// In your sidebar
import { SidebarPromotion } from '@/components/cross-sell/CrossSellComponents';
<SidebarPromotion maxItems={3} />

// At page top
import { BannerPromotion } from '@/components/cross-sell/CrossSellComponents';
<BannerPromotion dismissible />

// In dashboard
import { DashboardWidget } from '@/components/cross-sell/CrossSellComponents';
<DashboardWidget title="Recommended Apps" />
```

---

## 📁 File Structure

```
marketing-dashboard/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── MarketingDashboardCard.tsx    # Main dashboard card
│   │   │   └── modals/
│   │   │       ├── CreateCampaignModal.tsx   # Campaign creation
│   │   │       └── CreateABTestModal.tsx     # A/B test creation
│   │   └── cross-sell/
│   │       └── CrossSellComponents.tsx       # All promo components
│   ├── hooks/
│   │   └── useCrossSell.ts                   # Cross-sell hooks
│   └── index.ts                              # Main exports
└── README.md                                  # Full documentation
```

---

## 🔌 Required API Endpoints

Your backend needs these endpoints:

### Recommendations
```
GET /api/marketing/recommendations
  ?source_app_id=APPX-xxx
  &placement_zone=sidebar
  &limit=3
```

### Events
```
POST /api/marketing/events/impression
POST /api/marketing/events/click
POST /api/marketing/events/conversion
```

### Campaigns
```
GET    /api/marketing/campaigns
POST   /api/marketing/campaigns
PATCH  /api/marketing/campaigns/:id
POST   /api/marketing/campaigns/:id/activate
POST   /api/marketing/campaigns/:id/pause
```

### Analytics
```
GET /api/marketing/analytics/dashboard
GET /api/marketing/analytics/leaderboard
```

---

## 🎨 Styling Notes

- Uses **Tailwind CSS** - no additional CSS required
- Fully responsive (mobile-first)
- Dark mode via `theme: 'dark'` in config
- All colors use Tailwind defaults

### Dark Mode Example

```tsx
const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL!,
  sourceAppId: 'APPX-001',
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
};
```

---

## ⚡ Performance Tips

1. **Lazy load the dashboard card**
   ```tsx
   const MarketingDashboard = dynamic(
     () => import('@/components/admin/MarketingDashboardCard'),
     { ssr: false }
   );
   ```

2. **Use intersection observer for footer promos**
   ```tsx
   // Only load when visible
   const [isVisible, setIsVisible] = useState(false);
   {isVisible && <FooterPromotion />}
   ```

3. **Cache recommendations**
   - API should cache for 5 minutes
   - Use SWR or React Query for client caching

---

## 🔧 Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.craudiovizai.com
NEXT_PUBLIC_APP_ID=APPX-your-app-id
```

---

## 🐛 Troubleshooting

### "No recommendations showing"
- Check `sourceAppId` matches database
- Verify API endpoint returns data
- Check browser console for errors

### "Tracking not working"
- Verify POST endpoints are accessible
- Check CORS settings
- Ensure customer_id is passed if required

### "Styles look wrong"
- Ensure Tailwind is configured
- Check for CSS conflicts
- Verify dark mode class is applied

---

## 📞 Support

- **Docs:** https://docs.craudiovizai.com/marketing
- **Slack:** #dev-marketing
- **Email:** dev@craudiovizai.com

---

**Integration takes ~15 minutes. Questions? Ask in #dev-marketing**
