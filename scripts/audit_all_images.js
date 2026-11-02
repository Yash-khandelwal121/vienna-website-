import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { getResilientDatabaseUrl } from '../server/config/db.js';

const publicDir = path.resolve('public');

function checkFileExists(relPath) {
  if (!relPath) return { ok: false, reason: 'empty' };
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) {
    return { ok: true, type: 'remote', url: relPath };
  }
  const clean = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  const full = path.join(publicDir, clean);
  const exists = fs.existsSync(full);
  return { ok: exists, type: 'local', fullPath: full, relPath };
}

async function audit() {
  console.log('=== AUDITING ALL IMAGES IN PROJECT ===\n');
  const broken = [];

  // 1. Check src/data/blogPosts.json
  try {
    const posts = JSON.parse(fs.readFileSync('src/data/blogPosts.json', 'utf8'));
    console.log(`Checking ${posts.length} blogs from blogPosts.json...`);
    posts.forEach((p, idx) => {
      const featCheck = checkFileExists(p.featuredImage);
      if (!featCheck.ok) {
        broken.push({ source: 'blogPosts.json', id: p.slug, field: 'featuredImage', path: p.featuredImage });
      }
      // Check content <img> tags
      const contentImgs = [...(p.content || '').matchAll(/<img[^>]+src=["']([^"']+)["']/g)];
      contentImgs.forEach(m => {
        const cCheck = checkFileExists(m[1]);
        if (!cCheck.ok) {
          broken.push({ source: 'blogPosts.json', id: p.slug, field: 'content_img', path: m[1] });
        }
      });
    });
  } catch (e) {
    console.error('blogPosts.json error:', e.message);
  }

  // 2. Check src/data/tours.js
  try {
    const toursContent = fs.readFileSync('src/data/tours.js', 'utf8');
    const tourImgs = [...toursContent.matchAll(/image:\s*['"]([^'"]+)['"]/g)];
    console.log(`Checking ${tourImgs.length} images from tours.js...`);
    tourImgs.forEach(m => {
      const check = checkFileExists(m[1]);
      if (!check.ok) {
        broken.push({ source: 'tours.js', field: 'image', path: m[1] });
      }
    });
  } catch (e) {
    console.error('tours.js error:', e.message);
  }

  // 3. Check src/data/pages.js
  try {
    const pagesContent = fs.readFileSync('src/data/pages.js', 'utf8');
    const pageImgs = [...pagesContent.matchAll(/(?:image|heroImage|featuredImage):\s*['"]([^'"]+)['"]/g)];
    console.log(`Checking ${pageImgs.length} images from pages.js...`);
    pageImgs.forEach(m => {
      const check = checkFileExists(m[1]);
      if (!check.ok) {
        broken.push({ source: 'pages.js', field: 'image', path: m[1] });
      }
    });
  } catch (e) {
    console.error('pages.js error:', e.message);
  }

  // 4. Check Neon DB BlogPosts
  try {
    const rawUrl = process.env.DATABASE_URL || process.env.Database_POSTGRES_URL;
    const resilientUrl = await getResilientDatabaseUrl(rawUrl, true);
    const prisma = new PrismaClient({ datasources: { db: { url: resilientUrl } } });
    const dbPosts = await prisma.blogPost.findMany();
    console.log(`Checking ${dbPosts.length} blogs from Neon PostgreSQL...`);
    dbPosts.forEach(p => {
      const featCheck = checkFileExists(p.featuredImage);
      if (!featCheck.ok) {
        broken.push({ source: 'Neon DB', id: p.slug, field: 'featuredImage', path: p.featuredImage });
      }
      const ogCheck = checkFileExists(p.seo?.ogImage);
      if (p.seo?.ogImage && !ogCheck.ok) {
        broken.push({ source: 'Neon DB', id: p.slug, field: 'seo.ogImage', path: p.seo.ogImage });
      }
    });
    await prisma.$disconnect();
  } catch (e) {
    console.error('Neon DB check note:', e.message);
  }

  console.log(`\n=== TOTAL BROKEN IMAGE REFERENCES: ${broken.length} ===`);
  broken.forEach((b, i) => {
    console.log(`${i+1}. [${b.source}] ${b.id || ''} -> ${b.field}: "${b.path}"`);
  });
}

audit();
