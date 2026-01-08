# Quick Start Guide: Speckit View Enhancements

**Feature**: Speckit View Enhancements (003-speckit-view-enhancements)
**Branch**: `003-speckit-view-enhancements`
**Last Updated**: 2026-01-08

## Overview

This guide helps developers quickly set up and start working on the Speckit view enhancements feature. Follow these steps to get your development environment running and understand the codebase structure.

---

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
  ```bash
  node --version  # Should be v18+ or v20+
  ```

- **Yarn**: 1.22+ (package manager)
  ```bash
  yarn --version  # Should be 1.22+
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

### Optional Tools

- **VS Code**: Recommended IDE with Vue/TypeScript extensions
- **Postman** or **curl**: For API testing
- **Browser DevTools**: Chrome/Firefox/Safari developer tools

---

## Environment Setup

### 1. Clone and Switch to Feature Branch

```bash
# Navigate to project root
cd /path/to/aiportal_blog

# Ensure you're on the feature branch
git checkout 003-speckit-view-enhancements

# Pull latest changes (if branch exists remotely)
git pull origin 003-speckit-view-enhancements
```

### 2. Install Dependencies

```bash
cd frontend
yarn install
```

**Expected output**:
```
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0000: └ Completed in 1s 234ms
➤ YN0000: ┌ Link step
➤ YN0000: └ Completed in 2s 456ms
➤ YN0000: Done in 5s 678ms
```

### 3. Install New Dependencies

```bash
# Add Mermaid.js for diagram rendering
yarn add mermaid@^11.0.0

# Add TypeScript types for development
yarn add -D @types/mermaid@^11.0.0
```

### 4. Configure Environment Variables

Create or update `.env` file in `frontend/` directory:

```bash
# frontend/.env
STRAPI_URL=http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru
PORT=8080
NUXT_PUBLIC_YANDEX_METRIKA_ID=your-metrika-id
```

**Note**: Copy `.env.example` if it exists:
```bash
cp .env.example .env
```

---

## Local Development Workflow

### 1. Start Development Server

```bash
cd frontend
yarn dev
```

**Expected output**:
```
Nuxt 3.2.0 with Nitro 2.9.0
  ➜ Local:    http://localhost:8080/
  ➜ Network:  use --host to expose
  ➜ Dev server is ready
```

**Server should run on**: `http://localhost:8080`

### 2. Verify Backend Connection

Open browser and navigate to:
- **Speckit list**: http://localhost:8080/speckits
- **Example Speckit**: http://localhost:8080/speckits/test-spec

**Expected behavior**:
- Page loads without errors
- Speckit detail page shows description component
- DevTools console shows no errors

### 3. Update Strapi CMS Schema

**Action Required**: Add `diagram` field to Articles content type

1. Log into Strapi admin panel
2. Navigate to **Content Type Builder**
3. Select **Articles** content type
4. Click **+ Add another field** → **Text (Long Text)**
5. Configure field:
   - **Name**: `diagram`
   - **Label**: Diagram (Mermaid source)
   - **Required**: No (unchecked)
   - **Default Value**: (empty)
6. Click **Finish**
7. Click **Save** (restart Strapi server if prompted)

**Verify**:
```bash
# Check Strapi logs for successful restart
# Should see: "The server is running on http://localhost:1337"
```

### 4. Create FAQ Content File

Create `frontend/public/speckit-faq.json`:

```bash
mkdir -p frontend/public
cat > frontend/public/speckit-faq.json << 'EOF'
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-08",
  "language": "ru",
  "categories": [
    {
      "id": "getting-started",
      "title": "Начало работы",
      "order": 1,
      "questions": [
        {
          "id": "what-is-speckit",
          "question": "Что такое Speckit?",
          "answer": "Speckit - это готовая конфигурация для вашего проекта, которая помогает структурировать работу с AI-ассистентами.",
          "order": 1
        },
        {
          "id": "how-to-download",
          "question": "Как скачать Speckit?",
          "answer": "Нажмите кнопку **Скачать** внизу страницы или скопируйте команду wget и выполните её в терминале.",
          "order": 2
        }
      ]
    },
    {
      "id": "environment-setup",
      "title": "Настройка окружения",
      "order": 2,
      "questions": [
        {
          "id": "system-requirements",
          "question": "Какие системные требования?",
          "answer": "Для работы со Speckit вам потребуется Node.js 18+, текстовый редактор (VS Code, Vim) и доступ к терминалу.",
          "order": 1
        }
      ]
    }
  ]
}
EOF
```

**Verify**:
```bash
curl http://localhost:8080/speckit-faq.json
# Should return JSON with FAQ content
```

