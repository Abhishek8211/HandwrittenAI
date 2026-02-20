/**
 * Professional Canvas-Based Handwriting Synthesis Engine
 * Implements pixel-perfect layout with physics-based text rendering
 */

// Lazy load rough.js only when needed for diagrams
let rough = null;
const loadRough = async () => {
  if (!rough) {
    try {
      const roughModule = await import("roughjs/bundled/rough.esm");
      rough = roughModule.default;
    } catch (error) {
      console.warn("roughjs not available, diagram features disabled");
    }
  }
  return rough;
};

// ============================================
// 1. PAPER-TO-PIXEL MAPPING (The Box Model)
// ============================================

// Page size presets (at 96 DPI)
export const PAGE_SIZES = {
  A3: { width: 1123, height: 1587, name: "A3 (297×420mm)" },
  A4: { width: 794, height: 1123, name: "A4 (210×297mm)" },
  A5: { width: 559, height: 794, name: "A5 (148×210mm)" },
  Letter: { width: 816, height: 1056, name: 'Letter (8.5×11")' },
  Legal: { width: 816, height: 1344, name: 'Legal (8.5×14")' },
};

export const PAPER_CONFIG = {
  // Default A4 dimensions at 96 DPI
  WIDTH: 794, // 210mm at 96 DPI
  HEIGHT: 1123, // 297mm at 96 DPI

  // Smart Padding
  MARGIN_LEFT: 80, // Red margin line
  MARGIN_TOP: 60,
  MARGIN_RIGHT: 40,
  MARGIN_BOTTOM: 60,

  // Line spacing for ruled paper
  LINE_HEIGHT: 32,

  // Red margin line position
  RED_LINE_X: 80,
};

/**
 * Update paper dimensions
 */
export const setPaperSize = (size) => {
  const dimensions = PAGE_SIZES[size] || PAGE_SIZES.A4;
  PAPER_CONFIG.WIDTH = dimensions.width;
  PAPER_CONFIG.HEIGHT = dimensions.height;
  // Adjust margins proportionally for smaller sizes
  if (size === "A5") {
    PAPER_CONFIG.MARGIN_LEFT = 60;
    PAPER_CONFIG.MARGIN_TOP = 45;
    PAPER_CONFIG.MARGIN_RIGHT = 30;
    PAPER_CONFIG.MARGIN_BOTTOM = 45;
    PAPER_CONFIG.RED_LINE_X = 60;
  } else {
    PAPER_CONFIG.MARGIN_LEFT = 80;
    PAPER_CONFIG.MARGIN_TOP = 60;
    PAPER_CONFIG.MARGIN_RIGHT = 40;
    PAPER_CONFIG.MARGIN_BOTTOM = 60;
    PAPER_CONFIG.RED_LINE_X = 80;
  }
};

/**
 * Calculate usable text area
 */
export const getTextArea = () => ({
  x: PAPER_CONFIG.MARGIN_LEFT + 10, // Start after red line
  y: PAPER_CONFIG.MARGIN_TOP,
  width:
    PAPER_CONFIG.WIDTH - PAPER_CONFIG.MARGIN_LEFT - PAPER_CONFIG.MARGIN_RIGHT,
  height:
    PAPER_CONFIG.HEIGHT - PAPER_CONFIG.MARGIN_TOP - PAPER_CONFIG.MARGIN_BOTTOM,
});

// ============================================
// 2. THE "PHYSICS OF WRITING" ENGINE
// ============================================

/**
 * Seeded pseudo-random number generator for consistent randomness
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }
}

// Cache for random number generators to avoid recreating them
const rngCache = new Map();
const getRNG = (seed) => {
  if (!rngCache.has(seed)) {
    rngCache.set(seed, new SeededRandom(seed));
    // Limit cache size to prevent memory bloat
    if (rngCache.size > 10000) {
      const firstKey = rngCache.keys().next().value;
      rngCache.delete(firstKey);
    }
  }
  return rngCache.get(seed);
};

/**
 * Generate baseline jitter for natural character placement (OPTIMIZED)
 */
