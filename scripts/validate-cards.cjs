const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'src', 'content', 'knowledge');

const REQUIRED_FIELDS = ['id', 'title', 'module', 'tags', 'difficulty', 'status', 'author', 'date'];
const VALID_STATUSES = ['draft', 'review', 'published'];
const VALID_DIFFICULTIES = ['基础', '进阶', '高级'];
const REQUIRED_SECTIONS = [
  { key: '🎯', label: '问题定义' },
  { key: '📐', label: '核心理论' },
  { key: '⚙️', label: '底层机制' },
  { key: '🎮', label: '游戏设计应用' },
  { key: '✅', label: '设计检查清单' },
];

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(content);
  const errors = [];
  const warnings = [];

  // Check frontmatter fields
  REQUIRED_FIELDS.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Invalid status: ${data.status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
    errors.push(`Invalid difficulty: ${data.difficulty}. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  if (data.prerequisites && !Array.isArray(data.prerequisites)) {
    errors.push('Prerequisites must be an array');
  }

  if (data.related && !Array.isArray(data.related)) {
    errors.push('Related must be an array');
  }

  // Check required sections
  REQUIRED_SECTIONS.forEach(({ key, label }) => {
    if (!body.includes(key)) {
      warnings.push(`Missing recommended section: ${label} (${key})`);
    }
  });

  // Check file naming
  const filename = path.basename(filePath);
  if (filename.startsWith('_')) return { errors, warnings }; // Skip template

  if (!/^[a-z0-9-]+\.md$/.test(filename)) {
    warnings.push(`Filename should be lowercase with hyphens: ${filename}`);
  }

  return { errors, warnings };
}

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else if (file.endsWith('.md') && !file.startsWith('_')) {
      results.push(filePath);
    }
  });
  return results;
}

// Main
const files = walkDir(KNOWLEDGE_DIR);
let totalErrors = 0;
let totalWarnings = 0;

console.log(`\nValidating ${files.length} knowledge cards...\n`);

files.forEach(file => {
  const relPath = path.relative(KNOWLEDGE_DIR, file);
  const { errors, warnings } = validateFile(file);

  if (errors.length || warnings.length) {
    console.log(`📄 ${relPath}`);
    errors.forEach(e => console.log(`  ❌ ERROR: ${e}`));
    warnings.forEach(w => console.log(`  ⚠️  WARN: ${w}`));
    console.log('');
    totalErrors += errors.length;
    totalWarnings += warnings.length;
  }
});

console.log(`\n✅ Validation complete: ${files.length} files checked`);
console.log(`   ❌ ${totalErrors} errors`);
console.log(`   ⚠️  ${totalWarnings} warnings`);

if (totalErrors > 0) {
  process.exit(1);
}
