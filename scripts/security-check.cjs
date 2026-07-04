#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(PROJECT_ROOT, '.env.local');

console.log('\n\x1b[36m═══════════════════════════════════════\x1b[0m');
console.log('\x1b[36m   SkillPlace Security Pre-Flight Check  \x1b[0m');
console.log('\x1b[36m═══════════════════════════════════════\x1b[0m\n');

let errors = [];
let warnings = [];

// 1. Check environment file exists
if (!fs.existsSync(ENV_FILE)) {
  errors.push('.env.local file not found');
} else {
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });

  // Check required production secrets
  const requiredSecrets = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'VIDEO_SECRET',
    'CRON_SECRET',
    'CSRF_SECRET',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'CLOUDFLARE_API_TOKEN',
    'R2_SECRET_ACCESS_KEY',
  ];

  requiredSecrets.forEach(key => {
    const val = envVars[key];
    if (!val) {
      errors.push(`Missing required secret: ${key}`);
    } else if (val.length < 16) {
      warnings.push(`${key} seems too short (${val.length} chars) — use at least 32 characters`);
    } else if (val.includes('your-') || val.includes('placeholder')) {
      warnings.push(`${key} appears to be a placeholder value`);
    }
  });

  // Check frontend doesn't have NEXT_PUBLIC_ for server-only secrets
  Object.keys(envVars).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      const serverVars = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'VIDEO_SECRET',
        'CRON_SECRET',
        'CSRF_SECRET',
        'RAZORPAY_KEY_SECRET',
        'RAZORPAY_WEBHOOK_SECRET',
        'CLOUDFLARE_API_TOKEN',
        'R2_SECRET_ACCESS_KEY',
        'R2_ACCESS_KEY_ID',
      ];
      const strippedKey = key.replace('NEXT_PUBLIC_', '');
      if (serverVars.includes(strippedKey)) {
        errors.push(`SECURITY: ${key} exposes server secret to frontend`);
      }
    }
  });

  // Check NEXT_PUBLIC_SITE_URL is set for production
  if (!envVars['NEXT_PUBLIC_SITE_URL'] || envVars['NEXT_PUBLIC_SITE_URL'].includes('localhost')) {
    warnings.push('NEXT_PUBLIC_SITE_URL is missing or set to localhost — update for production');
  }
}

// 2. Check for hardcoded secrets in source code
console.log('Checking for hardcoded secrets...\n');

const excludeDirs = ['node_modules', '.next', 'public', '.git'];
const sourceExtensions = ['.ts', '.tsx', '.js', '.mjs'];

function scanForHardcodedSecrets(dir) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
        scanForHardcodedSecrets(fullPath);
      }
    } else if (sourceExtensions.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Skip comments and test files
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

        // Check for || 'hardcoded-fallback' patterns
        const hardcodedMatch = trimmed.match(/\|\| ['"]([^'"]{8,})['"]/);
        if (hardcodedMatch) {
          const secret = hardcodedMatch[1];
          const relativePath = path.relative(PROJECT_ROOT, fullPath);
          warnings.push(`Hardcoded fallback secret in ${relativePath}:${idx + 1}: "${secret}"`);
        }

        // Check for console.log with secret variables
        if (trimmed.includes('VIDEO_SECRET') || trimmed.includes('SERVICE_ROLE') || trimmed.includes('CRON_SECRET') || trimmed.includes('CSRF_SECRET')) {
          if (trimmed.includes('console.') || trimmed.includes('process.stdout') || trimmed.includes('response.json') || trimmed.includes('JSON.stringify')) {
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            warnings.push(`Possible secret leak in ${relativePath}:${idx + 1}: "${trimmed.slice(0, 80)}"`);
          }
        }
      });
    }
  });
}

scanForHardcodedSecrets(path.join(PROJECT_ROOT, 'src'));

// 3. Check package.json for known vulnerable patterns
const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

const knownInsecurePatterns = [
  { pattern: /^[0-9]+\.[0-9]+\.x$/, name: 'loose versioning' },
];

Object.entries(deps).forEach(([name, version]) => {
  knownInsecurePatterns.forEach(({ pattern, name: patternName }) => {
    if (pattern.test(version)) {
      warnings.push(`${name} uses ${patternName}: ${version}`);
    }
  });
});

// 4. Check next.config for security settings
const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
  if (!nextConfig.includes('poweredByHeader: false')) {
    errors.push('next.config.ts: Missing poweredByHeader: false');
  }
  if (!nextConfig.includes('productionBrowserSourceMaps: false')) {
    errors.push('next.config.ts: Missing productionBrowserSourceMaps: false');
  }
}

// 5. Summary
console.log('\n\x1b[33m═══════════════════════════════════════\x1b[0m');
console.log('\x1b[33m   Security Check Results               \x1b[0m');
console.log('\x1b[33m═══════════════════════════════════════\x1b[0m\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('\x1b[32m✓ No security issues found\x1b[0m');
} else {
  if (errors.length > 0) {
    console.log(`\x1b[31m✗ ${errors.length} Error(s):\x1b[0m\n`);
    errors.forEach(e => console.log(`  \x1b[31m•\x1b[0m ${e}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`\x1b[33m⚠ ${warnings.length} Warning(s):\x1b[0m\n`);
    warnings.forEach(w => console.log(`  \x1b[33m•\x1b[0m ${w}`));
    console.log('');
  }
}

console.log('\n\x1b[36mFor the full security audit:\x1b[0m');
console.log('  \x1b[36m•\x1b[0m Run: npm audit');
console.log('  \x1b[36m•\x1b[0m Run: npm run build (check for build errors)');
console.log('  \x1b[36m•\x1b[0m Review: supabase/security_policies.sql');
console.log('  \x1b[36m•\x1b[0m Review: supabase/migrations/security_hardening.sql\n');

process.exit(errors.length > 0 ? 1 : 0);
