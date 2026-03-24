<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/dfc7dc72-faa2-44ee-9b99-d88ea1603766

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy To Cloudflare

Cloudflare does not run the Node/Express server in [server.ts](server.ts). The deployed site uses the Worker in [cloudflare/worker.js](cloudflare/worker.js) for `/api/github/*` routes and serves the built frontend from `dist` using [wrangler.jsonc](wrangler.jsonc).

Typical deployment flow:

1. Build the frontend:
   `npm run build`
2. Deploy the Worker and static assets:
   `npm run deploy:cloudflare`

Cloudflare configuration notes:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Version command: `npx wrangler versions upload`
- The deployed Worker expects the built assets in `dist`