---

## Project Structure

### Feature Files

```text
frontend/
├── components/speckit/
│   ├── SpeckitDownloadBar.vue       # [EXISTING] Download bar component
│   ├── SpeckitCopyCommand.vue       # [NEW] Copy command display
│   ├── SpeckitDiagramView.vue       # [NEW] Mermaid diagram renderer
│   └── SpeckitFaqSection.vue        # [NEW] FAQ Q&A display
│
├── composables/
│   ├── useFetchOneSpeckit.ts        # [EXISTING] Fetch speckit data
│   ├── useFileDownload.ts           # [EXISTING] File download logic
│   ├── useClipboard.ts              # [NEW] Clipboard operations
│   └── useMermaidDiagram.ts         # [NEW] Diagram rendering
│
├── pages/speckits/
│   ├── index.vue                    # [EXISTING] Speckit catalog
│   └── [speckitSlug].vue            # [MODIFY] Detail page (add new components)
│
├── server/api/speckits/
│   ├── [slug].get.ts                # [EXISTING] Fetch speckit details
│   └── [slug]/
│       └── diagram.get.ts           # [NEW] Fetch diagram data
│
├── types/
│   └── article.ts                   # [MODIFY] Add diagram/FAQ types
│
└── public/
    └── speckit-faq.json             # [NEW] Static FAQ content
```

### Key Files to Understand

1. **`[speckitSlug].vue`**: Main page component (modify to add new features)
2. **`useFetchOneSpeckit.ts`**: Data fetching composable (extend for diagram)
3. **`article.ts`**: TypeScript types (add new interfaces)
4. **`SpeckitDownloadBar.vue`**: Reference for styling patterns

---

## Development Tasks

### Task 1: Implement Copy Command Display

**File**: `frontend/components/speckit/SpeckitCopyCommand.vue`

**Requirements**:
- Display wget command (truncated to 40 chars)
- Copy to clipboard on click
- Show "Copied!" feedback for 2 seconds
- Fixed width: 250px (desktop), full width (mobile)

**Implementation steps**:
```bash
# Create component
touch frontend/components/speckit/SpeckitCopyCommand.vue

# Create composable
touch frontend/composables/useClipboard.ts
```

**Test**:
```bash
# Open Speckit detail page
# Click command display
# Verify clipboard contains wget command
# Verify visual feedback shows "Copied!"
```

---

### Task 2: Implement Diagram Rendering

**File**: `frontend/components/speckit/SpeckitDiagramView.vue`

**Requirements**:
- Render Mermaid diagram from Strapi data
- Handle invalid syntax gracefully
- Show loading state while fetching
- Lazy load Mermaid.js (P2 priority)

**Implementation steps**:
```bash
# Create component
touch frontend/components/speckit/SpeckitDiagramView.vue

# Create composable
touch frontend/composables/useMermaidDiagram.ts

# Create server route
mkdir -p frontend/server/api/speckits/[slug]
touch frontend/server/api/speckits/[slug]/diagram.get.ts
```

**Test**:
```bash
# Add diagram to Speckit in Strapi:
# diagram: "graph TD\n  A[Start] --> B[End]"

# Reload Speckit detail page
# Verify diagram renders below description
# Check console for Mermaid errors
```

---

### Task 3: Implement FAQ Section

**File**: `frontend/components/speckit/SpeckitFaqSection.vue`

**Requirements**:
- Load FAQ from `/speckit-faq.json`
- Display categories as expandable panels
- Render Markdown in answers
- Show error message if load fails

**Implementation steps**:
```bash
# Create component
touch frontend/components/speckit/SpeckitFaqSection.vue

# Create composable
touch frontend/composables/useSpeckitFaq.ts

# Create FAQ file
touch frontend/public/speckit-faq.json
```

**Test**:
```bash
# Open Speckit detail page
# Scroll to FAQ section at bottom
# Click category to expand
# Verify questions and answers display correctly
```

---

### Task 4: Integrate Components into Detail Page

**File**: `frontend/pages/speckits/[speckitSlug].vue`

