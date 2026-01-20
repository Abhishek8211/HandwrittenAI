import React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Grid3x3,
  CircleDot,
  Scroll,
  Droplet,
  Pen,
  Sparkles,
} from "lucide-react";

const Sidebar = ({
  settings,
  updateSetting,
  onTextUpload,
  onDiagramUpload,
}) => {
  const paperOptions = [
    { value: "ruled", label: "Ruled", icon: FileText },
    { value: "graph", label: "Graph", icon: Grid3x3 },
    { value: "dots", label: "Dots", icon: CircleDot },
    { value: "vintage", label: "Vintage", icon: Scroll },
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
  ];

  const fonts = [
    { value: "caveat", label: "Caveat" },
    { value: "indie", label: "Indie Flower" },
    { value: "patrick", label: "Patrick Hand" },
    { value: "reenie", label: "Reenie Beanie" },
    { value: "shadows", label: "Shadows Into Light" },
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
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-80 h-screen overflow-y-auto p-6 glass-effect shadow-2xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
          >
            HandwritingAI
          </motion.h1>
          <p className="text-sm text-gray-300">
            Transform digital to handwritten
          </p>
        </div>

        {/* Upload Zone */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Content
          </h3>

          <label className="block">
            <input
              type="file"
              accept=".txt"
              onChange={(e) => handleFileUpload(e, "text")}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer border-2 border-dashed border-blue-400/50 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-blue-500/5"
            >
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-gray-300">Upload Text File</p>
              <p className="text-xs text-gray-500 mt-1">.txt files</p>
            </motion.div>
          </label>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "diagram")}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer border-2 border-dashed border-purple-400/50 rounded-xl p-4 text-center hover:border-purple-400 transition-colors bg-purple-500/5"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-sm text-gray-300">Upload Diagram</p>
              <p className="text-xs text-gray-500 mt-1">Images</p>
            </motion.div>
          </label>
        </div>

        {/* Paper Styles */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Paper Style</h3>
          <div className="grid grid-cols-2 gap-2">
            {paperOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateSetting("paperStyle", option.value)}
                  className={`p-3 rounded-lg transition-all ${
                    settings.paperStyle === option.value
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs">{option.label}</p>
                </motion.button>
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
              <motion.button
                key={ink.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => updateSetting("inkColor", ink.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
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
          <div className="flex gap-2">
            {penTypes.map((pen) => (
              <motion.button
                key={pen.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSetting("penType", pen.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                  settings.penType === pen.value
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                {pen.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Font Style */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">
            Handwriting Style
          </h3>
          <select
            value={settings.font}
            onChange={(e) => updateSetting("font", e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {fonts.map((font) => (
              <option
                key={font.value}
                value={font.value}
                className="bg-gray-800"
              >
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Messiness Slider */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
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
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
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
      </div>
    </motion.div>
  );
};

export default Sidebar;
