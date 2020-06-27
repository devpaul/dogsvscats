import { ORM_TYPE } from './env';
import { runMigrations } from './migrations';

console.log(`migrating ${ORM_TYPE}`);

runMigrations();
