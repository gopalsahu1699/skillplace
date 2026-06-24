const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cliEnvPath = path.join(__dirname, '..', '.env.cli');
const content = fs.readFileSync(cliEnvPath, 'utf-8').strip();
const token = content.replace('SUPABASE_ACCESS_TOKEN=*** ');

if (!token || token === content) {
  console.error('Failed to read token from .env.cli');
  process.exit(1);
}

process.env.SUPABASE_ACCESS_TOKEN=*** {
  execSync('npx supabase db push', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
