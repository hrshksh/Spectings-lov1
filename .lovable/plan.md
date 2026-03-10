
# Cleanup: Remove Unused Code

After auditing the codebase, here are files and components that are not imported or used anywhere:

## Files to Remove

### 1. `src/pages/Dashboard.tsx`
- The `/dashboard` route in App.tsx redirects to `/people` -- this page component is imported but never actually rendered. The import can be removed from App.tsx as well.

### 2. `src/pages/Index.tsx`
- A landing page component that is never imported in App.tsx or anywhere else. Completely orphaned.

### 3. `src/pages/Reports.tsx`
- Contains a static reports page with hardcoded data. Not imported anywhere in the project -- no route, no reference.

### 4. `src/components/NavLink.tsx`
- A custom NavLink wrapper that is never imported by any other file.

### 5. `src/hooks/useRealtimeData.ts`
- Only imported by `Dashboard.tsx` (which itself is unused). Once Dashboard is removed, this hook has zero consumers.

### 6. `src/components/ui/navigation-menu.tsx`
- Only imports itself (internal Radix primitives). Never used by any page or component in the app.

### 7. `src/components/ui/data-table.tsx`
- Only imported by `Dashboard.tsx`. Once Dashboard is removed, this generic DataTable component has no consumers.

### 8. `src/types/index.ts`
- Contains TypeScript interfaces (Person, Lead, Company, etc.) that mirror the database but are never actually imported anywhere. The app uses the auto-generated Supabase types instead.

## Code Changes

### 9. `src/App.tsx`
- Remove the unused `import Dashboard from "./pages/Dashboard"` (the component is imported but the route just redirects, so the import is dead weight).

## Summary

| Item | Reason |
|------|--------|
| `src/pages/Dashboard.tsx` | Route redirects; component never renders |
| `src/pages/Index.tsx` | No import anywhere |
| `src/pages/Reports.tsx` | No import anywhere |
| `src/components/NavLink.tsx` | No import anywhere |
| `src/hooks/useRealtimeData.ts` | Only used by unused Dashboard |
| `src/components/ui/navigation-menu.tsx` | No import anywhere |
| `src/components/ui/data-table.tsx` | Only used by unused Dashboard |
| `src/types/index.ts` | Never imported; Supabase types used instead |

Total: **8 files to delete**, **1 file to edit** (App.tsx -- remove dead import).
