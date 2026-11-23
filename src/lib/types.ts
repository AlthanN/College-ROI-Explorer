export type Control = 1 | 2 | 3;

export type College = {
	id: number;
	name: string;
	city: string;
	state: string;
	/** 1 = public, 2 = private nonprofit, 3 = private for-profit */
	control: Control;
	/** Undergraduate enrollment */
	size: number | null;
	/** Average yearly net price after grants */
	netPrice: number;
	admitRate: number | null;
	gradRate: number;
	/** Median earnings 10 years after entering the college */
	earnings: number;
	/** Median federal loan debt at graduation */
	debt: number | null;
};

export type Program = {
	cip: string;
	name: string;
	/** Median earnings 4 years after finishing the bachelor's program */
	earnings: number;
	/** Median federal loan debt of the program's graduates */
	debt: number | null;
};

export type Category = 'reach' | 'target' | 'safety' | 'none';
