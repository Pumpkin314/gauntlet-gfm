# AI Usage — GoFundMe Reimagined

## Overview

This project was built using AI-assisted development throughout the entire lifecycle: architecture design, implementation, testing, and deployment. The primary AI tool was **Claude Code** (Anthropic's CLI agent), powered by Claude Opus 4.6.

## Where AI Was Used

### 1. Architecture & Planning
- **Sprint plan design**: The full 7-epic sprint plan was designed collaboratively with AI, including parallelization maps, file ownership boundaries, and dependency graphs
- **Schema design**: The 14-table Drizzle schema was designed with AI guidance on denormalization strategy, index placement, and enum choices
- **Rendering strategy**: AI helped determine the optimal rendering approach (ISR vs SSR vs static) for each page based on data requirements

### 2. Implementation
- **Code generation**: All production code was written with AI assistance — server components, client components, API routes, server actions, database queries, and utility functions
- **Parallel agent execution**: Complex Epics used multiple AI agents working in parallel on git worktrees, each owning specific file boundaries to avoid merge conflicts
- **Bug diagnosis**: Critical bugs (Neon HTTP driver transaction incompatibility, RSC re-render crashes) were diagnosed through AI-driven iterative debugging with error message analysis

### 3. Testing & Verification
- **Browser verification**: After each Epic deployment, AI connected to headless Chrome to navigate the app, take screenshots, and verify visual correctness
- **Build validation**: AI ran `npm run build` after every change set to catch TypeScript errors before deployment

### 4. Documentation
- **Architecture docs**: ARCHITECTURE.md, this file, and other documentation were authored with AI assistance
- **Commit messages**: All commits include descriptive messages summarizing changes

## How AI Accelerated Development

| Phase | Without AI (Estimate) | With AI | Speedup |
|-------|----------------------|---------|---------|
| Schema design | 4-6 hours | 30 min | ~10x |
| Per-page implementation | 6-8 hours each | 1-2 hours each | ~5x |
| Bug diagnosis (transaction crash) | 4+ hours | 45 min | ~5x |
| Documentation | 4-6 hours | 30 min | ~10x |
| Total MVP (7 Epics) | ~2 weeks | ~3 days | ~4x |

## What Value AI Provided

1. **Velocity**: Full vertical slices (schema → API → UI → deploy) completed in single sessions
2. **Consistency**: Uniform code style, error handling patterns, and component structure across 40+ files
3. **Debugging**: Systematic root-cause analysis of production issues (e.g., discovering Neon HTTP driver limitations through error message exposure)
4. **Parallelization**: Multiple agents working on independent PRs simultaneously, managed by an orchestrator
5. **Quality**: TypeScript type safety, Zod validation, proper error boundaries — applied consistently without fatigue

## AI Limitations Encountered

- **Runtime behavior**: AI couldn't predict the Neon HTTP driver's lack of transaction support until it manifested as a runtime error in production
- **Visual design**: AI generated functional UI but visual polish required iterative human feedback
- **Third-party APIs**: Mux integration required reading current documentation; AI knowledge had minor gaps on latest API changes
- **Performance tuning**: Lighthouse audits and real-world performance testing required actual browser measurements, not just code review

## Tools & Models

- **Claude Code CLI** (Anthropic) — primary development tool
- **Claude Opus 4.6** — model powering code generation, architecture decisions, and debugging
- **Background agents** — parallel execution on git worktrees for independent PRs
- **Chrome automation** — browser verification via Claude-in-Chrome MCP tools
