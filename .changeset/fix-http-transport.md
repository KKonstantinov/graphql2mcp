---
'graphql2mcp': patch
---

Fix `--transport http`, which failed every request after the first one. The CLI now creates a new MCP server and stateless Streamable HTTP transport for each request, so MCP clients can connect and call tools. GET and DELETE requests now return 405.
