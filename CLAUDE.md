# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Test Commands
- Start development server: `npm start`
- Build for production: `npm run build`
- Run all tests: `npm test`
- Run a single test file: `npm test -- src/App.test.tsx`
- Run tests with a specific pattern: `npm test -- --testNamePattern="test pattern"`

## Code Style Guidelines
- TypeScript with strict type checking
- React functional components with hooks
- Use interface for defining component props and state types
- Favor explicit return types on functions
- Import order: React, external libraries, internal modules, styles
- Use arrow functions for component definitions
- Use async/await for asynchronous operations
- Consistent error handling with try/catch blocks
- CSS classes follow BEM-like naming convention
- State management with React hooks (useState, useEffect)
- Component file names use PascalCase (.tsx extension)
- Utility file names use camelCase (.ts extension)