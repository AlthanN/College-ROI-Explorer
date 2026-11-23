import { format } from 'd3';
import type { Category, Control } from './types';

export const money = format('$,.0f');
export const moneyShort = (value: number) => format('$.3~s')(value).replace('k', 'K');
export const percent = format('.0%');
export const count = format(',');

export const CONTROL_LABELS: Record<Control, string> = {
	1: 'Public',
	2: 'Private nonprofit',
	3: 'For-profit'
};

export const CONTROL_COLORS: Record<Control, string> = {
	1: 'var(--type-public)',
	2: 'var(--type-nonprofit)',
	3: 'var(--type-forprofit)'
};

// Cutoffs agreed in Deliverable 1: under 40% admitted is a reach, 40-75% a target, 75%+ a safety.
export const REACH_BELOW = 0.4;
export const SAFETY_FROM = 0.75;

export function category(admitRate: number | null): Category {
	if (admitRate === null) return 'none';
	if (admitRate < REACH_BELOW) return 'reach';
	if (admitRate < SAFETY_FROM) return 'target';
	return 'safety';
}

export const CATEGORY_LABELS: Record<Category, string> = {
	reach: 'Reach',
	target: 'Target',
	safety: 'Safety',
	none: 'No acceptance data'
};

export const STATE_NAMES: Record<string, string> = {
	AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
	CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia',
	HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
	LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
	MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
	NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
	OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
	SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
	VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
	PR: 'Puerto Rico', GU: 'Guam', VI: 'U.S. Virgin Islands', AS: 'American Samoa',
	MP: 'Northern Mariana Islands', FM: 'Micronesia', MH: 'Marshall Islands', PW: 'Palau'
};
