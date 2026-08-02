# Design QA — Hero motion refresh

- Source visual truth: `/Users/zhayihan/.codex/generated_images/019f5132-0345-72a3-9859-5a28c9d54589/exec-42beec5e-fbda-47e7-a451-bae71ff6716f.png`
- Implementation screenshot: `/private/tmp/yihan-home-hero-final.png`
- Full-view comparison: `/private/tmp/yihan-home-hero-final-comparison.png`
- Viewport: 1274 × 717 desktop
- State: home route, dark theme, post-load typewriter complete, no hover state
- Primary interactions tested: theme toggle; View Portfolio navigation to `Artifacts & Data`; return-home brand button.
- Console errors: none created by the current preview after the page loaded.

## Findings

No actionable P0, P1, or P2 mismatches remain.

The implementation preserves the selected direction's dark Carolina-blue atmosphere, restrained orbit field, large editorial headline, portrait-led right column, and two primary actions. The existing portfolio's navigation, copy, fonts, and portrait asset remain intact by design.

### Required fidelity surfaces

- **Fonts and typography:** Playfair Display remains the display face and Inter the UI/body face. The source's large serif hierarchy, italic blue second line, compact uppercase availability badge, and readable body measure are retained.
- **Spacing and layout rhythm:** The hero remains a two-column composition with generous left-side breathing room. The portrait was narrowed in the final pass to better match the reference balance.
- **Colors and visual tokens:** Dark navy, Carolina blue, white text, and subtle blue illumination are consistent with the source direction and existing site tokens.
- **Image quality and asset fidelity:** The existing `Yihan.png` portrait is used directly, retaining the correct subject and a sharp crop. The new orbit/particle layer is decorative motion, not a replacement for a visual asset.
- **Copy and content:** Existing title, positioning statement, badge, CTAs, navigation, and alt text are preserved.

## Comparison history

1. **P2 — portrait column was visually wider than the selected reference.** Fixed by constraining the desktop portrait frame to `max-w-[24rem]` and aligning it to the end of its grid column.
2. **P2 — blue atmospheric emphasis was too subdued compared with the selected reference.** Fixed by increasing the dark-mode blue aura opacity.
3. **Post-fix evidence:** `/private/tmp/yihan-home-hero-final-comparison.png` shows a balanced portrait, visible orbit field, and clear title/CTA hierarchy with no clipping or overlap.

## Implementation checklist

- [x] Pointer-reactive aura added to the hero.
- [x] Restrained orbit and particle motion added on desktop.
- [x] Portrait and primary CTA gain motion feedback.
- [x] `prefers-reduced-motion` is respected.
- [x] Home navigation and View Portfolio transition tested.

## Follow-up polish

- [P3] If desired, use a future high-resolution portrait crop with more headroom; the current source image constrains the exact match to the mock.

final result: passed
