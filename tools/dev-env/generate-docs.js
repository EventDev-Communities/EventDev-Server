import { execSync } from 'child_process';

execSync('npx prisma generate --no-hints >/dev/null 2>&1');
execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script 2>&1 | grep -E "^(--|CREATE|ALTER|DROP)" > docs/schema.sql');
console.log('Schemas gerados! Para gerar openapi.json execute: pnpm start-dev');