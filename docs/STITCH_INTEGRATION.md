# Stitch Integration

Pecafoo now includes workspace-level Stitch MCP configuration for Cursor.

## Included config

The repo contains [.cursor/mcp.json](C:/Users/Machodev/OneDrive/Document/Pecafoo/.cursor/mcp.json) with the official Stitch proxy entry:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"]
    }
  }
}
```

## Local setup

Run this once on your machine:

```bash
npx @_davideast/stitch-mcp init
```

That flow handles:

- Google Cloud authentication
- project binding
- local credentials
- Stitch MCP readiness for Cursor-compatible clients

## Recommended workflow

1. Design or update a screen in Stitch.
2. Open this repo in Cursor.
3. Use Stitch MCP tools to pull the screen.
4. Convert the design into the matching Pecafoo app:
   - `frontend/customer-app`
   - `frontend/restaurant-app`
   - `frontend/delivery-app`
   - `frontend/admin-app`

## Notes

- This repo-level config does not install Stitch globally for you.
- If `npx` cannot resolve the package, rerun the init command with internet access.
- Stitch should be treated as a design input source for the existing React apps, not as a replacement runtime.