export const getBaselineJitter = (charIndex, messiness) => {
  if (messiness === 0) return 0; // Skip calculation if no messiness
  const rng = getRNG(charIndex);
  const scale = messiness * 0.01; // Multiply by 0.01 instead of dividing by 100
  return rng.range(-1.5, 1.5) * scale;
};

/**
 * Calculate organic kerning (natural letter spacing) (OPTIMIZED)
 */
export const getOrganicKerning = (charIndex, baseKerning, messiness) => {
  if (messiness === 0) return baseKerning; // Skip if no messiness
  const rng = getRNG(charIndex + 1000);
  const scale = messiness * 0.01;
  const variation = rng.range(-1.5, 1.5) * scale;
  return baseKerning + variation;
};

/**
 * Get character rotation for natural handwriting (OPTIMIZED)
 */
export const getCharacterRotation = (charIndex, messiness) => {
  if (messiness === 0) return 0;
  const rng = getRNG(charIndex + 3000);
  const scale = messiness * 0.01;
  return rng.range(-3, 3) * scale; // degrees
};

/**
 * Get stroke width variation (OPTIMIZED)
 */
export const getStrokeVariation = (charIndex, messiness) => {
  if (messiness === 0) return 1;
  const rng = getRNG(charIndex + 4000);
  const scale = messiness * 0.01;
  return 1 + rng.range(-0.15, 0.15) * scale;
};

/**
 * Calculate line drift (gradual tilt across page width) (OPTIMIZED)
 */
export const getLineDrift = (x, lineIndex, messiness) => {
  if (messiness === 0) return 0;
  const textArea = getTextArea();
  const progress = x / textArea.width; // 0 to 1 across the line
  const scale = messiness * 0.01;
  const maxDrift = 0.5 * scale; // degrees

  // Alternate drift direction per line for realism
  const direction = lineIndex % 2 === 0 ? 1 : -1;

  return progress * maxDrift * direction;
};

/**
 * Get pressure variation (simulates pen pressure) (OPTIMIZED)
 */
export const getPressureVariation = (wordIndex) => {
  const rng = getRNG(wordIndex + 2000);
  return rng.range(0.88, 1.0);
};

// ============================================
// 3. ADVANCED INK RENDERING
// ============================================

/**
 * Apply natural ink effect to canvas context with pen-specific characteristics
 */
export const applyInkEffect = (ctx, penType, inkIntensity = 1.0) => {
  const effects = {
    // Ballpoint: Sharp, consistent, slightly faded
    ballpoint: `blur(${0.3 * inkIntensity}px) contrast(${1.15 + (inkIntensity - 1) * 0.1}) opacity(0.85)`,
    
    // Gel: Smooth, bold, high contrast with vibrant color
    gel: `blur(${0.1 * inkIntensity}px) contrast(${1.35 + (inkIntensity - 1) * 0.15}) saturate(${1.5 + (inkIntensity - 1) * 0.3}) brightness(1.05)`,
    
    // Fountain: Variable thickness, slight blur, elegant
    fountain: `blur(${0.8 * inkIntensity}px) contrast(${1.05 + (inkIntensity - 1) * 0.05}) opacity(${0.9 - (inkIntensity - 1) * 0.05})`,
    
    // Pencil: Grainy, lighter, with texture
    pencil: `blur(${0.2 * inkIntensity}px) contrast(${1.4 + (inkIntensity - 1) * 0.2}) brightness(0.7) opacity(0.75)`,
    
    // Marker: Bold, saturated, slight bleed
    marker: `blur(${0.6 * inkIntensity}px) contrast(${1.3 + (inkIntensity - 1) * 0.25}) saturate(${1.8 + (inkIntensity - 1) * 0.4}) brightness(1.1)`,
  };

  ctx.filter = effects[penType] || effects.ballpoint;
};

/**
 * Get pen-specific rendering properties
 */
