import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import EnhancedCanvas from "./components/editor/EnhancedCanvas";
import { useHandwritingSettings } from "./hooks/useHandwritingSettings";

function App() {
  const { settings, updateSetting } = useHandwritingSettings();

  const [text, setText] = useState(
    "Welcome to HandwritingAI Pro!\n\nThis is a pixel-perfect Canvas-Based Handwriting Synthesis Engine.\n\nFeatures:\n• Physics-based text rendering with baseline jitter\n• Organic kerning for natural letter spacing\n• Line drift simulation (0.5° tilt)\n• Advanced ink rendering with pressure variation\n• Scanner effect for authentic scanned documents\n• Hand-drawn diagrams with pencil texture\n\nTry adjusting the settings to create your perfect handwritten style!",
  );
  const [uploadedDiagram, setUploadedDiagram] = useState(null);
  const [diagramLabels, setDiagramLabels] = useState([]);

  const handleTextUpload = (content) => setText(content);
  const handleDiagramUpload = (imageData) => setUploadedDiagram(imageData);
  const handleTextChange = (newText) => setText(newText);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom right, #111827, #1f2937, #374151)",
      }}
    >
      <Sidebar
        settings={settings}
        updateSetting={updateSetting}
        onTextUpload={handleTextUpload}
        onDiagramUpload={handleDiagramUpload}
        text={text}
        onTextChange={handleTextChange}
        diagramLabels={diagramLabels}
        onDiagramLabelsChange={setDiagramLabels}
      />

      <div className="flex-1 overflow-auto">
        <EnhancedCanvas
          text={text}
          paperStyle={settings.paperStyle}
          font={settings.font}
          inkColor={settings.inkColor}
          penType={settings.penType}
          messiness={settings.messiness}
          uploadedDiagram={uploadedDiagram}
          scannerEffect={settings.scannerEffect}
          inkIntensity={settings.inkIntensity}
          charSpacing={settings.charSpacing}
          fontSize={settings.fontSize}
          lineHeight={settings.lineHeight}
          pageSize={settings.pageSize}
          lineOpacity={settings.lineOpacity}
        />
      </div>
    </div>
  );
}

export default App;
