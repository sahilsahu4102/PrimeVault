# Phase 3: RBAC & Business Logic (Crypto Assets CRUD)

> **Duration**: ~3 hours | **Focus**: Role-based access control, full CRUD with ownership, pagination

---

## Objective
Build a composable authorization layer and implement feature-complete CRUD operations for the Crypto Assets entity — the core business domain of the PrimeVault platform.

## What Was Built

### Role-Based Access Control
A reusable middleware pattern that can be chained onto any route:

```javascript
// Only admins can access user management
router.get('/users', authenticate, requireRole('ADMIN'), controller.getAll);

// Any authenticated user can list assets
router.get('/assets', authenticate, controller.getAll);
```

The `requireRole()` middleware is composable — it accepts multiple roles (`requireRole('ADMIN', 'MODERATOR')`) and works independently of the authentication middleware, following the Single Responsibility Principle.

### Crypto Assets CRUD

| Operation | Endpoint | Access |
|-----------|----------|--------|
| Create | `POST /api/v1/assets` | Any authenticated user |
| List All | `GET /api/v1/assets` | Any authenticated user |
| Get One | `GET /api/v1/assets/:id` | Any authenticated user |
| Update | `PUT /api/v1/assets/:id` | Owner or Admin only |
| Delete | `DELETE /api/v1/assets/:id` | Owner or Admin only |

### Advanced Query Features
The list endpoint supports:
- **Pagination**: `?page=2&limit=20` with total count and page metadata
- **Search**: `?search=ethereum` — searches across name and description fields
- **Filter**: `?category=DeFi` — exact category match
- **Sort**: `?sortBy=volume&order=desc` — multi-field sorting
- **Active Filter**: `?isActive=true` — show only active listings

### Ownership Enforcement
```javascript
// In the service layer
if (asset.userId !== requestingUserId && userRole !== 'ADMIN') {
  throw ApiError.forbidden('You can only modify your own assets');
}
```
Users can only update/delete assets they created. Admins bypass this restriction.

### Input Validation (Joi)
Every request is validated before reaching the controller:
```javascript
const createAssetSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  volume: Joi.number().positive().required(),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
});
```
The `stripUnknown: true` option automatically removes any extra fields from the payload, preventing mass-assignment vulnerabilities.

### Standardized API Responses
Every endpoint returns a consistent envelope:
```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": {
    "assets": [...],
    "pagination": { "page": 1, "limit": 10, "total": 65, "totalPages": 7 }
  }
}
```

## Key Decision
> **Why Joi over Zod or express-validator?**
> Joi provides the most expressive schema DSL for complex validation rules. Its `stripUnknown` option automatically sanitizes payloads, and schemas are framework-agnostic — they can validate API requests, WebSocket messages, or CLI inputs without modification.

## Outcome
A complete, secure business logic layer where users can manage crypto asset portfolios with full CRUD capabilities, enforced ownership boundaries, and rich query support.
