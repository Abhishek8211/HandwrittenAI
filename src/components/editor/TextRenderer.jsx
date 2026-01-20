import React from "react";
import { getFontFamily } from "../../utils/fontLoader";

const TextRenderer = ({ text, font, inkColor, penType, messiness }) => {
  // Generate random variations for each character based on messiness level
  const generateCharacterStyle = (index) => {
    const messinessScale = messiness / 100;

    // Random rotation (more messiness = more rotation)
    const rotation = (Math.random() - 0.5) * 5 * messinessScale;

    // Random vertical offset (baseline jitter)
    const yOffset = (Math.random() - 0.5) * 3 * messinessScale;

    // Random horizontal offset (kerning variation)
    const xOffset = (Math.random() - 0.5) * 2 * messinessScale;

    // Slight size variation
    const scaleVariation = 1 + (Math.random() - 0.5) * 0.1 * messinessScale;

    return {
      transform: `rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px) scale(${scaleVariation})`,
      display: "inline-block",
      transformOrigin: "center",
    };
  };

  // Pen type effects
  const getPenStyle = () => {
    const baseStyle = {
      color: inkColor,
      fontFamily: getFontFamily(font),
    };

    switch (penType) {
      case "ballpoint":
        return {
          ...baseStyle,
          textShadow: `0 0 0.5px ${inkColor}`,
        };
      case "gel":
        return {
          ...baseStyle,
          textShadow: `0 0 1px ${inkColor}, 0 0 2px ${inkColor}40`,
          fontWeight: "600",
        };
      case "fountain":
        return {
          ...baseStyle,
          textShadow: `0.5px 0.5px 0px ${inkColor}80`,
          letterSpacing: "0.5px",
        };
      default:
        return baseStyle;
    }
  };

  const penStyle = getPenStyle();

  // Split text into lines
  const lines = text.split("\n");

  return (
    <div className="whitespace-pre-wrap leading-loose text-2xl">
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} style={{ marginBottom: "12px" }}>
          {line.split("").map((char, charIndex) => (
            <span
              key={`${lineIndex}-${charIndex}`}
              style={{
                ...penStyle,
                ...generateCharacterStyle(lineIndex * 100 + charIndex),
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TextRenderer;
