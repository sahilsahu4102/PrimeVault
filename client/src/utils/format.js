const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-US');
const day = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatPrice = (n) => money.format(n);
export const formatCount = (n) => whole.format(n);
export const formatDay = (iso) => day.format(new Date(iso));

/** Which ownership mark an asset row carries for the signed-in user (see Marks.jsx). */
export const ownerKind = (asset, user, isAdmin) => {
  if (asset.userId === user?.id) return 'yours';
  return isAdmin ? 'admin' : null;
};
