import { useState, useCallback } from "react";

export const useHandwritingSettings = () => {
  const [settings, setSettings] = useState({
    font: "kalam",
    inkColor: "#1E40AF", // Blue
    penType: "ballpoint",
    messiness: 40,
    paperStyle: "ruled-blue",
    scannerEffect: false,
    inkIntensity: 1.0, // 0.5 to 1.5
    charSpacing: 0, // -2 to 3
    fontSize: 28, // 20 to 36
    lineHeight: 40, // 32 to 52
    pageSize: "A4", // A3, A4, A5, Letter, Legal
    lineOpacity: 0.6, // 0.1 to 1.0
  });

  // Memoize update function to prevent re-renders
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return {
    settings,
    updateSetting,
  };
};
