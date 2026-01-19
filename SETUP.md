# CLG Project - Quick Start

## Clone & Setup

```bash
git clone https://github.com/cbertozz-access/clg.git
cd clg
npm install
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_BUILDER_API_KEY=dbcbcb6d2d3544248a7f322e9658c2f1
BUILDER_PRIVATE_KEY=bpk-1b043b05d8d041c2b478664653978910
```

## Run Dev Server

```bash
npm run dev
```

## Services

| Service | Setup |
|---------|-------|
| **Figma** | Authenticated via MCP (carlo.bertozzi@accessgroup.net.au) |
| **Vercel** | Run `vercel login` then `vercel link` |
| **Builder.io** | Keys in .env.local above |

## Figma File

- **URL:** https://www.figma.com/design/u7WU5kdqdrhCvIHfzCqDnF/Composable-Lead-Generation
- **Components:**
  - Hero: `17706:4932`
  - Value Props: `17708:5970`
  - Features: `17708:6108`
  - Footer: `17738:3356`

## Project Structure

```
/src/components/builder/lp/     - Landing page components
/src/components/builder/figma/  - Figma-based components
/src/lib/builder-registry.ts    - Builder.io component registration
/src/lib/themes/                - Theme system & CSS variables
```
