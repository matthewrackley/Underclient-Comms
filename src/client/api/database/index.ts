import database from './dbClient';
import handleClientDoc from './handleClientDoc';
export * from './dbClient';
export * from './handleClientDoc';
const dbClient = database;
export { dbClient, handleClientDoc };

export default database;
