export function generateProgressBarEmoji(
  currentXP: number,
  totalXP: number,
  length: number = 10,
): string {
  const filledBlocks = Math.round((currentXP / totalXP) * length);
  const emptyBlocks = length - filledBlocks;

  return (
    ':purple_square:'.repeat(filledBlocks) +
    ':white_large_square:'.repeat(emptyBlocks)
  );
}
