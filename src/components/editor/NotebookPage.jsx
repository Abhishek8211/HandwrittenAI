import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import confetti from "canvas-confetti";
import TextRenderer from "./TextRenderer";
import { getPaperClass } from "../../utils/paperStyles";

const NotebookPage = ({
  text,
  paperStyle,
  font,
  inkColor,
  penType,
  messiness,
  uploadedDiagram,
}) => {
  const pageRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!pageRef.current) return;

    try {
      // Capture the page as canvas
      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Convert to PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("handwritten-note.pdf");

      // Celebration effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1E40AF", "#DC2626", "#059669"],
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-screen">
      {/* A4 Paper */}
      <motion.div
        ref={pageRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-[210mm] min-h-[297mm] shadow-2xl ${getPaperClass(paperStyle)} p-16 overflow-hidden`}
        style={{
          boxShadow:
            "0 10px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Uploaded Diagram */}
        {uploadedDiagram && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex justify-center"
          >
            <img
              src={uploadedDiagram}
              alt="Uploaded diagram"
              className="max-w-full h-auto"
              style={{
                mixBlendMode: "multiply",
                filter: "sepia(0.2) contrast(1.1)",
                maxHeight: "400px",
              }}
            />
          </motion.div>
        )}

        {/* Handwritten Text */}
        <TextRenderer
          text={text}
          font={font}
          inkColor={inkColor}
          penType={penType}
          messiness={messiness}
        />
      </motion.div>

      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDownloadPDF}
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
      >
        <Download className="w-5 h-5" />
        Download as PDF
      </motion.button>
    </div>
  );
};

export default NotebookPage;
