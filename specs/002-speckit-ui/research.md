# Research: Speckit UI Enhancements

**Feature**: 002-speckit-ui
**Phase**: 0 - Research & Technical Decisions
**Date**: 2026-01-04

## Overview

This document captures research findings and technical decisions for the Speckit UI Enhancements feature. The feature involves relocating the download button, adding a help modal, and integrating AI platform selection buttons on the speckit detail page.

## Technical Decisions

### 1. Component Architecture

**Decision**: Create two new Vue components in `frontend/components/speckit/`:
- `SpeckitDownloadBar.vue` - Unified download and help button bar
- `SpeckitHelpModal.vue` - Modal dialog with usage instructions

**Rationale**:
- Separation of concerns: download bar manages button state and actions, modal manages instruction display
- Reusability: components can be tested and potentially reused elsewhere
- Follows feature-based organization principle from constitution
- Matches existing pattern from `AiPlatformSelector.vue` in `components/research/`

**Alternatives Considered**:
1. **Single component with inline modal**: Rejected because it would mix concerns (download logic + modal display) and make testing harder
2. **Using Vuetify dialog components**: Considered but rejected because existing `AiPlatformSelector` uses pure Tailwind CSS for consistency

---

### 2. Visual Design Consistency

**Decision**: Match the visual design of `AiPlatformSelector.vue`:
- Fixed positioning at bottom of page with `z-index: 40`
- Rounded pill buttons (border-radius: 24px)
- Gradient background animation (`bg-gradient-animated`)
- Hover effects with scale transform and colored glow
- Responsive width: 325px (expands to 350px on hover)

**Rationale**:
- User explicitly requested "визуально сделай ее такой же как сейчас идет выбор между ChatGPT, ClaudeCode и Perplexity"
- Creates visual consistency across the application
- Leverages existing Tailwind CSS classes and animations
- Matches iridescent theme from constitution

**Alternatives Considered**:
1. **Using Vuetify cards/buttons**: Rejected because it would create visual inconsistency with existing AI platform selector
2. **Custom design without gradients**: Rejected because it wouldn't match the requested aesthetic

---

### 3. Download Button Placement

**Decision**: Position the download bar at the bottom of the viewport using fixed positioning (`fixed bottom-5 right-0 left-0 mx-auto`).

**Rationale**:
- Accessibility: button always visible without scrolling back to top
- User explicitly requested "Перемести кнопку загрузки вниз" (move the download button down)
- Matches existing pattern from prompt page where AI platform selector is fixed at bottom
- Improves UX: users read content first, then download at the end

**Alternatives Considered**:
1. **Sticky positioning within content flow**: Rejected because button would only appear after scrolling past content
2. **Top placement (existing)**: Rejected per user requirement to move to bottom

---

### 4. Help Modal Implementation

**Decision**: Implement help modal using custom Tailwind CSS with overlay and click-outside-to-close functionality.

**Rationale**:
- Consistency with Tailwind-based design system
- No Vuetify dependencies for modal (reduces bundle size)
- Easier to match visual style of download bar
- Supports markdown rendering via `@nuxtjs/mdc` (already in dependencies)

**Alternatives Considered**:
1. **Vuetify v-dialog**: Considered for accessibility features, but rejected because it introduces Vuetify dependency styling that conflicts with Tailwind design
2. **Headless UI Vue library**: Not needed - custom implementation is simple enough

---

### 5. AI Platform Integration

**Decision**: Reuse existing `AiPlatformSelector.vue` component from `components/research/` without modification.

**Rationale**:
- DRY principle: component already exists and works
- Consistent behavior across prompt and speckit pages
- Component accepts `promptText` prop which can be populated with speckit body content
- No code duplication

**Alternatives Considered**:
1. **Create speckit-specific platform selector**: Rejected because it would duplicate code and create maintenance burden
2. **Extend AiPlatformSelector to handle both prompts and speckits**: Not needed - current prop interface works for both

---

### 6. Error Handling Strategy

**Decision**: Follow existing error handling pattern from `[speckitSlug].vue`:
- Display error messages as fixed toast at bottom-right for 5 seconds
- Auto-dismiss after timeout
- Log errors to console with context
- Disable download button during loading to prevent multiple requests

**Rationale**:
- Consistency with existing UX patterns
- User-friendly: errors are visible but not intrusive
- Matches existing code patterns in the page component

**Alternatives Considered**:
1. **Vuetify snackbar**: Considered but rejected for consistency with custom error display
2. **Permanent error display**: Rejected because it blocks user interaction

---

### 7. Mobile Responsiveness

