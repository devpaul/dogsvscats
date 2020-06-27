import { ORM_CONFIG, ORM_TYPE, PORT, STATIC_FILES } from './env';
import { start } from './server';

console.log(`persisting data to ${ORM_TYPE}`);
console.log(`serving files from ${STATIC_FILES}`);

const config = {
	port: PORT,
	files: STATIC_FILES,
	ormOptions: ORM_CONFIG,
};
start(config);
