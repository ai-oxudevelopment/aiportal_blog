# Feature Specification: Speckit Category Filter Display

**Feature Branch**: `001-speckit-category-filter`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "на странице не выводится фильтр по категориям. Когда я открываю  https://portal.aiworkplace.ru/speckits, должен отображаться список доступных категорий и функционал для фильтрации статей по категориям"

## Clarifications

### Session 2026-01-10

- Q: What attribute distinguishes categories used for prompts vs speckits? → A: Categories have a `type` attribute with values "prompt" or "speckit"; speckits page should only display categories where type="speckit"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Available Categories (Priority: P1)

As a visitor to the speckits library page, I want to see a list of available categories so that I can understand what types of speckits are available and navigate to content relevant to my interests.

**Why this priority**: This is the core issue - users cannot see categories at all, making it impossible to discover content by category. Without visible categories, the filtering functionality is completely inaccessible.

**Independent Test**: Can be tested by navigating to /speckits and verifying that category filters are visible in both desktop (sidebar) and mobile (horizontal scroll) views. Delivers value by enabling content discovery.

**Acceptance Scenarios**:

1. **Given** I am on the speckits page (/speckits), **When** the page loads, **Then** I should see a list of available categories displayed on desktop (left sidebar) and mobile (horizontal scroll above content)
2. **Given** speckits exist in the system with categories assigned, **When** I view the speckits page, **Then** the category filter should show only categories where type="speckit" (excluding type="prompt" categories)
3. **Given** the speckits data source returns empty or missing categories, **When** the page loads, **Then** appropriate categories should be displayed based on the actual data structure

---

### User Story 2 - Filter Speckits by Category (Priority: P2)

As a user browsing the speckits library, I want to filter speckits by selecting one or more categories so that I can focus on content relevant to my specific needs.

**Why this priority**: Once categories are visible, filtering is the primary user interaction. It enables users to narrow down content and find what they need faster.

**Independent Test**: Can be tested by selecting categories and verifying that only speckits with those categories are displayed. Delivers value by enabling efficient content discovery.

**Acceptance Scenarios**:

1. **Given** I am viewing the speckits page with visible categories, **When** I click on a category checkbox, **Then** the list of speckits should update to show only speckits that have that category assigned
2. **Given** I have one category selected, **When** I click on a second category, **Then** speckits with either category should be displayed (OR logic - show speckits matching ANY selected category)
3. **Given** I have multiple categories selected, **When** I deselect all categories, **Then** all speckits should be displayed again

---

### User Story 3 - Filter Speckits by Search and Category Combined (Priority: P3)

As a user looking for specific speckits, I want to combine search text with category filters so that I can find highly relevant content that matches both my keywords and category preferences.

**Why this priority**: This is an enhancement to basic filtering. Useful but not critical - users can achieve the same goal through multiple separate actions (filter by category, then search).

**Independent Test**: Can be tested by entering a search query and selecting categories, verifying that only speckits matching both criteria are shown. Delivers value by enabling precise content discovery.

**Acceptance Scenarios**:

1. **Given** I have a category selected, **When** I type in the search box, **Then** speckits should be filtered by both the selected category AND the search text
2. **Given** I have search text entered, **When** I select a category, **Then** results should match both the search text AND the category
3. **Given** I have both filters active, **When** I clear the search text, **Then** speckits should be filtered only by category

---

### Edge Cases

- What happens when all speckits have no categories assigned?
  - System should display empty state or helpful message indicating no categories are available
- What happens when a speckit has multiple categories?
  - Speckit should appear when ANY of its categories are selected (OR logic)
- What happens when category data structure is inconsistent or missing?
  - System should gracefully handle missing/invalid category data and display what's available
- What happens when categories have type="prompt" instead of type="speckit"?
  - System should exclude these categories from the speckits page filter display
- What happens when categories are missing the type attribute entirely?
  - System should exclude categories without type attribute from display to avoid showing incorrect categories
- What happens when filtering results in zero matches?
  - System should display "No speckits found" message with option to clear filters
- What happens when category names contain special characters or are very long?
  - Category names should be displayed with proper truncation or wrapping to maintain layout

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of available categories on the speckits page at /speckits
- **FR-002**: System MUST extract categories from speckit data returned by the API
- **FR-003**: System MUST filter categories to display only those with type="speckit" (excluding categories with type="prompt")
- **FR-004**: System MUST display category filters on desktop as a left sidebar
- **FR-005**: System MUST display category filters on mobile as a horizontally scrollable list
- **FR-006**: Users MUST be able to select one or multiple categories
- **FR-007**: System MUST filter speckits to show only those with at least one selected category when categories are selected
- **FR-008**: System MUST show all speckits when no categories are selected
- **FR-009**: Users MUST be able to deselect categories to return to viewing all speckits
- **FR-010**: System MUST persist category selection state during the session (until page refresh)
- **FR-011**: System MUST combine category filtering with search text filtering when both are active
- **FR-012**: System MUST display appropriate messaging when filtering results in zero matches
- **FR-013**: System MUST handle empty or missing category data gracefully
- **FR-014**: System MUST handle categories with missing or invalid type attribute by excluding them from display

### Key Entities

- **Speckit**: A structured AI configuration or template with attributes including title, description, slug, type, and categories
- **Category**: A classification label with id, name, and type that can be assigned to speckits for organization and filtering. Type attribute distinguishes categories: "prompt" categories are for articles page, "speckit" categories are for speckits page
- **Category Filter State**: The current set of selected category IDs that determines which speckits are displayed

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Category filters are visible on 100% of page loads when speckits with categories exist
- **SC-002**: Users can filter speckits by category in under 3 seconds from page load
- **SC-003**: Category filters work correctly on both desktop and mobile viewports
- **SC-004**: Combined search and category filtering returns accurate results (100% match rate for applied filters)
- **SC-005**: Zero results state displays clear messaging and option to reset filters
- **SC-006**: Category selection interface is accessible and usable with keyboard navigation
- **SC-007**: Visual feedback indicates active filters and which categories are selected
- **SC-008**: Page loading time with category filters does not increase by more than 500ms compared to current implementation

## Assumptions

- Speckits data source (Strapi CMS) contains speckit records with category relationships
- Categories have a consistent data structure with id, name, and type fields
- Category type attribute distinguishes between "prompt" (for articles page) and "speckit" (for speckits page)
- Existing filter components (CategoriesFilter, MobileCategoriesFilter) from the articles page can be reused or adapted
- The issue is related to data extraction/transformation logic rather than missing data
- Users access the speckits page via modern web browsers with JavaScript enabled
- Category filtering should use OR logic (show speckits matching ANY selected category)