**Decision**: Ensure bottom controls don't overlap content on mobile by:
- Using responsive spacing classes (Tailwind `sm:`, `md:` breakpoints)
- Adjusting fixed position bottom offset on small screens
- Testing on viewport widths < 768px

**Rationale**:
- Edge case identified in spec: "What happens when the user is on mobile and the bottom controls interfere with content?"
- Success criterion SC-005 requires no overlap on mobile
- Responsive design is a constitutional requirement

**Alternatives Considered**:
1. **Hide bottom controls on mobile**: Rejected because it removes core functionality
2. **Stack controls vertically on mobile**: Could work but may occupy too much screen space

---

### 8. File Download Implementation

**Decision**: Use existing `useFileDownload` composable which provides:
- `downloadFileFromUrl(url, filename)` - for downloading files from URLs
- `downloadMarkdown(filename, content)` - for downloading markdown content
- `downloadZip(filename, files)` - for downloading ZIP archives

**Rationale**:
- Reuses existing, tested code
- Handles edge cases (URL construction, blob creation, download triggers)
- No need to reinvent file download logic

**Alternatives Considered**:
1. **Use native `<a download>` attribute**: Rejected because it doesn't work for cross-origin files without CORS headers
2. **Use third-party download library**: Not needed - existing composable handles all cases

---

### 9. Speckit Usage Instructions Content

**Decision**: Create default Russian-language instructions for the help modal with these sections:
- What is a Speckit?
- How to download and use the configuration file
- How to integrate with your project
- Example usage
- Troubleshooting common issues

**Rationale**:
- User requirement: "краткой инструкцией как использовать Speckit" (brief instructions on how to use Speckit)
- Edge case: "What happens when the instruction modal content is not available?" -> Default content ensures modal always has content
- Russian language follows constitution principle

**Alternatives Considered**:
1. **Fetch instructions from Strapi**: Considered but rejected because it adds complexity and backend dependency
2. **External documentation link**: Rejected because it breaks user flow (navigates away from page)

---

### 10. Conditional Rendering

**Decision**: Implement conditional rendering based on data availability:
- Hide/disable download button when `speckit.file` is null or undefined (FR-012)
- Hide/disable AI platform buttons when `speckit.body` is empty or null (FR-013)
- Show loading state while fetching speckit data

**Rationale**:
- Addresses edge cases from spec
- Prevents user confusion (buttons don't work for missing content)
- Graceful degradation

**Alternatives Considered**:
1. **Show buttons with disabled state**: Better UX than hiding, but may confuse users
2. **Show error message for missing content**: Too intrusive - hiding is cleaner

---

## Technology Stack Confirmation

**Confirmed Technologies** (from constitution and codebase):
- **Framework**: Nuxt 3.2.0 (Vue 3.4.21)
- **Language**: TypeScript 5.9.2
- **UI Styling**: Tailwind CSS (primary), Vuetify 3 (fallback for complex components if needed)
- **State Management**: Vue 3 Composition API (ref, computed, watch)
- **Markdown Rendering**: @nuxtjs/mdc (for help modal content)
- **Icons**: SVG icons (inline, matching AiPlatformSelector pattern)

**No New Dependencies Required**: All functionality can be implemented with existing dependencies.

---

## Performance Considerations

1. **Lazy Loading**: Modal content can be lazy-loaded (only rendered when opened)
2. **Component Size**: New components are small (< 200 LOC each) - minimal bundle impact
3. **Network Requests**: No new API calls - reuses existing data fetching
4. **Render Performance**: Fixed positioning uses CSS transforms - GPU accelerated

---

## Accessibility Considerations

1. **Keyboard Navigation**: Support Enter/Space to activate buttons, Escape to close modal
2. **ARIA Labels**: Add proper labels and roles for buttons and modal
3. **Focus Management**: Trap focus within modal when open, return to trigger button when closed
4. **Screen Reader**: Ensure modal content is announced when opened

---

## Testing Strategy

**Manual Testing Checklist**:
1. Download button works and downloads correct file
2. Help button opens modal with instructions
3. Modal closes via click-outside, Escape key, and close button
4. AI platform buttons open correct URLs in new tabs
5. Error handling works (network error, malformed URL)
6. Loading states prevent multiple clicks
7. Mobile responsive (no content overlap on < 768px)
8. Conditional rendering works (missing file, missing body)
9. Visual consistency with AiPlatformSelector (matching gradients, border-radius, hover effects)

---

## Open Questions

**None** - All technical decisions resolved. No NEEDS CLARIFICATION markers required.

---

## Next Steps (Phase 1)

1. Generate `data-model.md` documenting domain types
2. Create component structure documentation
3. Write `quickstart.md` implementation guide
4. Update agent context file
