import * as v from 'valibot';
import { query } from '$app/server';
import collegesJson from '#lib/server/data/colleges.json';
import programsJson from '#lib/server/data/programs.json';
import type { College, Program } from '#lib/types.js';

// Both files are built by `npm run data` from the raw College Scorecard CSVs.
const colleges = collegesJson as College[];
const programs = programsJson as Record<string, Program[]>;

export const getColleges = query(async () => colleges);

export const getPrograms = query(v.number(), async (collegeId) => programs[collegeId] ?? []);
