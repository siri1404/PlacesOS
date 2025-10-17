# Contributing

## Branching

- Create a feature branch from `main`.
- Keep pull requests focused and scoped.

## Development Workflow

1. Install dependencies: `npm install`
2. Set environment files from `.env.example` templates.
3. Run migration: `npm run migrate -w backend`
4. Validate before PR:
   - `npm run lint`
   - `npm run test`
   - `npm run build`

## Pull Request Requirements

- Explain what changed and why.
- Include API contract changes if any.
- Ensure CI passes.
