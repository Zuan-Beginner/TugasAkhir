# 📐 Typography Audit & Standardization Plan

## Current State Analysis

### Font Sizes Scattered Across Project
```
❌ BEFORE (Messy)
- 9px, 10px, 11px, 12px, 12px, 13px, 13px, 13px, 14px, 14px, 14px, 14px, 
- 15px, 16px, 18px, 20px, 22px, 24px, 24px, 28px, 48px
- Total: 20+ different sizes with overlaps & no clear hierarchy
```

### Usage Pattern
- **Too many near-duplicates**: 13px used for 3 different purposes
- **No semantic naming**: Just numbers, hard to understand purpose
- **Inline styles everywhere**: `fontSize: 12px` scattered in JSX
- **Inconsistent across pages**: Same component looks different in different pages

---

## 📊 Font Size Inventory

| Size | Count | Used For | File |
|------|-------|----------|------|
| 9px | 1 | ? | admin/page.tsx |
| 10px | 2 | Badge counts | home/page.tsx, admin |
| 11px | 2 | Small text | forum, ReportDetailModal |
| 12px | 8+ | Timestamps, labels, small text | Multiple |
| 13px | 5+ | Body text, description | Multiple |
| 14px | 8+ | Body text, labels | Multiple |
| 15px | 2 | Button text, labels | admin, forum |
| 16px | 2 | Subheadings | ReportDetailModal |
| 18px | 1 | Icon size | lapor/page.tsx |
| 20px | 2 | Headings | forum, home |
| 22px | 1 | Login title | admin/page.tsx |
| 24px | 3 | Modal titles, large headings | ReportDetailModal, forum |
| 28px | 2 | Page titles | home, page |
| 48px | 2 | Large icons | admin, layanan |

### Issues Found
- ✅ Good: Most sizes fall into 3 ranges (small: 9-14px, body: 14-18px, heading: 20-28px)
- ❌ Bad: 14px used for BOTH body text AND headings
- ❌ Bad: No clear distinction between levels
- ❌ Bad: Responsive sizes not implemented (mobile vs desktop)

---

## 🎯 Proposed Typography Scale

### New Standardized Scale (Desktop)
```
--text-xs:    11px  → Captions, timestamps, hints
--text-sm:    12px  → Small labels, badges
--text-base:  14px  → Body text, regular content
--text-md:    16px  → Emphasized body, form labels
--text-lg:    18px  → Small headings, subheadings
--text-xl:    20px  → Section headings (h3)
--text-2xl:   24px  → Page headings (h2)
--text-3xl:   28px  → Hero/main headings (h1)
```

### Mobile Responsive Scale
```
--text-xs-mobile:    10px
--text-sm-mobile:    11px
--text-base-mobile:  13px
--text-md-mobile:    14px
--text-lg-mobile:    16px
--text-xl-mobile:    18px
--text-2xl-mobile:   20px
--text-3xl-mobile:   24px
```

### Line Heights
```
--lh-tight:   1.2    → Headings
--lh-normal:  1.5    → Body text
--lh-relaxed: 1.75   → Long-form content
```

### Font Weights
```
--fw-normal:  400    → Body
--fw-medium:  500    → Emphasized
--fw-semibold: 600   → Labels, small headings
--fw-bold:    700    → Headings
--fw-extrabold: 800  → Hero headings
```

---

## 🔄 Migration Map

### Current → New Scale
```
9px    → --text-xs              (captions only)
10px   → --text-sm              (badges, small counts)
11px   → --text-xs              (timestamps)
12px   → --text-sm              (labels, helper text)
13px   → --text-base            (body text)
14px   → --text-base or --text-md (disambiguate by usage)
15px   → --text-md              (button text, form labels)
16px   → --text-lg              (emphasized text, subheadings)
18px   → --text-lg              (align with subheadings)
20px   → --text-xl              (section headings)
22px   → --text-2xl             (large headings, round to 24px)
24px   → --text-2xl             (modal titles, page titles)
28px   → --text-3xl             (hero headings)
48px   → Icon size (separate) → --icon-size-lg
```

