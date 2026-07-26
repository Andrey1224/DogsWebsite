import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from '@/sanity/schemaTypes';

export default defineConfig({
  basePath: '/admin/blog',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  title: 'Exotic Bulldog Legacy — Блог',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
