import { useState } from "react";

export const useHandwritingSettings = () => {
  const [settings, setSettings] = useState({
    font: "caveat",
    inkColor: "#1E40AF", // Blue
    penType: "ballpoint",
    messiness: 30,
    paperStyle: "ruled",
  });

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    settings,
    updateSetting,
  };
};
