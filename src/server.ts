import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { registerPublicTools } from './mcp-tools.js';

serveStdio(()=>{
 const server=new McpServer({name:'cryptobridge',version:'0.3.0'});
 registerPublicTools(server);
 return server;
});
