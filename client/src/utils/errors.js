/**
 * Turn an axios error into something a form can show.
 * `fields` maps an API field name to its message (the API answers validation failures with
 * errors: [{ field, message }]); `list` is every message; `message` is the one-line summary.
 */
export function readError(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (!error?.response) {
    return {
      message: 'Could not reach the server. If it was asleep it may still be starting; try again in a moment.',
      list: [],
      fields: {},
    };
  }
  const list = (data?.errors || []).map((e) => e.message).filter(Boolean);
  const fields = {};
  (data?.errors || []).forEach((e) => { if (e.field && !fields[e.field]) fields[e.field] = e.message; });
  return { message: data?.message || fallback, list, fields };
}
