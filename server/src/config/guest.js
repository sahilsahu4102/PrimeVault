// Guest accounts are ordinary USER accounts on a reserved address. ".invalid" is not a real top-level
// domain, so the registration schema rejects it and no real user can ever collide with, or be purged as, a guest.
export const GUEST_DOMAIN = 'guest.invalid';
export const GUEST_TTL_MS = 24 * 60 * 60 * 1000;

/** Prisma `where` that matches guest accounts. */
export const isGuest = { email: { endsWith: `@${GUEST_DOMAIN}` } };
