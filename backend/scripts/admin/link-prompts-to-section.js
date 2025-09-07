// backend/scripts/admin/link-prompts-to-section.js
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'strapi',
  user: 'strapi',
  password: 'strapi123',
});

async function linkPromptsToSection() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Get the prompts section
    console.log('\n📂 Finding prompts section...');
    const sectionResult = await client.query(`
      SELECT id, name, slug FROM sections 
      WHERE slug = 'prompts' AND published_at IS NOT NULL
    `);
    
    if (sectionResult.rows.length === 0) {
      console.log('❌ Prompts section not found!');
      return;
    }
    
    const promptsSection = sectionResult.rows[0];
    console.log(`✅ Found section: ${promptsSection.name} (ID: ${promptsSection.id})`);

    // Get all prompt articles
    console.log('\n📝 Finding prompt articles...');
    const articlesResult = await client.query(`
      SELECT id, title, slug FROM articles 
      WHERE type = 'prompt' AND published_at IS NOT NULL
    `);
    
    console.log(`✅ Found ${articlesResult.rows.length} prompt articles`);

    if (articlesResult.rows.length === 0) {
      console.log('⚠️ No prompt articles found to link');
      return;
    }

    // Check current section links
    console.log('\n🔍 Checking current section links...');
    const currentLinksResult = await client.query(`
      SELECT a.id, a.title, s.name as section_name 
      FROM articles a
      LEFT JOIN articles_section_links asl ON a.id = asl.article_id
      LEFT JOIN sections s ON asl.section_id = s.id
      WHERE a.type = 'prompt' AND a.published_at IS NOT NULL
    `);
    
    const linkedCount = currentLinksResult.rows.filter(row => row.section_name).length;
    const unlinkedCount = currentLinksResult.rows.length - linkedCount;
    
    console.log(`📊 Current status:`);
    console.log(`  - Linked to sections: ${linkedCount}`);
    console.log(`  - Not linked: ${unlinkedCount}`);

    // Clear existing section links for prompt articles
    console.log('\n🧹 Clearing existing section links for prompt articles...');
    const deleteResult = await client.query(`
      DELETE FROM articles_section_links 
      WHERE article_id IN (
        SELECT id FROM articles 
        WHERE type = 'prompt' AND published_at IS NOT NULL
      )
    `);
    console.log(`✅ Removed ${deleteResult.rowCount} existing section links`);

    // Link all prompt articles to prompts section
    console.log('\n🔗 Linking all prompt articles to prompts section...');
    
    const insertResult = await client.query(`
      INSERT INTO articles_section_links (article_id, section_id, article_order)
      SELECT a.id, $1, 1
      FROM articles a
      WHERE a.type = 'prompt' AND a.published_at IS NOT NULL
    `, [promptsSection.id]);

    console.log(`✅ Created ${insertResult.rowCount} section links`);

    // Verify the update
    console.log('\n✅ Verifying the update...');
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM articles a
      JOIN articles_section_links asl ON a.id = asl.article_id
      JOIN sections s ON asl.section_id = s.id
      WHERE a.type = 'prompt' 
        AND a.published_at IS NOT NULL 
        AND s.slug = 'prompts'
    `);
    
    const linkedPrompts = verifyResult.rows[0].count;
    console.log(`✅ Verification: ${linkedPrompts} prompt articles now linked to prompts section`);

    // Show some examples
    console.log('\n📋 Sample linked articles:');
    const sampleResult = await client.query(`
      SELECT a.title, a.slug, s.name as section_name
      FROM articles a
      JOIN articles_section_links asl ON a.id = asl.article_id
      JOIN sections s ON asl.section_id = s.id
      WHERE a.type = 'prompt' 
        AND a.published_at IS NOT NULL 
        AND s.slug = 'prompts'
      ORDER BY a.title
      LIMIT 5
    `);
    
    sampleResult.rows.forEach(row => {
      console.log(`  - ${row.title} → ${row.section_name}`);
    });

    console.log('\n🎉 All prompt articles successfully linked to prompts section!');

  } catch (error) {
    console.error('❌ Error linking prompts to section:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  linkPromptsToSection();
}

module.exports = { linkPromptsToSection };
