# Engineering Reference: Path Aliases and Singleton Module Duplication

## Overview

In a Vite and Rollup-based build pipeline, mixing relative import paths (`./store-file`) with absolute path aliases (`@/webapp/store-file`) can occasionally cause module duplication if path resolution is misconfigured. For state management libraries like Zustand—which rely on in-memory closures to maintain global state—this results in **multiple, unshared store instances** existing simultaneously in the application.

---

## The Root Cause

Bundlers construct an internal module dependency graph keyed by resolved module identifiers.

1. **Unconfigured Aliases:** If Vite's `resolve.alias` is missing or uses loose string mapping rather than a fully resolved absolute path, the bundler may treat the alias specifier and the relative file specifier as two distinct module entries.
2. **Double Evaluation:** Because the bundler fails to normalize both paths to the exact same canonical file descriptor on disk, it evaluates the target file twice.
3. **Isolated State Closures:** Evaluating the store file twice executes the initialization function (`create()`) twice, creating two separate memory spaces and completely breaking global state synchronization.

---

## The Fix

To guarantee that any combination of relative and aliased imports points to the exact same module instance, absolute path resolution must be explicitly configured in both Vite and TypeScript.

### 1. Vite Configuration (`vite.config.ts`)

Map the alias explicitly to an absolute physical path using Node's `path` module or file URL utilities:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 2. TypeScript Configuration (`tsconfig.json`)

Ensure the compiler maps the exact same paths so type checking and module resolution stay aligned:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Best Practices for the Team

- **Standardize Global Imports:** For singletons, state stores, and shared services, always prefer absolute path imports (`@/`) to eliminate path drift entirely.
- **IDE Auto-Imports:** Configure your IDE (VS Code / IntelliJ IDEA) to prefer path aliases over relative paths when generating auto-imports.
- **Linting Enforcement:** Consider adding lint rules (such as `import/no-relative-parent-imports` or custom ESLint restrictions) if relative path drift becomes a recurring issue in shared modules.