**Changes**:
```vue
<template>
  <!-- Existing title section -->
  <div class="title-section">...</div>

  <!-- Existing description -->
  <div class="markdown-body">...</div>

  <!-- NEW: Copy command + download button -->
  <div class="download-section">
    <SpeckitCopyCommand
      :command="wgetCommand"
      class="command-display"
    />
    <button
      @click="handleDownload"
      class="download-button"
      aria-label="Скачать Speckit"
    >
      <DownloadIcon />
    </button>
  </div>

  <!-- NEW: Diagram view -->
  <SpeckitDiagramView
    v-if="speckit?.diagram"
    :diagram-source="speckit.diagram"
    class="diagram-section"
  />

  <!-- NEW: FAQ section -->
  <SpeckitFaqSection class="faq-section" />

  <!-- Existing AI Platform Selector -->
  <AiPlatformSelector
    v-if="speckit?.body"
    :prompt-text="speckit.body"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SpeckitCopyCommand from '~/components/speckit/SpeckitCopyCommand.vue'
import SpeckitDiagramView from '~/components/speckit/SpeckitDiagramView.vue'
import SpeckitFaqSection from '~/components/speckit/SpeckitFaqSection.vue'
import { useFileDownload } from '~/composables/useFileDownload'

const { speckit } = useFetchOneSpeckit(speckitSlug.value)
const { downloadFileFromUrl } = useFileDownload()

const wgetCommand = computed(() =>
  `wget https://portal.aiworkplace.ru/speckits/${speckit.value?.slug}/download`
)

const handleDownload = async () => {
  if (speckit.value?.file) {
    await downloadFileFromUrl(speckit.value.file.url, speckit.value.file.name)
  }
}
</script>
```

---

## Testing Procedures

### 1. Manual Testing

#### Copy Command Feature

**Test Case**: User copies wget command
1. Open Speckit detail page
2. Click on command display area
3. Open text editor and paste (Ctrl+V / Cmd+V)
4. **Expected**: Full wget command is pasted
5. **Expected**: "Copied!" feedback shows for 2 seconds

**Test Case**: Long command truncation
1. Speckit with very long slug (e.g., `very-long-speckit-slug-name-here`)
2. **Expected**: Command displays as "wget https://portal.aiworkplace.ru/speck..."
3. **Expected**: Full command still copied to clipboard

#### Diagram Feature

**Test Case**: Valid diagram renders
1. Add diagram to Speckit in Strapi
2. Reload Speckit detail page
3. **Expected**: Diagram appears below description
4. **Expected**: Nodes and connections are visible
5. **Expected**: No console errors

**Test Case**: Invalid diagram handled gracefully
1. Add invalid Mermaid syntax: "invalid diagram here"
2. Reload page
3. **Expected**: Error message displayed
4. **Expected**: No console crashes

**Test Case**: Speckit without diagram
1. Speckit with empty `diagram` field
2. **Expected**: Diagram section doesn't appear
3. **Expected**: No blank space or errors

#### FAQ Feature

**Test Case**: FAQ loads and displays
1. Scroll to bottom of Speckit detail page
2. **Expected**: FAQ section visible
3. **Expected**: Categories show as expandable panels
4. **Expected**: Questions and answers in Russian

**Test Case**: FAQ expansion works
1. Click on FAQ category
2. **Expected**: Category expands to show questions
3. Click again to collapse
4. **Expected**: Category collapses

**Test Case**: FAQ file missing
1. Delete `speckit-faq.json`
2. Reload page
3. **Expected**: Error message displayed
4. **Expected**: No console crashes

### 2. Browser Testing

Test in multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if on macOS)

**Mobile Testing**:
- ✅ Chrome DevTools mobile emulation (320px, 375px, 414px)
- ✅ Real device testing (if available)

### 3. API Testing

#### Diagram Endpoint

```bash
# Test with valid speckit
curl http://localhost:8080/api/speckits/test-spec/diagram

# Expected response:
# {"data":{"source":"graph TD\n  A[Start] --> B[End]","type":"flowchart","valid":true}}

# Test with non-existent speckit
curl http://localhost:8080/api/speckits/non-existent/diagram

# Expected: 404 error
```

#### FAQ File

```bash
# Test FAQ file loads
curl http://localhost:8080/speckit-faq.json

# Expected response:
# {"version":"1.0.0","lastUpdated":"2026-01-08","language":"ru","categories":[...]}
```

---

## Troubleshooting

### Common Issues

#### Issue: Mermaid diagram not rendering

**Symptoms**: Diagram section shows but no diagram visible

**Solutions**:
1. Check browser console for Mermaid errors
2. Verify `diagram` field exists in Strapi
3. Check `/api/speckits/{slug}/diagram` returns data
4. Verify Mermaid.js is installed: `yarn list mermaid`

**Debug**:
```javascript
// In browser console
console.log('Diagram source:', diagramSource.value)
console.log('Mermaid loaded:', typeof mermaid !== 'undefined')
```

---

#### Issue: Copy command not working

**Symptoms**: Click doesn't copy to clipboard

**Solutions**:
1. Check browser supports Clipboard API
2. Verify click handler is attached
3. Check for console errors

**Debug**:
```javascript
// In browser console
navigator.clipboard.writeText('test')
  .then(() => console.log('Clipboard works'))
  .catch(err => console.error('Clipboard failed:', err))
