import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'vienna-day-trip',
  title: 'Vienna Day Trip — Luxury Chauffeur CMS',
  projectId: 'lwp5b4fm',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      title: 'Content Desk',
    }),
    visionTool({
      title: 'GROQ Playground',
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