export const getPenProperties = (penType) => {
  const properties = {
    ballpoint: {
      lineWidthMultiplier: 1.0,
      alphaVariation: 0.05,
      strokeVariation: 0.08,
    },
    gel: {
      lineWidthMultiplier: 1.15,
      alphaVariation: 0.02,
      strokeVariation: 0.05,
    },
    fountain: {
      lineWidthMultiplier: 1.25,
      alphaVariation: 0.12,
      strokeVariation: 0.15,
    },
    pencil: {
      lineWidthMultiplier: 0.9,
      alphaVariation: 0.15,
      strokeVariation: 0.12,
    },
    marker: {
      lineWidthMultiplier: 1.4,
      alphaVariation: 0.08,
      strokeVariation: 0.06,
    },
  };
  
  return properties[penType] || properties.ballpoint;
};

/**
 * Reset canvas filters
 */
export const resetInkEffect = (ctx) => {
  ctx.filter = "none";
};

// ============================================
// 4. CORE HANDWRITING RENDERER
// ============================================

/**
 * Main handwriting rendering function (HIGHLY OPTIMIZED)
 * Renders text with physics-based imperfections
 */
export const renderHandwriting = (ctx, text, options) => {
  const {
    font = "Caveat",
    fontSize = 28,
    inkColor = "#1E40AF",
    penType = "ballpoint",
    messiness = 30,
    lineHeight = 40,
    inkIntensity = 1.0,
    charSpacing = 0,
  } = options;

  const textArea = getTextArea();
  let currentY = textArea.y;
  const lines = text.split("\n");
  const maxLineWidth = textArea.width - 20; // Leave some padding
  const bottomLimit = PAPER_CONFIG.HEIGHT - PAPER_CONFIG.MARGIN_BOTTOM;

  // Performance: Set font once and cache measurements
  ctx.save();
  ctx.font = `${fontSize}px ${font}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = inkColor;

  // Pre-calculate commonly used values
  const spaceWidth = ctx.measureText(" ").width;
  const messinessScale = messiness * 0.01;
  const PI_OVER_180 = Math.PI / 180;
  
  // Get pen-specific properties
  const penProps = getPenProperties(penType);

  let lineIndex = 0;

  // Batch rendering by line for better performance
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    
    if (currentY > bottomLimit) break; // Early exit if out of bounds

    let currentX = textArea.x;
    const words = line.split(" ");

    for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
      const word = words[wordIdx];
      
      // Quick word width calculation
      const wordWidth = ctx.measureText(word).width + spaceWidth;

      if (currentX + wordWidth > textArea.x + maxLineWidth && currentX > textArea.x) {
        // Word doesn't fit, move to next line
        currentY += lineHeight;
        currentX = textArea.x;
        lineIndex++;

        if (currentY > bottomLimit) break; // Check bounds
      }

      // Apply pressure variation per word with pen-specific alpha variation
      const baseAlpha = getPressureVariation(lineIndex * 100 + wordIdx);
      const penAlpha = 1 - penProps.alphaVariation + (baseAlpha * penProps.alphaVariation);
      ctx.globalAlpha = penAlpha;

      // Apply ink effect once per word (not per character)
      applyInkEffect(ctx, penType, inkIntensity);

      // Render each character with physics
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const charIndex = lineIndex * 1000 + wordIdx * 100 + i;

        // Calculate physics-based positioning (optimized)
        const jitter = getBaselineJitter(charIndex, messiness);
        const drift = messinessScale > 0 ? getLineDrift(currentX, lineIndex, messiness) : 0;
        const rotation = getCharacterRotation(charIndex, messiness);
        
        // Apply pen-specific stroke variation
        const baseStrokeScale = getStrokeVariation(charIndex, messiness);
        const strokeScale = 1 + (baseStrokeScale - 1) * penProps.strokeVariation;

        // Only apply transformations if needed
        if (jitter !== 0 || drift !== 0 || rotation !== 0 || strokeScale !== 1) {
          ctx.save();
          ctx.translate(currentX, currentY + jitter);

          // Apply rotation for natural look (optimized)
          const totalRotation = (drift + rotation) * PI_OVER_180;
          if (totalRotation !== 0) ctx.rotate(totalRotation);

          // Scale for stroke variation
          if (strokeScale !== 1) ctx.scale(strokeScale, 1);

          ctx.fillText(char, 0, 0);
          ctx.restore();
        } else {
          // Fast path when no transformations needed
          ctx.fillText(char, currentX, currentY);
        }

        // Move to next character position with organic kerning
        const charWidth = ctx.measureText(char).width;
        const kerning = getOrganicKerning(charIndex, charSpacing, messiness);
        currentX += charWidth + kerning;
      }

      // Add space after word
      currentX += spaceWidth;
    }

    // Move to next line after processing the line
    currentY += lineHeight;
    lineIndex++;
  }

  ctx.restore();
  resetInkEffect(ctx);
};

// ============================================
// 5. PAPER TEXTURE RENDERING
// ============================================

// Cache for paper background to avoid redrawing
let paperBackgroundCache = null;
let lastPaperConfig = null;

/**
 * Draw paper background with texture (OPTIMIZED WITH CACHING)
 */
export const drawPaperBackground = (
  ctx,
  paperStyle,
  scannerEffect = false,
  lineOpacity = 0.6,
  showMarginLine = true,
) => {
  const { WIDTH, HEIGHT } = PAPER_CONFIG;
  
  // Create cache key
  const cacheKey = `${paperStyle}_${scannerEffect}_${lineOpacity}_${showMarginLine}_${WIDTH}_${HEIGHT}`;
  
  // Check if we can use cached background
  if (lastPaperConfig === cacheKey && paperBackgroundCache) {
    // Clear canvas first to ensure clean render
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.putImageData(paperBackgroundCache, 0, 0);
    return;
  }

  // Base paper color
  let baseColor = "#FFFFFF";

  if (scannerEffect) {
    // Add yellowed scanner tint
    baseColor = "#FFFEF5";
  }

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw ruled lines or dots
  if (paperStyle === "ruled-blue" || paperStyle === "ruled-black") {
    const lineColor = paperStyle === "ruled-blue" ? "#A5D8FF" : "#E9ECEF";
    drawRuledLines(ctx, lineColor, lineOpacity);
  } else if (paperStyle === "dotted") {
    drawDottedGrid(ctx, lineOpacity);
  }

  // Draw red margin line (if enabled)
  if (showMarginLine) {
    drawMarginLine(ctx);
  }

  // Apply scanner effect
  if (scannerEffect) {
    applyScannerEffect(ctx);
  }
  
  // Cache the background
  paperBackgroundCache = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  lastPaperConfig = cacheKey;
};

/**
 * Draw horizontal ruled lines
 */
const drawRuledLines = (ctx, color, opacity = 0.6) => {
  const { WIDTH, MARGIN_TOP, MARGIN_BOTTOM, LINE_HEIGHT } = PAPER_CONFIG;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = opacity;

  let y = MARGIN_TOP;
  while (y < PAPER_CONFIG.HEIGHT - MARGIN_BOTTOM) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
    y += LINE_HEIGHT;
  }

  ctx.globalAlpha = 1;
};

/**
 * Draw dotted grid pattern (OPTIMIZED)
 */
const drawDottedGrid = (ctx, opacity = 0.4) => {
  const spacing = 20;
  const { WIDTH, HEIGHT } = PAPER_CONFIG;

  ctx.fillStyle = "#CED4DA";
  ctx.globalAlpha = opacity;

  // Use path batching for better performance
  ctx.beginPath();
  for (let x = spacing; x < WIDTH; x += spacing) {
    for (let y = spacing; y < HEIGHT; y += spacing) {
      ctx.moveTo(x + 1, y);
      ctx.arc(x, y, 1, 0, Math.PI * 2);
    }
  }
  ctx.fill();

  ctx.globalAlpha = 1;
};

/**
 * Draw vertical red margin line
 */
const drawMarginLine = (ctx) => {
  const { RED_LINE_X, MARGIN_TOP, HEIGHT, MARGIN_BOTTOM } = PAPER_CONFIG;

  ctx.strokeStyle = "#FF6B6B";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;

  ctx.beginPath();
  ctx.moveTo(RED_LINE_X, MARGIN_TOP);
  ctx.lineTo(RED_LINE_X, HEIGHT - MARGIN_BOTTOM);
  ctx.stroke();

  ctx.globalAlpha = 1;
};

/**
 * Apply scanner effect (noise + subtle artifacts)
 */
const applyScannerEffect = (ctx) => {
  const { WIDTH, HEIGHT } = PAPER_CONFIG;
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imageData.data;

  // Add subtle noise
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] += noise; // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }

  ctx.putImageData(imageData, 0, 0);
};

// ============================================
// 6. DIAGRAM & TABLE RENDERING (Rough.js)
// ============================================

/**
 * Render diagram with pencil texture overlay
 */
export const renderDiagram = (ctx, image, x, y, maxWidth, maxHeight) => {
  // Calculate scaled dimensions
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = image.width * scale;
  const height = image.height * scale;

  ctx.save();

  // Draw image
  ctx.drawImage(image, x, y, width, height);

  // Apply pencil texture overlay
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#000000";
  ctx.fillRect(x, y, width, height);

  ctx.restore();

  return { width, height };
};

/**
 * Render hand-drawn table using Rough.js
 */
export const renderTable = async (ctx, tableData, x, y) => {
  const roughLib = await loadRough();
  if (!roughLib) {
    // Fallback to regular lines if rough.js isn't available
    const { rows, cols, cellWidth = 120, cellHeight = 40 } = tableData;
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;

    for (let row = 0; row <= rows; row++) {
      const y1 = y + row * cellHeight;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x + cols * cellWidth, y1);
      ctx.stroke();
    }

    for (let col = 0; col <= cols; col++) {
      const x1 = x + col * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x1, y + rows * cellHeight);
      ctx.stroke();
    }
    return;
  }

  const rc = roughLib.canvas(ctx.canvas);

  const { rows, cols, cellWidth = 120, cellHeight = 40 } = tableData;

  // Draw table grid with rough style
  for (let row = 0; row <= rows; row++) {
    const y1 = y + row * cellHeight;
    const y2 = y1;
    const x1 = x;
    const x2 = x + cols * cellWidth;

    // Horizontal lines
    rc.line(x1, y1, x2, y2, {
      roughness: 1.5,
      bowing: 2.0,
      stroke: "#374151",
      strokeWidth: 1,
    });
  }

  for (let col = 0; col <= cols; col++) {
    const x1 = x + col * cellWidth;
    const x2 = x1;
    const y1 = y;
    const y2 = y + rows * cellHeight;

    // Vertical lines
    rc.line(x1, y1, x2, y2, {
      roughness: 1.5,
      bowing: 2.0,
      stroke: "#374151",
      strokeWidth: 1,
    });
  }
};

// ============================================
// 7. EXPORT UTILITIES
// ============================================

/**
 * Convert canvas to downloadable PDF
 */
export const exportToPDF = async (
  canvas,
  filename = "handwritten-note.pdf",
) => {
  const jsPDF = (await import("jspdf")).default;

  const imgData = canvas.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [PAPER_CONFIG.WIDTH, PAPER_CONFIG.HEIGHT],
    compress: true,
  });

  pdf.addImage(imgData, "PNG", 0, 0, PAPER_CONFIG.WIDTH, PAPER_CONFIG.HEIGHT);
  pdf.save(filename);
};

/**
 * Convert canvas to PNG
 */
export const exportToPNG = (canvas, filename = "handwritten-note.png") => {
  canvas.toBlob(
    (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    "image/png",
    1.0,
  );
};
