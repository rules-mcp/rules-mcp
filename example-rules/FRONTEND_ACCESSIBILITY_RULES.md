---
name: FRONTEND_ACCESSIBILITY_RULES
description: 'Web accessibility guidelines for creating inclusive user interfaces that work for all users.'
tags: ['accessibility', 'frontend', 'a11y', 'inclusive-design', 'wcag']
---

# Frontend Accessibility Rules

Follow WCAG 2.1 AA guidelines for accessible web development:

## Semantic HTML

- Use proper HTML elements for their intended purpose
- Implement proper heading hierarchy (h1-h6)
- Use landmarks (main, nav, aside, footer) for page structure
- Include alt text for all meaningful images

## Keyboard Navigation

- Ensure all interactive elements are keyboard accessible
- Implement visible focus indicators
- Use proper tab order with tabindex when necessary
- Support escape key for modals and dropdowns

## Screen Reader Support

- Use ARIA labels and descriptions where needed
- Implement proper form labels and error messages
- Announce dynamic content changes with aria-live regions
- Test with actual screen readers (NVDA, JAWS, VoiceOver)

## Color and Contrast

- Maintain 4.5:1 contrast ratio for normal text
- Don't rely solely on color to convey information
- Support both light and dark mode preferences
- Test for color blindness accessibility

## Responsive Design

- Ensure content is accessible at 200% zoom
- Support both portrait and landscape orientations
- Make touch targets at least 44px × 44px
- Test on various devices and screen sizes