---

## 📝 CSS Implementation

### Step 1: Add to globals.css

```css
/* ===== TYPOGRAPHY SCALE ===== */
:root {
  /* Font sizes - Desktop */
  --text-xs:    11px;
  --text-sm:    12px;
  --text-base:  14px;
  --text-md:    16px;
  --text-lg:    18px;
  --text-xl:    20px;
  --text-2xl:   24px;
  --text-3xl:   28px;

  /* Font sizes - Mobile */
  --text-xs-mobile:    10px;
  --text-sm-mobile:    11px;
  --text-base-mobile:  13px;
  --text-md-mobile:    14px;
  --text-lg-mobile:    16px;
  --text-xl-mobile:    18px;
  --text-2xl-mobile:   20px;
  --text-3xl-mobile:   24px;

  /* Line heights */
  --lh-tight:   1.2;
  --lh-normal:  1.5;
  --lh-relaxed: 1.75;

  /* Font weights */
  --fw-normal:      400;
  --fw-medium:      500;
  --fw-semibold:    600;
  --fw-bold:        700;
  --fw-extrabold:   800;

  /* Icon sizes */
  --icon-size-sm:   16px;
  --icon-size-md:   24px;
  --icon-size-lg:   32px;
  --icon-size-xl:   48px;
}

/* Mobile responsive */
@media (max-width: 640px) {
  :root {
    --text-xs:    var(--text-xs-mobile);
    --text-sm:    var(--text-sm-mobile);
    --text-base:  var(--text-base-mobile);
    --text-md:    var(--text-md-mobile);
    --text-lg:    var(--text-lg-mobile);
    --text-xl:    var(--text-xl-mobile);
    --text-2xl:   var(--text-2xl-mobile);
    --text-3xl:   var(--text-3xl-mobile);
  }
}

/* ===== TYPOGRAPHY UTILITY CLASSES ===== */
.text-xs {
  font-size: var(--text-xs);
  line-height: var(--lh-tight);
}

.text-sm {
  font-size: var(--text-sm);
  line-height: var(--lh-tight);
}

.text-base {
  font-size: var(--text-base);
  line-height: var(--lh-normal);
}

.text-md {
  font-size: var(--text-md);
  line-height: var(--lh-normal);
}

.text-lg {
  font-size: var(--text-lg);
  line-height: var(--lh-normal);
}

.text-xl {
  font-size: var(--text-xl);
  line-height: var(--lh-normal);
  font-weight: var(--fw-semibold);
}

.text-2xl {
  font-size: var(--text-2xl);
  line-height: var(--lh-normal);
  font-weight: var(--fw-bold);
}

.text-3xl {
  font-size: var(--text-3xl);
  line-height: var(--lh-tight);
  font-weight: var(--fw-extrabold);
}

/* Font weights */
.fw-normal { font-weight: var(--fw-normal); }
.fw-medium { font-weight: var(--fw-medium); }
.fw-semibold { font-weight: var(--fw-semibold); }
.fw-bold { font-weight: var(--fw-bold); }
.fw-extrabold { font-weight: var(--fw-extrabold); }
```

---

## 🔧 Implementation Plan

### Phase 1: Setup (30 mins)
- [ ] Add typography scale to `globals.css`
- [ ] Add utility classes
- [ ] Test: verify CSS variables work in browser

### Phase 2: Update Components (2-3 hours)
Priority order (highest impact first):

**2.1 Login Page** (app/lapor_mulia/page.tsx)
```tsx
// BEFORE
<h1 style={{fontSize: 28, fontWeight: 800}}>Lapor Mulia</h1>
<p style={{fontSize: 14, opacity: 0.9}}>Subtitle</p>

// AFTER
<h1 className="text-3xl">Lapor Mulia</h1>
<p className="text-base" style={{opacity: 0.9}}>Subtitle</p>
```

