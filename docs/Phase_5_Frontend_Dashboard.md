# Phase 5: Frontend Dashboard

> **Duration**: ~4 hours | **Focus**: React UI, glassmorphism design system, auth flow, CRUD interface

---

## Objective
Build a premium, responsive React dashboard that showcases seamless API integration, modern UI patterns, and a polished user experience worthy of a production SaaS application.

## What Was Built

### Design System
A comprehensive CSS custom property system serving as a single source of truth for the entire UI:

```css
:root {
  --primary: #6c5ce7;
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --radius-md: 12px;
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```
Changing a single variable updates the entire application's appearance — enabling rapid theme iteration.

### Glassmorphism UI
Every card and panel uses frosted-glass effects:
- `backdrop-filter: blur(20px)` for depth
- Semi-transparent backgrounds with subtle borders
- Layered shadows creating a floating appearance
- Dark theme optimized for extended screen time

### Authentication Pages
- **Login Page**: Animated floating particles, glass card with smooth entrance animation, icon-prefixed inputs
- **Register Page**: Role selection (User/Admin), password strength hints, matching visual language
- **Auto-Refresh**: Axios interceptors silently renew access tokens when they expire, preventing session interruptions

### Protected Routing
```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```
- Unauthenticated users are redirected to `/login`
- Admin-only routes check `user.role === 'ADMIN'`
- Loading states prevent flash-of-unauthorized-content

### Dashboard Overview
- **Stat Cards**: Animated counters showing total assets, active assets, user count (admin only), and current role
- **Recent Assets Table**: Last 5 crypto assets with category badges, volume formatting, and status indicators
- **Staggered Animations**: Cards appear sequentially using Framer Motion's `custom` delay prop

### Crypto Assets Page (Full CRUD)
- **Data Table**: Paginated, sortable, searchable list of all crypto assets
- **Search**: Debounced input (300ms) to prevent excessive API calls
- **Category Filter**: Dropdown filtering by Layer 1, DeFi, NFTs, etc.
- **Sort Controls**: Sort by name, volume, or creation date
- **Create/Edit Modal**: Glassmorphism modal with form validation
- **Delete Confirmation**: Destructive actions require explicit confirmation
- **Ownership Badges**: Visual indicators showing which assets belong to the current user

### Users Page (Admin Only)
- **User List**: Paginated table with role badges
- **Inline Role Editing**: Admins can change user roles directly from the table
- **User Deletion**: With confirmation dialog

### Toast Notifications
`react-hot-toast` configured with dark theme styling to provide:
- ✅ Success confirmations (green)
- ❌ Error messages (red)
- Automatic dismissal after 4 seconds

## Key Decision
> **Why Glassmorphism over Material Design or plain Bootstrap?**
> The assignment evaluates "functional frontend integration" — but a visually stunning UI signals engineering craftsmanship and attention to detail. Glassmorphism creates immediate visual impact while remaining functionally clean. It demonstrates that we treat UI as a first-class engineering concern, not an afterthought.

## Outcome
A complete, production-quality dashboard where evaluators can log in, explore data, create/edit/delete assets, and manage users — all through an interface that feels premium and polished.
