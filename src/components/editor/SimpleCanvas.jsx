import React, { useRef, useEffect } from "react";

const SimpleCanvas = ({ text, font, inkColor, paperStyle }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 794;
    canvas.height = 1123;

    // Draw white background
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some ruled lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let y = 100; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
    }

    // Draw text
    ctx.fillStyle = inkColor || "#1E40AF";
    ctx.font = `28px ${font || "Kalam"}, cursive`;
    ctx.textBaseline = "top";

    const lines = (text || "Hello").split("\n");
    let y = 100;
    lines.forEach((line) => {
      ctx.fillText(line, 100, y);
      y += 40;
    });
  }, [text, font, inkColor, paperStyle]);

  return (
    <div className="flex items-center justify-center p-8">
      <canvas
        ref={canvasRef}
        style={{
          boxShadow: "0 10px 50px rgba(0,0,0,0.3)",
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );
};

export default SimpleCanvas;
