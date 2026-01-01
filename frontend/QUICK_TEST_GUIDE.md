# Quick Test Guide - Mobile PWA

## 🚀 Server Status: RUNNING ✅

**URL**: http://localhost:8080/
**Status**: All systems operational
**Data**: Successfully fetching 69 articles from Strapi

---

## 📱 How to Test Mobile Viewport

### Option 1: Chrome DevTools (Recommended)

1. **Open Chrome** and navigate to: http://localhost:8080/

2. **Open DevTools**:
   - Mac: `Cmd + Option + I`
   - Windows/Linux: `F12` or `Ctrl + Shift + I`

3. **Toggle Device Toolbar**:
   - Mac: `Cmd + Shift + M`
   - Windows/Linux: `Ctrl + Shift + M`
   - Or click the device icon in DevTools

4. **Select Device**:
   - Click the device dropdown (default: "Responsive")
   - Select "iPhone SE" for 375px viewport
   - Select "iPhone 12 Pro" for 390px viewport
   - Select "iPad" for 768px viewport

5. **Test Checklist**:
   - ✅ Page loads without errors
   - ✅ No horizontal scrolling
   - ✅ Text is readable (16px base size)
   - ✅ Hero heading scales properly (text-3xl on mobile)
   - ✅ Search bar is full width
   - ✅ Categories filter shows horizontal scroll on mobile

### Option 2: Real Device Testing

1. **Connect your device** to the same network as your development machine

2. **Find your local IP**:
   ```bash
   # Mac
   ipconfig getifaddr en0

   # Linux
   hostname -I

   # Windows
   ipconfig
   ```

3. **Access from device**:
   - Open browser on your mobile device
   - Navigate to: `http://YOUR_LOCAL_IP:8080/`
   - Example: `http://192.168.1.100:8080/`

---

## ✅ What to Look For

### 1. Homepage (index.vue)

#### iPhone SE (375px width)
- ✅ Hero title: "Библиотека агентов" (text-3xl, ~30px)
- ✅ Hero description: readable text (text-base, 16px)
- ✅ Search bar: full width, properly sized
- ✅ Categories: horizontal scroll (hidden on desktop)
- ✅ Prompt cards: stacked vertically, full width
- ✅ No horizontal scroll anywhere
- ✅ Touch targets: minimum 44x44px

#### iPad (768px width)
- ✅ Layout: single column (not desktop yet)
- ✅ Sidebar: still hidden (shows at 1024px+)
- ✅ Categories: horizontal scroll visible
- ✅ More content visible due to larger screen

#### Desktop (1280px+)
- ✅ Sidebar: visible on left
- ✅ Categories: vertical filter in sidebar
- ✅ Main content: takes remaining space
- ✅ Multi-column prompt grid

### 2. Responsive Breakpoints

```css
xs: 320px  /* iPhone SE - smallest */
sm: 375px  /* iPhone 12/13 - standard mobile */
md: 768px  /* iPad - tablet */
lg: 1024px /* Desktop - sidebar appears */
xl: 1280px /* Large desktop */
```

### 3. Touch Targets

All interactive elements should be:
- **Minimum**: 44x44px (iOS)
- **Recommended**: 48x48px (Android WCAG AAA)
- **Spacing**: 12px padding

Test:
- [ ] Search input
- [ ] Category chips
- [ ] Prompt cards
- [ ] Navigation links

---

## 🎨 Visual Changes Made

### Typography Scaling

| Element | Mobile (320px) | Tablet (768px) | Desktop (1280px) |
|---------|---------------|----------------|------------------|
| H1 Title | text-3xl (30px) | text-5xl (48px) | text-6xl (60px) |
| Description | text-base (16px) | text-lg (18px) | text-xl (20px) |
| Padding | py-8 (32px) | py-12 (48px) | py-16 (64px) |
| Gap | gap-4 (16px) | gap-6 (24px) | gap-8 (32px) |

### Layout Changes

**Mobile (<768px)**:
```
┌─────────────────┐
│   Hero Title    │
│   Description   │
├─────────────────┤
│   Search Bar    │
├─────────────────┤
│ Categories →→→  │  ← Horizontal scroll
├─────────────────┤
│  Prompt Card 1  │
│  Prompt Card 2  │
│  Prompt Card 3  │
└─────────────────┘
```

**Desktop (≥1024px)**:
```
┌─────────┬─────────────────┐
│         │   Hero Title    │
│Sidebar ├─────────────────┤
│Filter   │   Search Bar    │
│         ├─────────────────┤
│         │  Prompt Grid    │
│         │ ┌───┬───┬───┐   │
│         │ │ 1 │ 2 │ 3 │   │
│         │ ├───┼───┼───┤   │
│         │ │ 4 │ 5 │ 6 │   │
│         │ └───┴───┴───┘   │
└─────────┴─────────────────┘
```

---

## 🔍 Debugging Tips

### If Something Doesn't Work:

1. **Check browser console**:
   - Open DevTools → Console tab
   - Look for red errors
   - Common issues: Missing components, TypeScript errors

2. **Check network tab**:
   - Open DevTools → Network tab
   - Verify assets are loading
   - Look for failed requests (404 errors)

3. **Check Vue DevTools**:
   - Install Vue DevTools extension
   - Inspect component tree
   - Verify props and data

4. **Hard refresh**:
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`
   - Clears cache and reloads

5. **Restart server**:
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   yarn dev
   ```

---

## 📊 Current Implementation Status

### ✅ Working Features
- [x] PWA module installed
- [x] Mobile composables created
- [x] Responsive CSS utilities
- [x] Tailwind breakpoints configured
- [x] Vuetify mobile defaults
- [x] iOS meta tags
- [x] Homepage mobile layout
- [x] Data fetching from Strapi

### 🔄 In Progress
- [ ] Header mobile menu button
- [ ] Sidebar collapsible on mobile
- [ ] Component touch targets
- [ ] Blog page mobile layout
- [ ] Research interface mobile

### ⏳ Not Started
- [ ] PWA install prompts
- [ ] Offline mode UI
- [ ] Bottom navigation
- [ ] Service worker testing

---

## 🎯 Next Steps

1. **Test the current homepage** on mobile viewport
2. **Verify responsive behavior** at different breakpoints
3. **Check for issues** and report back
4. **Continue implementation** with remaining components

---

## 💬 Feedback

After testing, please share:
- What looks good? ✅
- What needs adjustment? ⚠️
- Any bugs or errors found? 🐛
- Suggestions for improvement? 💡

**Ready for your feedback!**
