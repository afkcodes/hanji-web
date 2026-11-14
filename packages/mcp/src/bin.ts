#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { loadData } from './data.ts';
import { createServer } from './server.ts';

const server = createServer(loadData());
await server.connect(new StdioServerTransport());
