import { BADGE_CLASS } from '../utils';

export default function Badge({ label }) {
  const cls = BADGE_CLASS[label] || 'badge--default';
  return <span className={`badge ${cls}`}>{label}</span>;
}
