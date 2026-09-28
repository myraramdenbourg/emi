# Replace puzzle card images with hand-drawn symbols

## Goal
On each puzzle card, replace the current 400x600 puzzle photo with the hand-drawn symbol from the uploaded answer-key sheet (coffee cup, fish, ferris wheel, cheese, gum wall brick, flower, pig, envelope, apple).

## Approach

1. **Crop the symbols from the uploaded sheet**
   - Use Python/PIL on the uploaded screenshot (428x1376) to auto-detect and crop each icon (non-background pixels per row) into individual PNGs.
   - Save as `public/assets/icons/coffee.png`, `fish.png`, `ferris.png`, `cheese.png`, `gum.png`, `flowers.png`, `pigs.png`, `postalley.png`, `produce.png`.
   - Keep the cream paper background and baked-in drop shadow from the sheet — the icons will sit inside a framed tile so the crop edge reads as intentional.

2. **Update `src/components/PuzzleCard.tsx`**
   - Change `getImageForPuzzle` to return the new icon paths.
   - Replace the tall 4:6 image container with a smaller square "stamp" tile (bordered, matching the existing card border style) that centers the symbol — cards become shorter and scannable like the answer sheet.
   - "The final letter" has no symbol on the sheet: keep showing a large question mark in the tile (rendered as text or the existing question-mark image, whichever looks cleaner).
   - Keep the solved state behavior unchanged (desaturation + green checkmark overlay + SOLVED stamp still apply to the icon tile).

3. **Verify**
   - Build check plus a Playwright screenshot of the card grid to confirm icons render, cards look right solved/unsolved, and layout holds on mobile-width preview.

## Notes
- Only the card display changes; hint/answer modals and game logic are untouched.
