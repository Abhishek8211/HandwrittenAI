import React, { useRef, useEffect, useState } from "react";
import { Download, FileDown, Trash2, Move } from "lucide-react";
import {
  PAPER_CONFIG,
  PAGE_SIZES,
  setPaperSize,
  drawPaperBackground,
  renderHandwriting,
  exportToPDF,
  exportToPNG,
} from "../../utils/HandwritingEngine";

const InteractiveCanvas = ({
  paperStyle,
  font,
  inkColor,
  penType,
  messiness,
  uploadedDiagram,
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
  const inputRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [textBlocks, setTextBlocks] = useState([
    {
      id: 1,
      x: 100,
      y: 100,
      text: "Click anywhere to add text!\n\nDrag the image to reposition it.",
      width: 600,
    },
  ]);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(null);

  // Image state
  const [imageData, setImageData] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 400, y: 300 });
  const [imageSize, setImageSize] = useState({ width: 200, height: 200 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize
  useEffect(() => {
    setPaperSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (uploadedDiagram) {
      setImageData(uploadedDiagram);
    }
  }, [uploadedDiagram]);

  useEffect(() => {
    setCurrentFontSize(globalFontSize);
  }, [globalFontSize]);

  useEffect(() => {
    setCurrentInkColor(inkColor);
  }, [inkColor]);

  // Calculate scale
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 64;
      const containerHeight = window.innerHeight - 160;
      const scaleX = containerWidth / PAPER_CONFIG.WIDTH;
      const scaleY = containerHeight / PAPER_CONFIG.HEIGHT;
      setScale(Math.min(scaleX, scaleY, 1.2));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [pageSize]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = PAPER_CONFIG.WIDTH;
    canvas.height = PAPER_CONFIG.HEIGHT;

    // Clear and draw paper
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaperBackground(ctx, paperStyle, scannerEffect, lineOpacity);

    // Draw image if exists
    if (imageData) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(
          img,
          imagePosition.x,
          imagePosition.y,
          imageSize.width,
          imageSize.height,
        );
        ctx.restore();
      };
      img.src = imageData;
    }

    // Render all text blocks
    textBlocks.forEach((block) => {
      if (block.text.trim()) {
        ctx.save();
        ctx.translate(block.x, block.y);

        const originalMarginLeft = PAPER_CONFIG.MARGIN_LEFT;
        const originalMarginTop = PAPER_CONFIG.MARGIN_TOP;
        PAPER_CONFIG.MARGIN_LEFT = 0;
        PAPER_CONFIG.MARGIN_TOP = 0;

        renderHandwriting(ctx, block.text, {
          font: getFontName(font),
          fontSize,
          inkColor,
          penType,
          messiness,
          lineHeight,
          inkIntensity,
          charSpacing,
        });

        PAPER_CONFIG.MARGIN_LEFT = originalMarginLeft;
        PAPER_CONFIG.MARGIN_TOP = originalMarginTop;
        ctx.restore();
      }
    });

    // Draw cursor if active
    if (cursorPosition && activeBlockId) {
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cursorPosition.x, cursorPosition.y);
      ctx.lineTo(cursorPosition.x, cursorPosition.y + fontSize);
      ctx.stroke();
    }
  }, [
    textBlocks,
    imageData,
    imagePosition,
    imageSize,
    paperStyle,
    font,
    inkColor,
    penType,
    messiness,
    scannerEffect,
    inkIntensity,
    charSpacing,
    fontSize,
    lineHeight,
    pageSize,
    lineOpacity,
    cursorPosition,
    activeBlockId,
  ]);

  const getFontName = (fontId) => {
    const fontMap = {
      caveat: "Caveat",
      indieflower: "Indie Flower",
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

  // Handle canvas click to add/edit text
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check if clicking on image
    if (
      imageData &&
      x >= imagePosition.x &&
      x <= imagePosition.x + imageSize.width &&
      y >= imagePosition.y &&
      y <= imagePosition.y + imageSize.height
    ) {
      return; // Don't create text block on image
    }

    // Find if clicking near existing text block
    let clickedBlock = null;
    for (const block of textBlocks) {
      if (
        x >= block.x - 10 &&
        x <= block.x + block.width + 10 &&
        y >= block.y - 10 &&
        y <= block.y + 200
      ) {
        clickedBlock = block;
        break;
      }
    }

    if (clickedBlock) {
      setActiveBlockId(clickedBlock.id);
      setCursorPosition({ x: clickedBlock.x, y: clickedBlock.y });
      if (inputRef.current) {
        inputRef.current.value = clickedBlock.text;
        inputRef.current.focus();
      }
    } else {
      // Create new text block
      const newBlock = {
        id: Date.now(),
        x: x,
        y: y,
        text: "",
        width: 400,
      };
      setTextBlocks([...textBlocks, newBlock]);
      setActiveBlockId(newBlock.id);
      setCursorPosition({ x, y });
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }
  };

  // Handle image dragging
  const handleMouseDown = (e) => {
    if (!imageData) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (
      x >= imagePosition.x &&
      x <= imagePosition.x + imageSize.width &&
      y >= imagePosition.y &&
      y <= imagePosition.y + imageSize.height
    ) {
      setIsDraggingImage(true);
      setDragOffset({ x: x - imagePosition.x, y: y - imagePosition.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingImage) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setImagePosition({
      x: Math.max(
        0,
        Math.min(x - dragOffset.x, PAPER_CONFIG.WIDTH - imageSize.width),
      ),
      y: Math.max(
        0,
        Math.min(y - dragOffset.y, PAPER_CONFIG.HEIGHT - imageSize.height),
      ),
    });
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  // Handle text input
  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (activeBlockId) {
      setTextBlocks(
        textBlocks.map((block) =>
          block.id === activeBlockId ? { ...block, text: newText } : block,
        ),
      );

      const activeBlock = textBlocks.find((b) => b.id === activeBlockId);
      if (activeBlock) {
        setCursorPosition({ x: activeBlock.x, y: activeBlock.y });
      }
    }
  };

  const deleteActiveBlock = () => {
    if (activeBlockId) {
      setTextBlocks(textBlocks.filter((block) => block.id !== activeBlockId));
      setActiveBlockId(null);
      setCursorPosition(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleExportPDF = async () => {
    if (canvasRef.current) {
      await exportToPDF(canvasRef.current, "handwritten-note.pdf");
    }
  };

  const handleExportPNG = async () => {
    if (canvasRef.current) {
      await exportToPNG(canvasRef.current, "handwritten-note.png");
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center p-8 relative"
    >
      {/* Toolbar */}
      <div className="mb-4 flex gap-3 items-center">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
        <button
          onClick={handleExportPNG}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          Export PNG
        </button>
        {activeBlockId && (
          <button
            onClick={deleteActiveBlock}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Text
          </button>
        )}
        {imageData && (
          <div className="text-sm text-gray-300 flex items-center gap-2">
            <Move className="w-4 h-4" />
            Drag image to reposition
          </div>
        )}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          cursor: isDraggingImage ? "grabbing" : "pointer",
          marginBottom: "2rem",
        }}
      />

      {/* Hidden text input */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96 bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
        <label className="text-xs text-gray-400 mb-2 block">
          {activeBlockId
            ? "Edit text (click canvas to add new text)"
            : "Click canvas to add text"}
        </label>
        <textarea
          ref={inputRef}
          onChange={handleTextChange}
          placeholder="Type your text here..."
          className="w-full h-24 px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
};

export default InteractiveCanvas;
