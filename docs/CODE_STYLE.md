# OpenRouterChat Code Style Guide

## General
- Use TypeScript for all code (backend and frontend).
- Prefer functional components and hooks in React.
- Use Prettier for formatting and ESLint for linting.
- Use 2 spaces for indentation.
- Use single quotes for strings, except in JSON.
- Always type function arguments and return values.
- Prefer `const` and `let` over `var`.
- Avoid `any` type; use unknown or proper types/interfaces.
- Use PascalCase for components and classes, camelCase for variables and functions, UPPER_CASE for constants.
- Keep files and folders lowercase with dashes (e.g., `chat-list.tsx`).
- Group related files in feature folders.

## Backend
- Organize code in `/openrouter-chat-backend/src`.
- Use Express with async/await.
- Use environment variables for config.
- Separate route handlers, services, and types.

## Frontend
- Organize code in `/openrouter-chat-frontend/src`.
- Use React + Radix UI + Tailwind CSS.
- Use absolute imports from `src/`.
- Keep components small and focused.
- Use custom hooks for shared logic.

## Testing
- Use Jest and React Testing Library for frontend.
- Use Jest or Vitest for backend.

## Commit Messages
- Use Conventional Commits (e.g., `feat:`, `fix:`, `chore:`).
