export const paperStyles = {
  ruled: "paper-ruled",
  graph: "paper-graph",
  dots: "paper-dots",
  vintage: "paper-vintage",
};

export const getPaperClass = (style) => {
  return paperStyles[style] || paperStyles.ruled;
};
