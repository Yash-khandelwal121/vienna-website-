import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const projectId = process.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm';
const dataset = process.env.VITE_SANITY_DATASET || 'production';

console.log(`Connecting to Sanity: project ${projectId}, dataset ${dataset}...`);

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
});

async function run() {
  try {
    const types = await client.fetch(`array::unique(*._type)`);
    console.log('✅ Sanity connection SUCCESSFUL!');
    console.log('Existing document types in dataset:', types);
    const count = await client.fetch(`count(*)`);
    console.log('Total documents currently in dataset:', count);
  } catch (err) {
    console.error('❌ Sanity query failed:', err.message);
  }
}

run();
