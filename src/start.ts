import PryvServer from './PryvServer';

const server = new PryvServer();
const app = server.start(3000);

export default app;