```

---

#### Issue: FAQ not loading

**Symptoms**: FAQ section shows error or doesn't appear

**Solutions**:
1. Verify `speckit-faq.json` exists in `frontend/public/`
2. Check JSON syntax is valid
3. Verify file is accessible: `curl http://localhost:8080/speckit-faq.json`

**Debug**:
```javascript
// In browser console
fetch('/speckit-faq.json')
  .then(r => r.json())
  .then(data => console.log('FAQ data:', data))
  .catch(err => console.error('FAQ load failed:', err))
```

---

#### Issue: Strapi connection error

**Symptoms**: API calls return 500 or connection refused

**Solutions**:
1. Verify `STRAPI_URL` in `.env` is correct
2. Check Strapi server is running
3. Test Strapi URL directly: `curl ${STRAPI_URL}/api/articles`

**Debug**:
```bash
# Test Strapi connection
curl http://localhost:1337/api/articles

# Check Strapi logs
docker logs strapi-container
```

---

## Performance Guidelines

### Code Splitting

```typescript
// Lazy load Mermaid.js (only when needed)
const { loadMermaid } = await import('~/composables/useMermaidDiagram')
```

### Image Optimization

- No images in this feature (all text/icons)
- Use SVG icons for scalability

### Bundle Size

```bash
# Check bundle size
yarn build

# Expected: Mermaid adds ~2MB (minified)
# Mitigation: Lazy loading, code splitting
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All components tested locally
- [ ] FAQ content reviewed and translated
- [ ] Strapi schema updated in production
- [ ] Environment variables configured
- [ ] No console errors or warnings
- [ ] Mobile responsive layout verified

### Deployment Steps

```bash
# 1. Merge feature branch to master
git checkout master
git merge 003-speckit-view-enhancements

# 2. Build for production
cd frontend
yarn build

# 3. Deploy build artifacts
# (Follow your deployment process)

# 4. Verify production
curl https://portal.aiworkplace.ru/speckits/test-spec
curl https://portal.aiworkplace.ru/api/speckits/test-spec/diagram
curl https://portal.aiworkplace.ru/speckit-faq.json
```

### Post-Deployment

- [ ] Test Speckit detail page in production
- [ ] Verify diagram rendering works
- [ ] Check FAQ section displays correctly
- [ ] Monitor error logs for issues
- [ ] Check analytics for user engagement

---

## FAQ Content Management

### Adding New FAQ Entries

Edit `frontend/public/speckit-faq.json`:

```json
{
  "categories": [
    {
      "id": "new-category",
      "title": "Новая категория",
      "order": 10,
      "questions": [
        {
          "id": "new-question",
          "question": "Новый вопрос?",
          "answer": "Новый ответ с **Markdown**",
          "order": 1
        }
      ]
    }
  ]
}
```

**Update version** for cache busting:
```json
{
  "version": "1.1.0",  // Increment version
  "lastUpdated": "2026-01-09"  // Update date
}
```

### FAQ Best Practices

1. **Keep answers concise**: 20-2000 characters
2. **Use Markdown** for formatting: `**bold**`, `` `code` ``, links
3. **Group by topic**: Create categories for related questions
4. **Order logically**: Most important questions first
5. **Language**: Russian for all user-facing text
6. **Testing**: Test Markdown rendering before deploying

---

## Next Steps

1. ✅ Environment set up
2. ✅ Dependencies installed
3. ⏭️ Implement components following Development Tasks
4. ⏭️ Test all features manually
5. ⏭️ Create pull request when ready

## Resources

- **Feature Spec**: [specs/003-speckit-view-enhancements/spec.md](specs/003-speckit-view-enhancements/spec.md)
- **Data Model**: [specs/003-speckit-view-enhancements/data-model.md](specs/003-speckit-view-enhancements/data-model.md)
- **API Contracts**: [specs/003-speckit-view-enhancements/contracts/api-endpoints.md](specs/003-speckit-view-enhancements/contracts/api-endpoints.md)
- **Research**: [specs/003-speckit-view-enhancements/research.md](specs/003-speckit-view-enhancements/research.md)
- **Constitution**: [.specify/memory/constitution.md](.specify/memory/constitution.md)

## Support

For questions or issues:
1. Check this guide's Troubleshooting section
2. Review feature spec for requirements
3. Check constitution for architecture guidelines
4. Consult existing components for patterns

---

**Happy coding! 🚀**