**2.2 Forum Page** (app/lapor_mulia/forum/page.tsx)
```tsx
// Update 30+ inline font-size declarations
// Most critical: message text (12-14px), timestamps, labels
```

**2.3 Home Page** (app/lapor_mulia/home/page.tsx)
```tsx
// Update 10+ instances
// Critical: dashboard title, stat values, section headers
```

**2.4 Report Detail Modal** (app/lapor_mulia/components/ReportDetailModal.tsx)
```tsx
// Update modal typography (title, body, meta info)
```

**2.5 Lapor Page** (app/lapor_mulia/lapor/page.tsx)
```tsx
// Update form labels, helper text, error messages
```

### Phase 3: Dark Mode Adjustment (30 mins)
- [ ] Verify contrast in dark mode (especially --text-xs)
- [ ] Adjust if needed (might need lighter gray for dark mode)

### Phase 4: Verification (30 mins)
- [ ] Visual testing on desktop (1920px)
- [ ] Responsive testing on tablet (768px)
- [ ] Responsive testing on mobile (375px)
- [ ] Dark mode testing across all pages

---

## 📋 Files to Modify

1. **globals.css** ← Add typography scale (NEW)
2. **page.tsx** (login) ← 5-10 changes
3. **home/page.tsx** ← 10-15 changes
4. **forum/page.tsx** ← 30+ changes
5. **components/ReportDetailModal.tsx** ← 8-10 changes
6. **lapor/page.tsx** ← 5-8 changes
7. **layanan/page.tsx** ← 5-10 changes
8. **admin/page.tsx** ← 5-10 changes

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Inline styles everywhere
**Problem**: `style={{fontSize: 12}}` in JSX doesn't work with classes
**Solution**: Use `style={{fontSize: 'var(--text-sm)'}}` OR create `<Typography>` component

### Issue 2: Different purposes, same size
**Problem**: Both "label" and "body text" at 14px currently
**Solution**: Use semantic sizes - labels become `--text-md`, body becomes `--text-base`

### Issue 3: Icon sizes mixed with text
**Problem**: `fontSize: 48px` for icons vs `font-size: 28px` for text
**Solution**: Separate icon sizes into `--icon-size-*` variables

### Issue 4: Mobile not responsive now
**Problem**: No current mobile breakpoints for typography
**Solution**: Add media query `@media (max-width: 640px)` to scale down

---

## 🎯 Success Criteria

- [ ] ✅ All font-size declarations use CSS variables
- [ ] ✅ Responsive typography works on mobile/tablet/desktop
- [ ] ✅ Dark mode contrast is WCAG AA compliant
- [ ] ✅ Consistent typography across all pages
- [ ] ✅ No inline `fontSize` in JSX (use classes or CSS variables)
- [ ] ✅ Zero broken layouts after changes

---

## 💾 Maintenance Guide

### How to use in future:
```tsx
// Option 1: Use utility classes (preferred)
<h1 className="text-3xl fw-bold">Main Heading</h1>
<p className="text-base">Body text</p>

// Option 2: Use CSS variables (inline)
<div style={{fontSize: 'var(--text-md)', fontWeight: 'var(--fw-semibold)'}}>
  Label
</div>

// Option 3: Avoid! (old way)
<div style={{fontSize: 14, fontWeight: 700}}>❌ Don't do this</div>
```

### Adding new component:
1. Check if size already exists in scale
2. If yes, use it
3. If no, add new size to scale (don't create new inline size)
4. Document why new size was needed

---

## Time Estimate
- Setup: 30 mins
- Implementation: 2-3 hours
- Testing: 30-60 mins
- **Total: 3-4 hours**

---

## Next Steps
1. Review this plan ✓
2. Approve changes
3. Start Phase 1 (add to globals.css)
4. Execute Phase 2 page by page
5. Verify Phase 3 & 4
