import React, { useRef, useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  Download,
  FileDown,
  Trash2,
  Move,
  Undo2,
  Redo2,
  Type,
  Palette,
  Plus,
  Check,
  X,
} from "lucide-react";
import {
  PAPER_CONFIG,
  setPaperSize,
  drawPaperBackground,
  renderHandwriting,
  exportToPDF,
  exportToPNG,
} from "../../utils/HandwritingEngine";

/**
 * Enhanced Interactive Canvas - Click-to-Write Handwritten Notes
 * Features:
 * - Click anywhere to add text
 * - Floating input box at click position
 * - Undo/Redo support
 * - Draggable images
 * - Font size and color selection
 * - Cursor preview
 */
const EnhancedCanvas = ({
  text: initialText = "",
  paperStyle,
  font,
  inkColor,
  penType,
  messiness,
  uploadedDiagram,
  scannerEffect,
  inkIntensity = 1.0,
  charSpacing = 0,
  fontSize: globalFontSize = 28,
  lineHeight = 40,
  pageSize = "A4",
  lineOpacity = 0.6,
  showMarginLine = true,
  updateSetting,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const floatingInputRef = useRef(null);
  const initialTextRendered = useRef(false);
  const ctxRef = useRef(null);
  const fontLoadedRef = useRef({});

  const [scale, setScale] = useState(1);
  const [textBlocks, setTextBlocks] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active input state
  const [isInputActive, setIsInputActive] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const [inputText, setInputText] = useState("");
  const [currentBlockId, setCurrentBlockId] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [isDraggingInput, setIsDraggingInput] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // Cursor preview
  const [cursorPreview, setCursorPreview] = useState(null);

  // Current settings
  const [currentFontSize, setCurrentFontSize] = useState(globalFontSize);
  const [currentInkColor, setCurrentInkColor] = useState(inkColor);

  // Image state
  const [imageData, setImageData] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 400, y: 300 });
  const [imageSize, setImageSize] = useState({ width: 200, height: 200 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const mouseMoveTimeoutRef = useRef(null);
  const renderTimeoutRef = useRef(null);
  const canvasImageCache = useRef(null);

  // Debounce helper for expensive operations
  const debounce = useCallback((func, delay) => {
    return (...args) => {
      clearTimeout(mouseMoveTimeoutRef.current);
      mouseMoveTimeoutRef.current = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Throttle helper to reduce lag
  const throttle = useCallback((func, delay) => {
    return (...args) => {
      if (!renderTimeoutRef.current) {
        func(...args);
        renderTimeoutRef.current = setTimeout(() => {
          renderTimeoutRef.current = null;
        }, delay);
      }
    };
  }, []);

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
    
    // Update all existing text blocks to use the new ink color
    setTextBlocks(prevBlocks => 
      prevBlocks.map(block => ({
        ...block,
        color: inkColor
      }))
    );
  }, [inkColor]);

  // Initialize and update text block (optimized single effect)
  useEffect(() => {
    if (!initialText || !initialText.trim()) {
      if (initialTextRendered.current) {
        setTextBlocks([]);
      }
      return;
    }

    // Initial setup
    if (!initialTextRendered.current) {
      const initialBlock = {
        id: 1,
        x: PAPER_CONFIG.MARGIN_LEFT + 10,
        y: PAPER_CONFIG.MARGIN_TOP,
        text: initialText,
        fontSize: globalFontSize,
        color: inkColor,
      };
      setTextBlocks([initialBlock]);
      setHistory([[initialBlock]]);
      setHistoryIndex(0);
      initialTextRendered.current = true;
      return;
    }

    // Update existing block
    setTextBlocks(prevBlocks => {
      if (prevBlocks.length === 0) return prevBlocks;
      const updatedBlocks = [...prevBlocks];
      updatedBlocks[0] = {
        ...updatedBlocks[0],
        text: initialText,
      };
      return updatedBlocks;
    });
  }, [initialText, globalFontSize, inkColor]);

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

  // Font name mapper - memoized for performance
  const fontMap = useMemo(() => ({
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
  }), []);

  const getFontName = useCallback((fontId) => {
    return fontMap[fontId] || "Kalam";
  }, [fontMap]);

  // Initialize canvas context once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ctxRef.current) return;

    // Set canvas size once
    canvas.width = PAPER_CONFIG.WIDTH;
    canvas.height = PAPER_CONFIG.HEIGHT;

    // Get and cache context
    ctxRef.current = canvas.getContext("2d", { 
      alpha: false,
      willReadFrequently: false,
      desynchronized: true
    });
  }, []);

  // Preload fonts asynchronously without blocking
  useEffect(() => {
    const fontName = getFontName(font);
    if (!fontLoadedRef.current[fontName]) {
      document.fonts.load(`${currentFontSize}px ${fontName}`).then(() => {
        fontLoadedRef.current[fontName] = true;
      }).catch(() => {
        fontLoadedRef.current[fontName] = true; // Mark as loaded anyway
      });
    }
  }, [font, currentFontSize, getFontName]);

  // Render canvas - INSTANT synchronous rendering with smart debouncing
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Use requestAnimationFrame for optimal timing (batches rapid updates at 60fps)
    let rafId = requestAnimationFrame(() => {
      // SYNCHRONOUS render - no async, no delays
      const fontName = getFontName(font);

      // Clear and draw paper background
      ctx.clearRect(0, 0, PAPER_CONFIG.WIDTH, PAPER_CONFIG.HEIGHT);
      drawPaperBackground(ctx, paperStyle, scannerEffect, lineOpacity, showMarginLine);

      // Draw image if exists (synchronously if cached)
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

      // Render all text blocks IMMEDIATELY
      textBlocks.forEach((block) => {
        if (block.text && block.text.trim()) {
          ctx.save();
          ctx.translate(block.x, block.y);

          const originalMarginLeft = PAPER_CONFIG.MARGIN_LEFT;
          const originalMarginTop = PAPER_CONFIG.MARGIN_TOP;
          PAPER_CONFIG.MARGIN_LEFT = 0;
          PAPER_CONFIG.MARGIN_TOP = 0;
          
          // Aggressively reduce messiness for performance with longer text
          const textLength = block.text.length;
          let optimizedMessiness = messiness;
          if (textLength > 1000) {
            optimizedMessiness = Math.min(messiness, 10);
          } else if (textLength > 500) {
            optimizedMessiness = Math.min(messiness, 15);
          } else if (textLength > 200) {
            optimizedMessiness = Math.min(messiness, 25);
          }
          
          renderHandwriting(ctx, block.text, {
            font: fontName,
            fontSize: block.fontSize || currentFontSize,
            inkColor: block.color || currentInkColor,
            penType,
            messiness: optimizedMessiness,
            lineHeight,
            inkIntensity,
            charSpacing,
          });

          PAPER_CONFIG.MARGIN_LEFT = originalMarginLeft;
          PAPER_CONFIG.MARGIN_TOP = originalMarginTop;
          ctx.restore();
        }
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [
    textBlocks,
    imageData,
    imagePosition,
    imageSize,
    paperStyle,
    font,
    penType,
    messiness,
    scannerEffect,
    inkIntensity,
    charSpacing,
    currentFontSize,
    lineHeight,
    pageSize,
    lineOpacity,
    showMarginLine,
    currentInkColor,
    inkColor,
    getFontName,
  ]);

  // Separate effect for cursor preview to avoid full canvas re-render
  useEffect(() => {
    if (!canvasRef.current || !cursorPreview || isInputActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Store the current canvas state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Draw cursor
    ctx.save();
    ctx.strokeStyle = currentInkColor;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cursorPreview.x, cursorPreview.y);
    ctx.lineTo(cursorPreview.x, cursorPreview.y + currentFontSize);
    ctx.stroke();
    ctx.restore();

    // Cleanup: restore canvas when cursor moves
    return () => {
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    };
  }, [cursorPreview, isInputActive, currentInkColor, currentFontSize]);

  // Handle global mouse events for input dragging
  useEffect(() => {
    if (isDraggingInput) {
      window.addEventListener('mousemove', handleInputMouseMove);
      window.addEventListener('mouseup', handleInputMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleInputMouseMove);
        window.removeEventListener('mouseup', handleInputMouseUp);
      };
    }
  }, [isDraggingInput, dragStartPos]);

  // Handle canvas click to add/edit text - memoized
  const handleCanvasClick = useCallback((e) => {
    if (isDraggingImage) return;

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
      return;
    }

    // Find if clicking near existing text block
    let clickedBlock = null;
    for (const block of textBlocks) {
      const blockHeight = Math.max(
        100,
        block.text.split("\n").length * lineHeight,
      );
      if (
        x >= block.x - 10 &&
        x <= block.x + 400 &&
        y >= block.y - 10 &&
        y <= block.y + blockHeight + 10
      ) {
        clickedBlock = block;
        break;
      }
    }

    if (clickedBlock) {
      openFloatingInput(clickedBlock.x, clickedBlock.y, clickedBlock);
    } else {
      openFloatingInput(x, y, null);
    }
  }, [isDraggingImage, imageData, imagePosition, imageSize, textBlocks, lineHeight]);

  // Open floating input at position - memoized
  const openFloatingInput = useCallback((x, y, existingBlock = null) => {
    setClickedPosition({ x, y });
    setCurrentBlockId(existingBlock?.id || null);
    setInputText(existingBlock?.text || "");
    setCursorPreview(null); // Hide cursor preview

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Position the input near the click but offset so it doesn't cover the text
    const screenX = rect.left + x * scale;
    const screenY = rect.top + y * scale;
    
    // Offset to the right and slightly down
    const offsetX = 20;
    const offsetY = -60;
    
    setInputPosition({
      x: Math.min(screenX + offsetX, window.innerWidth - 420),
      y: Math.max(80, Math.min(screenY + offsetY, window.innerHeight - 300)),
    });

    setIsInputActive(true);
    setTimeout(() => floatingInputRef.current?.focus(), 50);
  }, [scale]);

  // Close floating input - memoized
  const closeFloatingInput = useCallback(() => {
    setIsInputActive(false);
    setInputText("");
    setCurrentBlockId(null);
    setClickedPosition(null);
  }, []);

  // Handle submit text - memoized
  const handleSubmitText = useCallback(() => {
    if (!inputText.trim()) {
      closeFloatingInput();
      return;
    }

    let newTextBlocks;

    if (currentBlockId) {
      newTextBlocks = textBlocks.map((block) =>
        block.id === currentBlockId
          ? {
              ...block,
              text: inputText,
              fontSize: currentFontSize,
              color: currentInkColor,
            }
          : block,
      );
    } else {
      const newBlock = {
        id: Date.now(),
        x: clickedPosition.x,
        y: clickedPosition.y,
        text: inputText,
        fontSize: currentFontSize,
        color: currentInkColor,
      };
      newTextBlocks = [...textBlocks, newBlock];
    }

    setTextBlocks(newTextBlocks);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTextBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    closeFloatingInput();
  }, [inputText, currentBlockId, clickedPosition, textBlocks, currentFontSize, currentInkColor, history, historyIndex, closeFloatingInput]);

  // Undo/Redo - memoized
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTextBlocks(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTextBlocks(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  // Delete block - memoized
  const deleteBlock = useCallback((blockId) => {
    const newTextBlocks = textBlocks.filter((block) => block.id !== blockId);
    setTextBlocks(newTextBlocks);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTextBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [textBlocks, history, historyIndex]);

  // Clear all - memoized
  const handleClearAll = useCallback(() => {
    if (window.confirm("Clear all text? This cannot be undone.")) {
      setTextBlocks([]);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);

  // Image dragging
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

  const updateCursorPreview = useMemo(() => throttle((x, y) => {
    setCursorPreview({ x, y });
  }, 32), [throttle]); // ~30fps is enough for cursor preview

  const handleMouseMove = useCallback((e) => {
    if (isDraggingImage) {
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
    } else if (!isInputActive) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      updateCursorPreview(x, y);
    }
  }, [isDraggingImage, isInputActive, scale, dragOffset, imageSize, updateCursorPreview]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingImage(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursorPreview(null);
  }, []);

  // Floating input drag handlers
  const handleInputMouseDown = (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
    setIsDraggingInput(true);
    setDragStartPos({
      x: e.clientX - inputPosition.x,
      y: e.clientY - inputPosition.y,
    });
    e.preventDefault();
  };

  const handleInputMouseMove = (e) => {
    if (!isDraggingInput) return;
    setInputPosition({
      x: e.clientX - dragStartPos.x,
      y: e.clientY - dragStartPos.y,
    });
  };

  const handleInputMouseUp = () => {
    setIsDraggingInput(false);
  };

  // Export functions - memoized
  const handleExportPDF = useCallback(async () => {
    if (canvasRef.current) {
      await exportToPDF(canvasRef.current, "handwritten-note.pdf");
    }
  }, []);

  const handleExportPNG = useCallback(async () => {
    if (canvasRef.current) {
      await exportToPNG(canvasRef.current, "handwritten-note.png");
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center p-8 relative overflow-auto"
    >
      {/* Enhanced Toolbar */}
      <div className="mb-4 flex gap-3 items-center flex-wrap justify-center bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700">
        {/* Font Size */}
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-400" />
          <select
            value={currentFontSize}
            onChange={(e) => setCurrentFontSize(Number(e.target.value))}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={20}>Small</option>
            <option value={28}>Medium</option>
            <option value={36}>Large</option>
            <option value={44}>X-Large</option>
          </select>
        </div>

        {/* Ink Color */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-400" />
          <div className="flex gap-2">
            {[
              { color: "#1E40AF", label: "Blue" },
              { color: "#1F2937", label: "Black" },
              { color: "#DC2626", label: "Red" },
              { color: "#059669", label: "Green" },
            ].map((ink) => (
              <button
                key={ink.color}
                onClick={() => {
                  setCurrentInkColor(ink.color);
                  // Update all existing text blocks to use the new color
                  setTextBlocks(prevBlocks => 
                    prevBlocks.map(block => ({
                      ...block,
                      color: ink.color
                    }))
                  );
                  // Update the sidebar setting to keep them in sync
                  if (updateSetting) {
                    updateSetting("inkColor", ink.color);
                  }
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  currentInkColor === ink.color
                    ? "border-white scale-110 shadow-lg"
                    : "border-gray-600 hover:scale-105"
                }`}
                style={{ backgroundColor: ink.color }}
                title={ink.label}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-8 bg-gray-600" />

        {/* Undo/Redo */}
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-all"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-all"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-600" />

        {/* Export */}
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button>
        <button
          onClick={handleExportPNG}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          PNG
        </button>

        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Help Text */}
      <div className="mb-3 text-sm text-gray-300 flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30">
        <Plus className="w-4 h-4 text-blue-400" />
        <span className="font-medium">
          Click anywhere on the page to add handwritten text
        </span>
        {imageData && (
          <>
            <span className="mx-2 text-gray-500">•</span>
            <Move className="w-4 h-4 text-purple-400" />
            <span>Drag image to reposition</span>
          </>
        )}
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            handleMouseLeave();
          }}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            cursor: isDraggingImage ? "grabbing" : "crosshair",
            marginBottom: "2rem",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Floating Input Box */}
        {isInputActive && (          <div
            onMouseDown={handleInputMouseDown}
            className="fixed bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-4 z-50 animate-in fade-in zoom-in duration-200"
            style={{
              left: `${inputPosition.x}px`,
              top: `${inputPosition.y}px`,
              minWidth: "360px",
              maxWidth: "400px",
              cursor: isDraggingInput ? 'grabbing' : 'grab',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Move className="w-4 h-4 text-gray-500" />
                {currentBlockId ? "Edit Text Block" : "Add New Text"}
              </label>
              <div className="flex gap-1">
                <button
                  onClick={handleSubmitText}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                  title="Done (Ctrl+Enter)"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={closeFloatingInput}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                  title="Cancel (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              ref={floatingInputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSubmitText();
                } else if (e.key === "Escape") {
                  closeFloatingInput();
                }
              }}
              placeholder="Type your handwritten text here..."
              className="w-full h-32 px-3 py-2 rounded-lg bg-gray-50 border-2 border-gray-300 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-handlee"
              style={{ fontFamily: getFontName(font) }}
            />
            <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-200 rounded font-mono text-[10px]">
                  Ctrl
                </kbd>
                +
                <kbd className="px-2 py-1 bg-gray-200 rounded font-mono text-[10px]">
                  Enter
                </kbd>
                to submit
              </span>
              <span className="text-gray-400">
                {inputText.length} characters
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Text Blocks Manager */}
      {textBlocks.length > 0 && (
        <div className="mt-4 w-full max-w-4xl bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">
              Text Blocks ({textBlocks.length})
            </h3>
            <span className="text-xs text-gray-500">
              Click to edit or delete
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
            {textBlocks.map((block, index) => (
              <div
                key={block.id}
                className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-all group cursor-pointer"
                onClick={() => openFloatingInput(block.x, block.y, block)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      Size: {block.fontSize || currentFontSize}px
                    </span>
                    <div
                      className="w-3 h-3 rounded-full border border-gray-500"
                      style={{
                        backgroundColor: block.color || currentInkColor,
                      }}
                    />
                  </div>
                  <p className="text-sm text-white truncate">
                    {block.text.substring(0, 60)}
                    {block.text.length > 60 ? "..." : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBlock(block.id);
                  }}
                  className="ml-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EnhancedCanvas);
