import { createConnection } from 'typeorm';
import { ORM_CONFIG, ORM_TYPE } from './env';
import { runMigrations } from './migrations';

console.log(`migrating ${ORM_TYPE}`);

runMigrations(createConnection({ ...ORM_CONFIG, logging: true }));
