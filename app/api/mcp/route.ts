import { createMcpHandler } from 'mcp-handler';
import { registerPublicTools } from '../../../src/mcp-tools.js';

export const runtime='nodejs';
export const maxDuration=30;
const handler=createMcpHandler(server=>registerPublicTools(server));
export {handler as GET,handler as POST,handler as DELETE};
