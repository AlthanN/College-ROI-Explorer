// Builds the small JSON files the app loads from the raw College Scorecard CSVs.
// Usage: node scripts/prepare-data.js [path to the folder with the raw CSVs]
// The raw CSVs are too big for git, so they live outside the repo (default: ../data).

import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join, resolve } from 'node:path';
import { csvParseRows } from 'd3';

const sourceDir = resolve(process.argv[2] ?? '../data');
const outDir = resolve('src/lib/server/data');

/** Reads a CSV line by line and calls onRow with an object keyed by the columns we ask for. */
async function readCsv(file, columns, onRow) {
	const lines = createInterface({ input: createReadStream(join(sourceDir, file), 'utf8') });
	let index = null;
	for await (const line of lines) {
		const cells = csvParseRows(line)[0];
		if (!index) {
			const header = cells.map((c) => c.replace(/^﻿/, ''));
			index = Object.fromEntries(columns.map((c) => [c, header.indexOf(c)]));
			continue;
		}
		onRow(Object.fromEntries(columns.map((c) => [c, cells[index[c]]])));
	}
}

// Suppressed values are "PS" and missing values are "NA", so anything non-numeric becomes null.
const num = (value) => {
	const n = Number(value);
	return value === '' || value === undefined || Number.isNaN(n) ? null : n;
};

// Colleges: operating, mainly bachelor's, with net price, graduation rate and earnings.
const colleges = [];
await readCsv(
	'Most-Recent-Cohorts-Institution.csv',
	['UNITID', 'INSTNM', 'CITY', 'STABBR', 'CONTROL', 'PREDDEG', 'CURROPER', 'UGDS', 'NPT4_PUB', 'NPT4_PRIV', 'ADM_RATE', 'C150_4', 'MD_EARN_WNE_P10', 'GRAD_DEBT_MDN'],
	(r) => {
		if (r.PREDDEG !== '3' || r.CURROPER !== '1') return;
		const netPrice = num(r.NPT4_PUB) ?? num(r.NPT4_PRIV);
		const gradRate = num(r.C150_4);
		const earnings = num(r.MD_EARN_WNE_P10);
		if (netPrice === null || gradRate === null || earnings === null) return;
		colleges.push({
			id: Number(r.UNITID),
			name: r.INSTNM,
			city: r.CITY,
			state: r.STABBR,
			control: Number(r.CONTROL),
			size: num(r.UGDS),
			netPrice,
			admitRate: num(r.ADM_RATE),
			gradRate,
			earnings,
			debt: num(r.GRAD_DEBT_MDN)
		});
	}
);
const collegeIds = new Set(colleges.map((c) => c.id));

// Programs: bachelor's majors at those colleges with earnings 4 years after graduating.
const programs = {};
let programCount = 0;
await readCsv(
	'Most-Recent-Cohorts-Field-of-Study.csv',
	['UNITID', 'CIPCODE', 'CIPDESC', 'CREDLEV', 'EARN_MDN_4YR', 'DEBT_ALL_STGP_EVAL_MDN'],
	(r) => {
		const id = Number(r.UNITID);
		const earnings = num(r.EARN_MDN_4YR);
		if (r.CREDLEV !== '3' || !collegeIds.has(id) || earnings === null) return;
		(programs[id] ??= []).push({
			cip: r.CIPCODE,
			name: r.CIPDESC.replace(/\.$/, ''),
			earnings,
			debt: num(r.DEBT_ALL_STGP_EVAL_MDN)
		});
		programCount++;
	}
);

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'colleges.json'), JSON.stringify(colleges));
writeFileSync(join(outDir, 'programs.json'), JSON.stringify(programs));
console.log(`${colleges.length} colleges, ${programCount} programs at ${Object.keys(programs).length} colleges`);
