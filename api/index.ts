import { handle } from '@hono/node-server/vercel';
import app from '../src/server/app';

export default handle(app);
