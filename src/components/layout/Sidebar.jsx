import React from "react";
import {
  Upload,
  FileText,
  Grid3x3,
  CircleDot,
  Scroll,
  Droplet,
  Pen,
  Sparkles,
  ScanLine,
} from "lucide-react";

const Sidebar = ({
  settings,
  updateSetting,
  onTextUpload,
  onDiagramUpload,
  text,
  onTextChange,
  diagramLabels = [],
  onDiagramLabelsChange,
}) => {
  const paperOptions = [
    { value: "ruled-blue", label: "Blue Lines", icon: FileText },
    { value: "ruled-black", label: "Black Lines", icon: Scroll },
    { value: "dotted", label: "Dotted", icon: CircleDot },
    { value: "plain", label: "Plain", icon: Grid3x3 },
  ];

  const inkColors = [
    { value: "#1E40AF", label: "Blue", color: "#1E40AF" },
    { value: "#1F2937", label: "Black", color: "#1F2937" },
    { value: "#DC2626", label: "Red", color: "#DC2626" },
    { value: "#059669", label: "Green", color: "#059669" },
  ];

  const penTypes = [
    { value: "ballpoint", label: "Ballpoint" },
    { value: "gel", label: "Gel" },
    { value: "fountain", label: "Fountain" },
    { value: "pencil", label: "Pencil" },
    { value: "marker", label: "Marker" },
  ];

  const fonts = [
    { value: "kalam", label: "Kalam (Natural)" },
    { value: "handlee", label: "Handlee (Casual)" },
    { value: "architects", label: "Architect's Hand" },
    { value: "covered", label: "Covered Grace" },
    { value: "shadows", label: "Shadows Light" },
    { value: "caveat", label: "Caveat (Flowing)" },
    { value: "indieflower", label: "Indie Flower" },
    { value: "gochi", label: "Gochi Hand" },
    { value: "nothing", label: "Nothing You Do" },
    { value: "schoolbell", label: "Schoolbell" },
    { value: "amatic", label: "Amatic SC" },
    { value: "waiting", label: "Waiting Sunrise" },
    { value: "justme", label: "Just Me" },
  ];

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === "text") {
        onTextUpload(event.target.result);
      } else if (type === "diagram") {
        onDiagramUpload(event.target.result);
      }
    };

    if (type === "text") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="w-80 h-screen overflow-y-auto p-6 glass-effect shadow-2xl scrollbar-thin"
      style={{ willChange: "scroll-position" }}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            HandwritingAI
          </h1>
          <p className="text-sm text-gray-300">
            Transform digital to handwritten
          </p>
        </div>

        {/* Editable Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wide">
              Your Text
            </h3>
            <button
              onClick={() => onTextChange("")}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Write your text here..."
            className="w-full h-32 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder-gray-500"
            spellCheck="false"
          />
          <p className="text-[10px] text-gray-500">{text.length} characters</p>
        </div>

        {/* Upload Zone */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
            <Upload className="w-3.5 h-3.5" />
            Upload Content
          </h3>

          <label className="block">
            <input
              type="file"
              accept=".txt"
              onChange={(e) => handleFileUpload(e, "text")}
              className="hidden"
            />
            <div className="cursor-pointer border-2 border-dashed border-blue-400/50 rounded-lg p-3 text-center hover:border-blue-400 transition-all bg-blue-500/5 hover:bg-blue-500/10 active:scale-98">
              <FileText className="w-6 h-6 mx-auto mb-1.5 text-blue-400" />
              <p className="text-xs text-gray-300 font-medium">Upload Text</p>
              <p className="text-[10px] text-gray-500 mt-0.5">.txt files</p>
            </div>
          </label>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "diagram")}
              className="hidden"
            />
            <div className="cursor-pointer border-2 border-dashed border-purple-400/50 rounded-lg p-3 text-center hover:border-purple-400 transition-all bg-purple-500/5 hover:bg-purple-500/10 active:scale-98">
              <Upload className="w-6 h-6 mx-auto mb-1.5 text-purple-400" />
              <p className="text-xs text-gray-300 font-medium">
                Upload Diagram
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Images</p>
            </div>
          </label>
        </div>

        {/* Diagram Labels */}
        {onDiagramLabelsChange && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wide">
                Diagram Labels
              </h3>
              <button
                onClick={() =>
                  onDiagramLabelsChange([
                    ...diagramLabels,
                    { text: "", x: 100, y: 100 },
                  ])
                }
                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                + Add Label
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
              {diagramLabels.map((label, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Label text"
                    value={label.text}
                    onChange={(e) => {
                      const newLabels = [...diagramLabels];
                      newLabels[index].text = e.target.value;
                      onDiagramLabelsChange(newLabels);
                    }}
                    className="flex-1 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="X"
                    value={label.x}
                    onChange={(e) => {
                      const newLabels = [...diagramLabels];
                      newLabels[index].x = parseInt(e.target.value) || 0;
                      onDiagramLabelsChange(newLabels);
                    }}
                    className="w-14 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    value={label.y}
                    onChange={(e) => {
                      const newLabels = [...diagramLabels];
                      newLabels[index].y = parseInt(e.target.value) || 0;
                      onDiagramLabelsChange(newLabels);
                    }}
                    className="w-14 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newLabels = diagramLabels.filter(
                        (_, i) => i !== index,
                      );
                      onDiagramLabelsChange(newLabels);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500">
              Add handwritten labels to your diagram. X/Y are pixel positions.
            </p>
          </div>
        )}

        {/* Paper Styles */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Paper Style</h3>
          <div className="grid grid-cols-2 gap-2">
            {paperOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => updateSetting("paperStyle", option.value)}
                  className={`p-3 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                    settings.paperStyle === option.value
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs">{option.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ink Color */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Droplet className="w-4 h-4" />
            Ink Color
          </h3>
          <div className="flex gap-3">
            {inkColors.map((ink) => (
              <button
                key={ink.value}
                onClick={() => updateSetting("inkColor", ink.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-90 ${
                  settings.inkColor === ink.value
                    ? "border-white shadow-lg scale-110"
                    : "border-gray-600"
                }`}
                style={{ backgroundColor: ink.color }}
                title={ink.label}
              />
            ))}
          </div>
        </div>

        {/* Pen Type */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Pen className="w-4 h-4" />
            Pen Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {penTypes.map((pen) => (
              <button
                key={pen.value}
                onClick={() => updateSetting("penType", pen.value)}
                className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all hover:scale-103 active:scale-97 ${
                  settings.penType === pen.value
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg ring-2 ring-purple-400/50"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {pen.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Style */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wide">
            Handwriting Style
          </h3>
          <select
            value={settings.font}
            onChange={(e) => updateSetting("font", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-white/10 cursor-pointer"
          >
            {fonts.map((font) => (
              <option
                key={font.value}
                value={font.value}
                className="bg-gray-800 text-gray-200"
              >
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Messiness Slider */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Human Error Level
          </h3>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.messiness}
              onChange={(e) =>
                updateSetting("messiness", parseInt(e.target.value))
              }
              className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${settings.messiness}%, rgba(255,255,255,0.1) ${settings.messiness}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Perfect</span>
              <span className="font-semibold text-blue-400">
                {settings.messiness}%
              </span>
              <span>Chaotic</span>
            </div>
          </div>
        </div>

        {/* Scanner Effect Toggle */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
            <ScanLine className="w-3.5 h-3.5" />
            Scanner Effect
          </h3>
          <button
            onClick={() =>
              updateSetting("scannerEffect", !settings.scannerEffect)
            }
            className={`w-full py-2.5 px-4 rounded-lg transition-all flex items-center justify-between hover:scale-102 active:scale-98 ${
              settings.scannerEffect
                ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg ring-2 ring-yellow-400/50"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <span className="text-xs font-medium">
              {settings.scannerEffect ? "Enabled" : "Disabled"}
            </span>
            <div
              className={`w-11 h-5 rounded-full transition-all relative ${
                settings.scannerEffect ? "bg-white/30" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-lg transition-transform ${
                  settings.scannerEffect ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Page Size Selector */}
        <div className="border-t border-white/10 pt-3 space-y-2.5">
          <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
            <FileText className="w-3.5 h-3.5" />
            Page Size
          </h3>
          <select
            value={settings.pageSize}
            onChange={(e) => updateSetting("pageSize", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-white/10 cursor-pointer"
          >
            <option value="A3" className="bg-gray-800">
              A3 (297×420mm)
            </option>
            <option value="A4" className="bg-gray-800">
              A4 (210×297mm)
            </option>
            <option value="A5" className="bg-gray-800">
              A5 (148×210mm)
            </option>
            <option value="Letter" className="bg-gray-800">
              Letter (8.5×11")
            </option>
            <option value="Legal" className="bg-gray-800">
              Legal (8.5×14")
            </option>
          </select>
        </div>

        {/* Line Opacity */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wide">
            Line Opacity
          </h3>
          <div className="space-y-2">
            <input
              type="range"
              min="10"
              max="100"
              value={settings.lineOpacity * 100}
              onChange={(e) =>
                updateSetting("lineOpacity", parseInt(e.target.value) / 100)
              }
              className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${settings.lineOpacity * 100}%, rgba(255,255,255,0.1) ${settings.lineOpacity * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Faint</span>
              <span className="font-semibold text-purple-400">
                {(settings.lineOpacity * 100).toFixed(0)}%
              </span>
              <span>Bold</span>
            </div>
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="border-t border-white/10 pt-3 space-y-3">
          <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Advanced Settings
          </h3>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-wide">
              Font Size
            </label>
            <input
              type="range"
              min="20"
              max="36"
              value={settings.fontSize}
              onChange={(e) =>
                updateSetting("fontSize", parseInt(e.target.value))
              }
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Small</span>
              <span className="text-blue-400 font-semibold">
                {settings.fontSize}px
              </span>
              <span>Large</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Line Spacing</label>
            <input
              type="range"
              min="32"
              max="52"
              value={settings.lineHeight}
              onChange={(e) =>
                updateSetting("lineHeight", parseInt(e.target.value))
              }
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tight</span>
              <span className="text-blue-400 font-semibold">
                {settings.lineHeight}px
              </span>
              <span>Loose</span>
            </div>
          </div>

          {/* Ink Intensity */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Ink Intensity</label>
            <input
              type="range"
              min="50"
              max="150"
              value={settings.inkIntensity * 100}
              onChange={(e) =>
                updateSetting("inkIntensity", parseInt(e.target.value) / 100)
              }
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Light</span>
              <span className="text-blue-400 font-semibold">
                {(settings.inkIntensity * 100).toFixed(0)}%
              </span>
              <span>Bold</span>
            </div>
          </div>

          {/* Character Spacing */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Letter Spacing</label>
            <input
              type="range"
              min="-2"
              max="3"
              step="0.5"
              value={settings.charSpacing}
              onChange={(e) =>
                updateSetting("charSpacing", parseFloat(e.target.value))
              }
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tight</span>
              <span className="text-blue-400 font-semibold">
                {settings.charSpacing}
              </span>
              <span>Wide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
