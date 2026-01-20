import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import NotebookPage from "./components/editor/NotebookPage";
import { useHandwritingSettings } from "./hooks/useHandwritingSettings";

function App() {
  const { settings, updateSetting } = useHandwritingSettings();
  const [text, setText] = useState(
    "Welcome to HandwritingAI!\n\nStart by uploading a text file or diagram to see the magic happen.\n\nYour digital notes will transform into realistic handwritten documents with customizable styles, ink colors, and natural human imperfections.",
  );
  const [uploadedDiagram, setUploadedDiagram] = useState(null);

  const handleTextUpload = (content) => {
    setText(content);
  };

  const handleDiagramUpload = (imageData) => {
    setUploadedDiagram(imageData);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        settings={settings}
        updateSetting={updateSetting}
        onTextUpload={handleTextUpload}
        onDiagramUpload={handleDiagramUpload}
      />

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto">
        <NotebookPage
          text={text}
          paperStyle={settings.paperStyle}
          font={settings.font}
          inkColor={settings.inkColor}
          penType={settings.penType}
          messiness={settings.messiness}
          uploadedDiagram={uploadedDiagram}
        />
      </div>
    </div>
  );
}

export default App;
