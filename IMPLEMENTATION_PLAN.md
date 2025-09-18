# Technical Requirements: AiChatForm.vue (with Simplified View)

## 1. Overview
This document outlines the plan to modify the existing `AiChatForm.vue` component to include a new "simplified" view. This view will function as a non-interactive, animated preview that acts as a call-to-action, controlled by a `viewType` prop.

## 2. Component Details
- **Component Name:** `AiChatForm.vue`
- **Location:** `frontend/components/research/`

## 3. Props
- `viewType`
  - **Type:** `String`
  - **Default:** `'full'`
  - **Options:** `'full'`, `'simplified'`
  - **Description:** Controls which version of the chat form is rendered. `'full'` renders the existing, fully interactive form. `'simplified'` renders the new preview version.

- `previewText` (for simplified view)
  - **Type:** `String`
  - **Required:** `false` (only needed when `viewType` is `'simplified'`)
  - **Description:** The text to be used in the typing animation for the simplified view.

## 4. Functional Requirements

### 4.1. View-Based Rendering
- The component will use the `viewType` prop to conditionally render one of two main templates.
- If `viewType` is `'full'` (or not provided), the existing interactive chat form will be rendered.
- If `viewType` is `'simplified'`, the new preview form will be rendered.

### 4.2. Simplified View (`viewType="simplified"`)
- **Structure:** Renders a simplified version of the form based on the reference code, consisting of a `readonly` input and a submit button.
- **Text Animation:**
  - After a 5-second delay from mount, it will start an animation loop on the input field.
  - The animation will type out the `previewText`, pause, erase the text, pause, and repeat.
- **Hover/Focus State:** On hover or focus, the component will expand in width and gain a subtle shadow effect.
- **Submit Action:** Clicking anywhere on the component (the input or the button) will navigate the user to the `/research` page.

### 4.3. Full View (`viewType="full"`)
- This view will retain all of its existing functionality without change.

## 5. Technical Implementation Plan
- **File to Modify:** `frontend/components/research/AiChatForm.vue`.
- **Conditional Rendering:** Use a `v-if="viewType === 'simplified'"` and `v-else` block at the top level of the component's template to switch between the two views.
- **Props:** Add the `viewType` and `previewText` props to the `<script setup>` block.
- **Logic:**
  - The existing logic for the full chat will be contained within the `v-else` block.
  - New logic for the simplified view's animation and navigation will be added. This logic should only run when `viewType` is `'simplified'`. Use `onMounted` to check the prop and initiate timers accordingly.
- **Navigation:** Use `useRouter()` for the simplified view's submit action.
- **Styling:** The new styles for the simplified view will be added to the component's `<style>` block, scoped if necessary.

## 6. Updated Todo List
1.  **Modify `AiChatForm.vue`:** Add `viewType` and `previewText` props.
2.  **Implement Conditional Rendering:** Set up `v-if`/`v-else` in the template to switch between views.
3.  **Build Simplified Template:** Create the HTML structure for the `'simplified'` view.
4.  **Add Simplified Logic:** Implement the animation and navigation logic for the simplified view.
5.  **Update Test Page:** Modify `frontend/pages/test-chat.vue` (or create a new one) to test both `viewType="full"` and `viewType="simplified"` variations.
6.  **Cleanup:** Delete the now-obsolete `frontend/components/research/AiChatPreviewForm.vue` file.

## 7. Mermaid Diagram: Updated Component Logic
```mermaid
graph TD
    A[Component Mounts] --> B{Check viewType prop};
    B -- "simplified" --> C[Render Simplified View];
    B -- "full" --> D[Render Full Interactive View];

    subgraph Simplified View
        C --> E{Set 5s timer};
        E --> F[Start Animation Loop];
        F --> G[Type Text];
        G --> H{Pause};
        H --> I[Erase Text];
        I --> J{Pause};
        J --> F;
        K[Click] --> L[Navigate to /research];
    end
    
    subgraph Full View
        D --> M[Existing Chat Logic];
    end

    C --> K;