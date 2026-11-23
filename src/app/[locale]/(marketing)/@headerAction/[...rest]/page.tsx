/**
 * No header action on any page but `/`. A catch-all rather than only
 * `default.tsx`: on a client-side navigation away from `/`, a slot with no
 * match keeps showing what it showed before, so it would keep the home
 * page's action.
 */
export default function NoHeaderAction() {
  return null;
}
