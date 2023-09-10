import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
import { Inventory } from './entities/inventory.entity';
import { Stack } from './entities/stack.entity';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { InventoryService } from './inventory.service';

function wrapText(context, text, maxWidth): string[] {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else if (testWidth > maxWidth) {
      let truncatedWord = words[n];
      while (
        context.measureText(truncatedWord + '...').width > maxWidth &&
        truncatedWord.length > 0
      ) {
        truncatedWord = truncatedWord.substring(0, truncatedWord.length - 1);
      }
      lines.push(truncatedWord + '...');
      line = '';
    } else {
      line = testLine;
    }
  }

  lines.push(line.trim());

  if (lines.length > 2) {
    lines.length = 2;
    lines[1] = lines[1].slice(0, -3) + '...';
  }

  return lines;
}

export async function createInventoryGridImage(
  inventory: Inventory,
  inventoryService: InventoryService,
): Promise<Buffer> {
  const stacks = inventory.stacks;

  const imageDirectory = join(
    __dirname,
    '..',
    '..',
    '..',
    'generated',
    'inventory',
  );
  const imageFilePath = join(imageDirectory, `${inventory.id}.png`);
  if (!existsSync(imageDirectory)) {
    mkdirSync(imageDirectory, { recursive: true });
  }
  if (
    existsSync(imageFilePath) &&
    inventory.lastImageGeneratedAt >= inventory.updatedAt
  ) {
    return readFileSync(imageFilePath);
  }
  const itemsPerRow = 5;
  const cellSize = 100;
  const textHeight = 20; // Space for item name
  const spacing = 10;
  const margin = 20; // Margin around the entire inventory

  const rows = Math.ceil(stacks.length / itemsPerRow);

  const canvasWidth =
    itemsPerRow * cellSize + (itemsPerRow - 1) * spacing + 2 * margin;
  const canvasHeight =
    rows * (cellSize + textHeight) + (rows - 1) * spacing + 2 * margin;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  const drawItem = async (stack: Stack, x: number, y: number) => {
    const item = stack.item;

    const frameHeight = 32;
    const imageSize = cellSize;

    try {
      const image = await loadImage(item.imageUrl);
      ctx.drawImage(image, x, y, cellSize, imageSize - frameHeight);
    } catch (error) {
      console.error(`Failed to load image for item ${item.name}`, error);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(x, y, cellSize, cellSize - frameHeight);
    }

    ctx.fillStyle = '#2C2C2C';
    ctx.fillRect(x, y + imageSize - frameHeight, cellSize, frameHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Tahoma';

    const maxWidth = cellSize - 10;
    const lineHeight = 15;

    const wrappedLines = wrapText(ctx, item.name, maxWidth);

    let textYBase;
    if (wrappedLines.length === 1) {
      // Adjust for single line: position the text to the middle of the spacing
      textYBase = y + imageSize - frameHeight / 2;
    } else {
      // For two lines: start to fit both lines within the spacing
      textYBase = y + imageSize - frameHeight + lineHeight;
    }

    for (let j = 0; j < wrappedLines.length; j++) {
      ctx.fillText(wrappedLines[j], x + 5, textYBase + j * lineHeight);
    }
    // Draw the frame for quantity with background color
    const qtyFrameWidth = 20; // Adjusted width
    const qtyFrameHeight = 20; // Adjusted height
    ctx.fillStyle = '#2C2C2C';
    ctx.fillRect(
      x + cellSize - qtyFrameWidth,
      y + imageSize - frameHeight - qtyFrameHeight,
      qtyFrameWidth,
      qtyFrameHeight,
    );

    // Adjust font size for the quantity and set its color to white
    ctx.font = '14px Tahoma';
    ctx.fillStyle = '#FFFFFF';

    // Calculate width and height of the text to center it within the rectangle
    const textMetrics = ctx.measureText(stack.quantity.toString());
    const textWidth = textMetrics.width;
    const textHeight = 14; // Approximate height for 14px font
    const qtyTextX = x + cellSize - qtyFrameWidth / 2 - textWidth / 2;
    const qtyTextY =
      y + imageSize - frameHeight - qtyFrameHeight / 2 + textHeight / 2;

    ctx.fillText(stack.quantity.toString(), qtyTextX, qtyTextY);
  };

  for (let index = 0; index < stacks.length; index++) {
    const stack = stacks[index];
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;

    const x = col * (cellSize + spacing) + margin;
    const y = row * (cellSize + textHeight + spacing) + margin;

    await drawItem(stack, x, y);
  }

  const buffer = canvas.toBuffer();

  // Save the buffer to the file system
  writeFileSync(imageFilePath, buffer);

  // Update the `lastImageGeneratedAt` field of the inventory here.
  // This would typically involve saving this updated date to your database.
  inventory.lastImageGeneratedAt = new Date();
  await inventoryService.save(inventory);
  return buffer;
}
