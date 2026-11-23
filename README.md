# cs-571-final-project

A SvelteKit web app

## Tech Stack

- **[Svelte](https://svelte.dev)** (Svelte 5) - frontend framework
- **[SvelteKit](https://svelte.dev/docs/kit)** (SvelteKit 3) - full-stack framework
- **[Tailwind CSS](https://tailwindcss.com)** (Tailwind 4) - styling
- **[shadcn-svelte](https://shadcn-svelte.com)** - UI components (built on **[bits-ui](https://bits-ui.com)**)
- **[D3](https://d3js.org)** (D3 7) - scales, formatting and nearest-point lookup for the charts, which are rendered as SVG in Svelte

## Getting Started

```sh
npm i
npm run dev
```

## Data

The app reads two small JSON files in `src/lib/server/data`, built from the U.S. College Scorecard "Most Recent Cohorts" institution and field-of-study CSVs. The raw CSVs are about 300 MB, so they stay out of git. To rebuild the JSON, put the CSVs in a folder and run:

```sh
npm run data -- path/to/csv/folder
```

The folder defaults to `../data`.
