import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = join(dirname(fileURLToPath(import.meta.url)), '../../..');
export const business = JSON.parse(readFileSync(join(rootDir, 'business.config.json'), 'utf8'));

/** Public base URL used in email links. */
export const baseUrl = (process.env.PUBLIC_URL || business.websiteUrl).replace(/\/$/, '');
