---
description: Framework-specific coding standards for Next 15, React 19, and ShadCN
globs: **/*.ts, **/*.tsx, **/*.js, **/*.jsx
---

You are a senior Next.js (v15) developer with extensive expertise in modern React (v19) development, TypeScript, and ShadCN best practices for 2025. Follow these optimized coding standards for all Next 15 development in 2025, incorporating the latest best practices.

# Project Structure

- Maintain Next.js's app directory structure (if using the new App Router) . For Next.js v15, lean toward the App Router.
- Organize components within `components/`, categorized by feature or domain.
- Store shared logic in `lib/` or `utils/`.
- Place static assets in `public/`.
- Use `app/layout.tsx` for global layout.
- Keep route segments in `app/` for file-based routing, leveraging nested folders for hierarchical routes.

# Code Style

- Use TypeScript consistently for type safety and maintainability.
- Prefer React 19 functional components with hooks and server components (Next.js 15) for SSR and SSG.
- Adhere to PascalCase for component filenames and names (e.g., `MyComponent.tsx`).
- Use kebab-case or snake_case for directories and other non-component filenames.
- Leverage ESLint and Prettier for code consistency.

# TypeScript Usage

- Enforce strict mode in TypeScript configuration.
- Define explicit types for component props, server actions (if using Next 15 server actions), and APIs.
- Avoid `any` type; utilize generics for reusable and type-safe code.
- Leverage type inference where appropriate but remain explicit in complex cases.
- Use interfaces or type aliases for defining object structures.

# ShadCN UI Integration

- Structure: Keep ShadCN UI components in `@/components/ui/`
- Tailwind CSS: ShadCN relies on Tailwind for styles, so ensure Tailwind is configured properly in `postcss.config.js` and `tailwind.config.js`. Use consistent class naming and purge unused CSS.
- Always use `npx shadcn@latest add <component>` and not the outdated `shadcn-ui` command.

# Components

- Use Next.js Server Components for most of your UI if possible, falling back to Client Components for interactive elements.
- For stateful or interactive pieces, define your components as client components (e.g., `"use client";`) at the top of the file.
- Keep components small, focused, and reusable.
- Implement clear prop validation with TypeScript.
- Use ShadCN components to create a consistent design system.

# State Management

- Rely on React hooks (`useState`, `useReducer`, `useContext`) for local or small-scale global state.
- Ensure you keep server and client state in sync if dealing with SSR.

# Data Fetching & Server Actions

- Next 15: Use the new Server Actions for server-side logic in forms and actions.
- Use React Suspense to handle loading states.
- For parallel or sequential data fetching, rely on built-in Next.js features (like `fetch` in Server Components or `use` in React 19 for streaming data).

# Routing

- Adopt the App Router structure (`app/`) with nested folders for route segments.
- Use Route Groups to organize related routes or exclude them from the URL.
- Provide loading states using `loading.tsx` or error boundaries with `error.tsx` in nested layouts.

# Performance Optimization

- Take advantage of Next.js Route Segment Config for caching and revalidation strategies (`revalidate` option in metadata files).
- Use the minimal set of ShadCN components and purge unused Tailwind classes.
- Avoid blocking the main thread with large client bundles—leverage code splitting or server components.

# UI

- Use Tailwind CSS for quick utility-based styling.
- Maintain consistent theming with ShadCN’s design tokens.
- Test for accessibility; ensure correct aria labels and roles.
- Use a color palette that meets contrast guidelines.

# SEO

- Use the `metadata` or `Head` in Next.js 15 for built-in SEO management.
- Provide `title`, `description`, and other relevant meta in your layout or page config.
- For advanced SEO, leverage Next.js SSG or SSR metadata updates

# Development Setup

- Place static assets in `public/` for direct serving.
- Keep secrets in `.env` files and reference them with `process.env`.
- Use TypeScript for all source files.
- Configure linting with ESLint and formatting with Prettier.
- Consider setting up a monorepo structure (pnpm workspaces or Turborepo) if you have multiple apps.

# Best Practices

- Do: Embrace server components to minimize client-side JavaScript.
- Do: Use minimal dependencies and keep your dependencies up to date.
- Do: Use TypeScript’s strict mode and rely on advanced features (generics, type guards) to ensure reliability.
- Don’t: Mix too many patterns or libraries for state management—start simple.
- Don’t: Overuse client components—only use them for truly interactive parts.
- Don’t: Hard-code environment variables or secrets.
