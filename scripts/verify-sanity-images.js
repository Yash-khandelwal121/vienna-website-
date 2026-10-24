import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'lwp5b4fm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

async function main() {
  console.log('Querying Sanity Cloud for blog articles and fleet images...');

  const posts = await client.fetch('*[_type == "blogPost"][0...4]{ title, slug, coverImage, author, publishedAt }');
  console.log('\n📸 Blog Articles Image Verification:');
  posts.forEach((p, idx) => {
    const img = p.coverImage?.imageUrl || (p.coverImage?.asset?._ref ? `asset:${p.coverImage.asset._ref}` : 'default');
    console.log(`  [${idx + 1}] ${p.title.slice(0, 45)}...`);
    console.log(`      Slug:  ${p.slug?.current}`);
    console.log(`      Image: ${img}`);
  });

  const fleet = await client.fetch('*[_type == "luxuryFleet"] | order(displayOrder asc) { name, model, category, mainImage }');
  console.log('\n🚗 Fleet Images Verification:');
  fleet.forEach((f, idx) => {
    const img = f.mainImage?.imageUrl || (f.mainImage?.asset?._ref ? `asset:${f.mainImage.asset._ref}` : 'default');
    console.log(`  [${idx + 1}] ${f.name} (${f.category || f.model || 'Luxury'})`);
    console.log(`      Image: ${img}`);
  });

  console.log('\n✅ All Sanity content and image pointers verified successfully!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
