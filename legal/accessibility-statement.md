---
title: Accessibility Statement
slug: accessibility
---

# Accessibility Statement

**Effective date:** {{effectiveDate}}

We want everyone to be able to use {{appName}}. We design and test the app and website against the Web Content Accessibility Guidelines (WCAG) 2.2, level AA.

## What we have done

- **Colour contrast:** text colours meet at least a 4.5:1 contrast ratio against their backgrounds in both light and dark themes, and interface boundaries such as input borders meet 3:1. These ratios are checked automatically in our build (`npm run check:contrast`).
- **Screen readers:** buttons, links, inputs and status messages have accessible names, roles and states for VoiceOver, TalkBack and desktop screen readers.
- **Images:** images have text alternatives; purely decorative images are hidden from assistive technology.
- **Keyboard:** the website and the web version of the app can be used with a keyboard alone, with a visible focus indicator and a "Skip to content" link.
- **Text size:** the app respects your device's text-size setting.
- **Touch targets:** interactive elements are at least 44 × 44 points.
- **Motion:** the app does not rely on animation to convey information.
- **No time limits** on reading or completing tasks.

## Known limitations

- This statement is based on our own testing; we have not yet had an independent accessibility audit.
- Long AI-generated responses are shown as plain text; headings and lists inside them are not exposed as structure to screen readers.

## Feedback

If you find a barrier, please tell us at {{supportEmail}}. We aim to reply within 5 working days. You can also contact your local enforcement body if you are not satisfied with our response.
