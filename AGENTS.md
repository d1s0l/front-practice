<!-- BEGIN:nextjs-agent-rules -->
# Project Rules (Next.js + TypeScript + SCSS + Three.js + FSD)

## General
- Always explain changes before applying them
- Do not install dependencies without permission
- Prefer minimal and safe changes
- Do not break existing functionality

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: SCSS modules
- 3D: Three.js

## Architecture
- Use Feature-Sliced Design (FSD) as the default architecture
- Organize code into app, processes (if needed), pages, widgets, features, entities, and shared
- Keep the architecture practical and not overly strict
- Minimal deviations from FSD are allowed if they improve simplicity, readability, or development speed
- Avoid overengineering just to satisfy architecture purity
- Small projects or simple features may use lighter structure when appropriate
- Shared code should not depend on higher layers
- Keep business logic out of UI components when possible

## Next.js Rules
- Use App Router (app directory)
- Use server components by default
- Use "use client" only when necessary
- Avoid unnecessary client-side rendering

## Three.js Rules
- Never run Three.js on the server
- Use dynamic import with ssr: false for 3D components
- Wrap all Three.js code inside client components
- Clean up WebGL resources (dispose, remove listeners)

## TypeScript Rules
- Use strict typing, but avoid over-engineering
- Avoid "any" unless absolutely necessary
- Prefer simple and readable types

## SCSS Rules
- Use SCSS modules (*.module.scss)
- Avoid global styles unless necessary
- Keep styles scoped to components

## Code Style
- Use functional components only
- Use React hooks
- Keep components small and reusable
- Use clear and descriptive naming

## Debugging
- First explain the issue
- Then propose a fix
- Then show updated code

## Performance
- Avoid unnecessary re-renders
- Lazy load heavy components (especially Three.js)
- Optimize images using Next.js features

## File Safety
- Do not modify multiple unrelated files
- Do not refactor entire project unless asked
<!-- END:nextjs-agent-rules -->
