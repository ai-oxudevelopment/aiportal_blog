# Feature Specification: Speckit UI Enhancements

**Feature Branch**: `002-speckit-ui`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "Перемести кнопку загрузки вниз, визуально сделай ее такой же как сейчас идет выбор между ChatGPT, ClaudeCode и Perplexity. Размести кнопку отдельным компонентом под этим блоком. Компонент состоит из 2-х частей: кнопка \"скачать\" и кнопка \"?\". При нажатии на скачать - скачивается файл, при нажатии на \"?\" открывается вспомогательное окно с краткой инструкцией как использовать Speckит. Также на страницу /speckits/[speckitSlug].vue выведи кнопки с выбором AI-ассистента также как это работает сейчас на Prompt странице"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Download Speckit Configuration (Priority: P1)

A user viewing a speckit detail page wants to download the speckit configuration file to use in their own project. The user sees a download button at the bottom of the page styled consistently with other platform selection buttons. When clicked, the file downloads immediately without requiring the user to scroll back up to the top section.

**Why this priority**: This is the core utility of the speckit page - enabling users to actually use the speckit in their projects. Moving the button to the bottom improves discoverability after reading the content.

**Independent Test**: Can be fully tested by navigating to a speckit page, clicking the download button, and verifying the file downloads correctly with the correct content and filename.

**Acceptance Scenarios**:

1. **Given** a user is viewing a speckit detail page with a configuration file, **When** they scroll to the bottom of the page, **Then** they see a download button positioned at the bottom of the viewport
2. **Given** a user clicks the download button, **When** the download completes, **Then** the browser downloads the speckit configuration file with the correct filename and format
3. **Given** a user clicks the download button, **When** the download is in progress, **Then** the button shows a loading state and is disabled to prevent multiple clicks
4. **Given** a download fails, **When** the error occurs, **Then** an error message is displayed to the user for 5 seconds

---

### User Story 2 - Access Speckit Usage Instructions (Priority: P2)

A user viewing a speckit wants to understand how to use it in their project. They see a "?" button next to the download button at the bottom of the page. When clicked, a modal window appears with step-by-step instructions on how to integrate and use the speckit.

**Why this priority**: This provides critical help documentation that improves user success and reduces support burden. It's secondary to actually downloading the file but still important for user experience.

**Independent Test**: Can be fully tested by clicking the "?" button and verifying the modal appears with instructions, and that the modal can be closed.

**Acceptance Scenarios**:

1. **Given** a user is viewing a speckit detail page, **When** they click the "?" button, **Then** a modal window opens with usage instructions
2. **Given** the instruction modal is open, **When** the user clicks outside the modal or presses Escape, **Then** the modal closes
3. **Given** the instruction modal is open, **When** the user views the content, **Then** they see clear, step-by-step instructions on how to use the speckit
4. **Given** a user has closed the instruction modal, **When** they click the "?" button again, **Then** the modal reopens with the same content

---

### User Story 3 - Try Speckit in AI Assistant (Priority: P3)

A user viewing a speckit wants to try it out directly in their preferred AI assistant (ChatGPT, Claude, or Perplexity). They see platform selection buttons at the bottom of the page similar to the prompt page. When they click a platform button, the speckit content opens in that AI platform.

**Why this priority**: This enhances user engagement by providing an immediate way to interact with the speckit content. It's a nice-to-have feature that improves UX but doesn't block core functionality.

**Independent Test**: Can be fully tested by clicking each platform button and verifying the correct URL opens in a new tab with the speckit content.

**Acceptance Scenarios**:

1. **Given** a user is viewing a speckit detail page, **When** they scroll to the bottom, **Then** they see three buttons for ChatGPT, Claude, and Perplexity platforms
2. **Given** a user clicks the ChatGPT button, **When** the action completes, **Then** a new tab opens with the speckit content in ChatGPT
3. **Given** a user clicks the Claude button, **When** the action completes, **Then** a new tab opens with the speckit content in Claude
4. **Given** a user clicks the Perplexity button, **When** the action completes, **Then** a new tab opens with the speckit content in Perplexity
5. **Given** a speckit has no body content, **When** the platform buttons are displayed, **Then** the buttons are disabled or hidden

---

### Edge Cases

- What happens when a speckit doesn't have a configuration file? (Download button should be hidden or disabled)
- What happens when a speckit has no body content? (AI platform buttons should be disabled or hidden)
- What happens when the download fails due to network error? (Show error message for 5 seconds)
- What happens when the file URL is malformed? (Show error message and log to console)
- What happens when the user is on mobile and the bottom controls interfere with content? (Controls should be responsive and not overlap important content)
- What happens when the instruction modal content is not available? (Show default instructions or a generic message)
- What happens when multiple download buttons are clicked rapidly? (Prevent multiple concurrent downloads with loading state)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST relocate the speckit configuration file download functionality from the top section to the bottom of the speckit detail page
- **FR-002**: System MUST display a unified download and help component at the bottom of the speckit detail page
- **FR-003**: System MUST style the bottom component to match the visual design of the AI platform selector (rounded pill buttons, gradient background, consistent sizing)
- **FR-004**: System MUST provide a download button that downloads the speckit configuration file when clicked
- **FR-005**: System MUST provide a help button ("?") that opens a modal with speckit usage instructions when clicked
- **FR-006**: System MUST display AI assistant selection buttons (ChatGPT, Claude, Perplexity) on the speckit detail page
- **FR-007**: System MUST position the download/help component and AI platform buttons at the bottom of the page in a fixed or sticky position
- **FR-008**: System MUST show a loading state on the download button while the download is in progress
- **FR-009**: System MUST display error messages for failed downloads for 5 seconds before auto-dismissing
- **FR-010**: System MUST open the selected AI platform in a new browser tab when a platform button is clicked
- **FR-011**: System MUST support modal open/close interactions via click outside, Escape key, and close button
- **FR-012**: System MUST handle speckits without configuration files by hiding or disabling the download button
- **FR-013**: System MUST handle speckits without body content by hiding or disabling AI platform buttons
- **FR-014**: System MUST maintain the existing download functionality for Markdown and ZIP formats in the content section
- **FR-015**: System MUST render the instruction modal content with proper markdown formatting and readable typography

### Key Entities

- **Speckit Configuration File**: A downloadable file associated with a speckit that contains project configuration data. Attributes: filename, size, URL
- **Speckit Content**: The markdown body content of the speckit that can be shared with AI platforms. Attributes: body text, title
- **Speckit Usage Instructions**: Help documentation explaining how to integrate and use a speckit in a project. Attributes: title, steps, examples
- **AI Platform**: An external AI service where users can interact with speckit content. Attributes: name, URL template, icon, color scheme

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can download the speckit configuration file with 1 click from the bottom of the page without scrolling back up
- **SC-002**: Users can access speckit usage instructions within 2 clicks from any point on the speckit detail page
- **SC-003**: Users can try a speckit in their preferred AI platform (ChatGPT, Claude, or Perplexity) with 1 click
- **SC-004**: The download and help component matches the visual design consistency of the AI platform selector (same border radius, background gradient, button sizing)
- **SC-005**: The bottom controls do not overlap or obscure page content on mobile devices (screen widths < 768px)
- **SC-006**: Error messages for failed downloads are visible to users for at least 5 seconds with clear messaging
- **SC-007**: Page load time is not negatively impacted by the new components (target: < 2 seconds for initial load)
- **SC-008**: Users report improved ease of use through reduced clicks needed to download speckit files (baseline: 1 click after scrolling to top; target: 1 click from bottom position)
