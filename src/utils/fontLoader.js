export const fontMap = {
  caveat: "Caveat",
  indie: "Indie Flower",
  patrick: "Patrick Hand",
  reenie: "Reenie Beanie",
  shadows: "Shadows Into Light",
};

export const getFontFamily = (fontKey) => {
  return fontMap[fontKey] || fontMap.caveat;
};
