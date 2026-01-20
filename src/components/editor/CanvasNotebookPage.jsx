import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { Download, FileDown, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti";
import {
  PAPER_CONFIG,
  PAGE_SIZES,
  setPaperSize,
  drawPaperBackground,
  renderHandwriting,
  renderDiagram,
  renderTable,
  exportToPDF,
  exportToPNG,
  getBaselineJitter,
  getCharacterRotation,
  getOrganicKerning,
} from "../../utils/HandwritingEngine";

/**
 * Canvas-Based Notebook Page with Pixel-Perfect Rendering
 * Implements physics-based handwriting synthesis
 */
const CanvasNotebookPage = ({
  text,
  paperStyle,
  font,
  inkColor,
  penType,
  messiness,
  uploadedDiagram,
  diagramLabels = [],
  scannerEffect,
  inkIntensity = 1.0,
  charSpacing = 0,
  fontSize = 28,
  lineHeight = 40,
  pageSize = "A4",
  lineOpacity = 0.6,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const renderTimeoutRef = useRef(null);
  const lastRenderTime = useRef(0);
  const RENDER_THROTTLE = 16; // ~60fps

  /**
   * Update paper size when pageSize changes
   */
  useEffect(() => {
    setPaperSize(pageSize);
  }, [pageSize]);

  /**
   * Calculate responsive scale to maintain aspect ratio
   */
  useEffect(() => {
    let resizeTimeout;
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth - 64; // Account for padding
      const containerHeight = window.innerHeight - 160;

      const scaleX = containerWidth / PAPER_CONFIG.WIDTH;
      const scaleY = containerHeight / PAPER_CONFIG.HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1.2); // Max scale of 1.2

      setScale(newScale);
    };

    const debouncedUpdate = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateScale, 100);
    };

    updateScale();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(resizeTimeout);
    };
  }, [pageSize]); // Re-calculate scale when page size changes

  /**
   * Get actual font name from font ID
   */
  const getFontName = (fontId) => {
    const fontMap = {
      caveat: "Caveat",
      indieflower: "Indie Flower",
      dancingscript: "Dancing Script",
      permanentmarker: "Permanent Marker",
      shadows: "Shadows Into Light",
      kalam: "Kalam",
      architects: "Architects Daughter",
      nothing: "Nothing You Could Do",
      handlee: "Handlee",
      covered: "Covered By Your Grace",
      amatic: "Amatic SC",
      gochi: "Gochi Hand",
      schoolbell: "Schoolbell",
      waiting: "Waiting for the Sunrise",
      justme: "Just Me Again Down Here",
    };
    return fontMap[fontId] || "Kalam";
  };

  /**
   * Render handwritten text with physics engine (Memoized)
   */
  const renderTextContent = useCallback(
    (ctx, startY) => {
      // Override starting Y position for text area
      const originalMarginTop = PAPER_CONFIG.MARGIN_TOP;
      PAPER_CONFIG.MARGIN_TOP = startY;

      renderHandwriting(ctx, text, {
        font: getFontName(font),
        fontSize: fontSize,
        inkColor,
        penType,
        messiness,
        lineHeight: lineHeight,
        inkIntensity: inkIntensity,
        charSpacing: charSpacing,
      });

      // Restore original margin
      PAPER_CONFIG.MARGIN_TOP = originalMarginTop;
    },
    [
      text,
      font,
      fontSize,
      inkColor,
      penType,
      messiness,
      lineHeight,
      inkIntensity,
      charSpacing,
    ],
  );

  /**
   * Main rendering pipeline (OPTIMIZED with throttling)
   */
  useEffect(() => {
    // Clear any pending render
    if (renderTimeoutRef.current) {
      cancelAnimationFrame(renderTimeoutRef.current);
    }

    // Throttle rendering for better performance
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    const executeRender = () => {
      lastRenderTime.current = performance.now();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: false,
        desynchronized: true, // Extra performance boost
      });

      // Set canvas dimensions
      canvas.width = PAPER_CONFIG.WIDTH;
      canvas.height = PAPER_CONFIG.HEIGHT;

      // Clear and render
      ctx.clearRect(0, 0, PAPER_CONFIG.WIDTH, PAPER_CONFIG.HEIGHT);

      // 1. Draw paper background with texture
      drawPaperBackground(ctx, paperStyle, scannerEffect, lineOpacity);

      // 2. Render uploaded diagram (if any)
      if (uploadedDiagram) {
        const img = new Image();
        img.onload = () => {
          const maxWidth =
            PAPER_CONFIG.WIDTH -
            PAPER_CONFIG.MARGIN_LEFT -
            PAPER_CONFIG.MARGIN_RIGHT -
            40;
          const maxHeight = 400;
          const x = PAPER_CONFIG.MARGIN_LEFT + 20;
          const y = PAPER_CONFIG.MARGIN_TOP + 20;

          const diagramDims = renderDiagram(
            ctx,
            img,
            x,
            y,
            maxWidth,
            maxHeight,
          );

          // Render handwritten labels on diagram
          if (diagramLabels && diagramLabels.length > 0) {
            ctx.save();
            ctx.font = `${fontSize}px ${getFontName(font)}`;
            ctx.fillStyle = inkColor;
            ctx.textBaseline = "top";

            diagramLabels.forEach((label, index) => {
              if (label.text && label.text.trim()) {
                const labelX = x + label.x;
                const labelY = y + label.y;

                // Apply handwriting physics for labels
                const jitter = getBaselineJitter(index, messiness);
                const rotation = getCharacterRotation(index, messiness);

                ctx.save();
                ctx.translate(labelX, labelY + jitter);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.fillText(label.text, 0, 0);
                ctx.restore();
              }
            });

            ctx.restore();
          }

          // Render text below diagram
          const diagramHeight = Math.min(
            img.height * (maxWidth / img.width),
            maxHeight,
          );
          renderTextContent(ctx, y + diagramHeight + 40);
        };
        img.src = uploadedDiagram;
      } else {
        // Render text only
        renderTextContent(ctx, PAPER_CONFIG.MARGIN_TOP);
      }
    };

    // Throttle: only render if enough time has passed
    if (timeSinceLastRender >= RENDER_THROTTLE) {
      renderTimeoutRef.current = requestAnimationFrame(executeRender);
    } else {
      // Schedule render after remaining time
      const delay = RENDER_THROTTLE - timeSinceLastRender;
      setTimeout(() => {
        renderTimeoutRef.current = requestAnimationFrame(executeRender);
      }, delay);
    }

    return () => {
      if (renderTimeoutRef.current) {
        cancelAnimationFrame(renderTimeoutRef.current);
      }
    };
  }, [
    text,
    paperStyle,
    font,
    inkColor,
    penType,
    messiness,
    uploadedDiagram,
    scannerEffect,
    inkIntensity,
    charSpacing,
    fontSize,
    lineHeight,
    pageSize,
    lineOpacity,
    diagramLabels,
    renderTextContent, // Include callback to trigger re-render when it changes
  ]);

  /**
   * Handle PDF export with celebration
   */
  const handleDownloadPDF = async () => {
    if (!canvasRef.current || isExporting) return;

    setIsExporting(true);
    try {
      await exportToPDF(canvasRef.current, "handwritten-note.pdf");

      // Celebration effect
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#1E40AF", "#DC2626", "#059669", "#F59E0B"],
        scalar: 1.2,
        gravity: 1,
        drift: 0,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle PNG export
   */
  const handleDownloadPNG = () => {
    if (!canvasRef.current || isExporting) return;

    setIsExporting(true);
    try {
      exportToPNG(canvasRef.current, "handwritten-note.png");

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#EC4899", "#14B8A6"],
      });
    } catch (error) {
      console.error("Error generating PNG:", error);
      alert("Failed to generate PNG. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      {/* Export Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Download className="w-5 h-5" />
          {isExporting ? "Exporting..." : "Download PDF"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <ImageIcon className="w-5 h-5" />
          {isExporting ? "Exporting..." : "Download PNG"}
        </motion.button>
      </motion.div>

      {/* Canvas Container with Fixed Ratio Viewport */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          willChange: "transform",
          contain: "layout style paint",
        }}
        className="shadow-2xl rounded-sm overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="block bg-white"
          style={{
            width: `${PAPER_CONFIG.WIDTH}px`,
            height: `${PAPER_CONFIG.HEIGHT}px`,
            imageRendering: "crisp-edges",
          }}
        />
      </motion.div>

      {/* Paper Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-sm text-gray-500 font-medium"
      >
        A4 Paper • {PAPER_CONFIG.WIDTH}×{PAPER_CONFIG.HEIGHT}px • Scale:{" "}
        {(scale * 100).toFixed(0)}%
      </motion.div>
    </div>
  );
};

export default CanvasNotebookPage;
