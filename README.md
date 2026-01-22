<div align="center">

# ✍️ HandwritingAI Pro

### Transform Digital Text into Realistic Handwritten Documents

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A pixel-perfect Canvas-Based Handwriting Synthesis Engine that creates authentic handwritten documents from digital text**

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🎨 Customization](#-customization)

</div>

---

## 📸 Screenshots

<div align="center">
<img src="https://via.placeholder.com/800x450/1f2937/60a5fa?text=Interactive+Canvas+Demo" alt="Interactive Canvas" />
<p><i>Click anywhere to add handwritten text with real-time preview</i></p>
</div>

---

## ✨ Features

### 🎯 Interactive Click-to-Write Canvas

- **Click Anywhere to Add Text** - Transform your canvas into a real digital notebook
- **Floating Input Box** - Intuitive text input with smart positioning
- **Draggable Text Editor** - Move the input box wherever you need it
- **Real-time Preview** - See cursor position before typing
- **Multi-line Support** - Write paragraphs with natural line breaks

### 🖋️ Authentic Handwriting Rendering

- **13+ Handwriting Fonts** - Kalam, Caveat, Indie Flower, Architects Daughter, and more
- **Natural Variations** - Organic kerning, baseline jitter, and letter spacing
- **Physics-based Rendering** - Line drift simulation (0.5° tilt) for human-like writing
- **Adjustable Messiness** - Control human error level (0-100%)
- **Multiple Pen Types** - Ballpoint, Gel, Fountain, Pencil, Marker

### 🎨 Paper & Ink Customization

- **Paper Styles**: Blue ruled lines, Black ruled lines, Dotted grid, Plain white
- **Ink Colors**: Blue, Black, Red, Green with adjustable intensity
- **Page Sizes**: A3, A4, A5, Letter, Legal
- **Line Opacity Control** - Adjust ruled line visibility (10-100%)
- **Scanner Effect** - Add authentic scanned document appearance

### 🛠️ Powerful Editing Tools

- **Unlimited Undo/Redo** - Full history support for all changes
- **Text Block Manager** - View, edit, and delete individual text blocks
- **Font Size Selection** - Small (20px), Medium (28px), Large (36px), X-Large (44px)
- **Live Text Editing** - Click any text on canvas to edit
- **Bulk Operations** - Clear all with confirmation

### 🖼️ Image Integration

- **Drag & Drop Images** - Upload diagrams and illustrations
- **Draggable Positioning** - Move images anywhere on the page
- **Boundary Constraints** - Images stay within canvas limits
- **Multiple Format Support** - PNG, JPG, SVG, and more

### 📥 Export Options

- **PDF Export** - High-quality PDF generation with jsPDF
- **PNG Export** - Raster image export for sharing
- **Preserve Quality** - All handwriting details maintained
- **One-click Download** - Instant file generation

### ⚙️ Advanced Settings

- **Font Size** - 20-36px range
- **Line Spacing** - Tight to loose (32-52px)
- **Ink Intensity** - Light to bold (50-150%)
- **Character Spacing** - Tight to wide (-2 to +3)
- **Custom Text Input** - Editable sidebar text area
- **File Upload** - Import .txt files directly

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn installed
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/Abhishek8211/HandwrittenAI.git

# Navigate to project directory
cd HandwrittenAI

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

---

## 📖 How to Use

### 1️⃣ Adding Text

1. Click anywhere on the white canvas area
2. A floating input box appears at the clicked position
3. Type your text (supports multi-line with Enter)
4. Press `Ctrl+Enter` or click the ✓ button to add
5. Text appears in handwritten style at the exact position

### 2️⃣ Editing Text

- **Method 1**: Click directly on existing text on the canvas
- **Method 2**: Click any block in the "Text Blocks" panel below
- Edit in the floating input and submit to update

### 3️⃣ Customizing Style

**Before Adding Text:**

- Select font size from the toolbar dropdown
- Choose ink color from the color palette
- Adjust messiness slider for more/less variation

**Global Settings (Sidebar):**

- Change handwriting font style
- Select paper type and page size
- Adjust ink intensity and spacing
- Enable scanner effect

### 4️⃣ Managing Text

- **Undo/Redo**: Use ◄ ► buttons in toolbar
- **Delete**: Click delete button in text blocks panel
- **Clear All**: Remove all text with confirmation

### 5️⃣ Adding Images

1. Upload an image via sidebar "Upload Diagram" button
2. Click and drag the image to reposition
3. Image stays within canvas boundaries

### 6️⃣ Exporting

- Click **PDF** button for PDF download
- Click **PNG** button for image export

---

## 🎨 Customization

### Available Handwriting Fonts

| Font                    | Style              | Best For                   |
| ----------------------- | ------------------ | -------------------------- |
| **Kalam**               | Natural, balanced  | General notes, assignments |
| **Caveat**              | Flowing, elegant   | Letters, creative writing  |
| **Indie Flower**        | Casual, friendly   | Personal notes             |
| **Architects Daughter** | Technical, precise | Diagrams, labels           |
| **Shadows Into Light**  | Light, airy        | Quick notes                |
| **Handlee**             | Classic cursive    | Formal documents           |
| **Gochi Hand**          | Playful, rounded   | Fun projects               |

### Paper Styles

- **Blue Ruled Lines** - Classic notebook style
- **Black Ruled Lines** - Professional documents
- **Dotted Grid** - Technical drawings
- **Plain White** - Maximum flexibility

### Pen Types & Effects

- **Ballpoint** - Standard pen with medium flow
- **Gel** - Smooth, consistent ink
- **Fountain** - Variable thickness, artistic
- **Pencil** - Soft, sketchy appearance
- **Marker** - Bold, thick strokes

---

## 🏗️ Tech Stack

- **React 18.3** - UI framework with hooks
- **Vite 6.0** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **jsPDF** - PDF generation
- **Canvas API** - Hardware-accelerated rendering
- **Google Fonts** - Authentic handwriting fonts

---

## 📁 Project Structure

```
HandwrittenAI/
├── src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EnhancedCanvas.jsx      # Main interactive canvas
│   │   │   ├── TextRenderer.jsx        # Text rendering engine
│   │   │   └── NotebookPage.jsx        # Page layout
│   │   ├── layout/
│   │   │   └── Sidebar.jsx             # Settings sidebar
│   │   └── ui/                          # Reusable UI components
│   ├── hooks/
│   │   └── useHandwritingSettings.js   # Settings state management
│   ├── utils/
│   │   ├── HandwritingEngine.js        # Core rendering logic
│   │   ├── paperStyles.js              # Paper backgrounds
│   │   └── fontLoader.js               # Font utilities
│   ├── App.jsx                          # Root component
│   └── main.jsx                         # Entry point
├── public/                              # Static assets
└── docs/                                # Documentation
```

---

## 🎯 Key Features Explained

### Click-to-Write Architecture

The canvas uses a **state-driven rendering system** where each click creates a text block object:

```javascript
{
  id: timestamp,
  x: number,        // Exact pixel position
  y: number,
  text: string,
  fontSize: number,
  color: string
}
```

### Performance Optimizations

- **React.memo** - Prevent unnecessary re-renders
- **Throttled mouse events** - 60fps cursor tracking
- **Canvas transform** - Hardware-accelerated scaling
- **Lazy image loading** - Only render when needed
- **History state management** - Efficient undo/redo

### Handwriting Physics

- **Baseline jitter** - ±2px vertical variation per character
- **Line drift** - 0.5° rotation for natural slant
- **Organic kerning** - Variable letter spacing (±1px)
- **Pressure variation** - Simulated pen pressure changes
- **Character rotation** - Subtle angle variations (±2°)

---

## 🐛 Troubleshooting

**Q: Text input box not appearing?**  
A: Make sure you're clicking on the white canvas area, not on existing text or images.

**Q: Exports are blank?**  
A: Ensure text blocks are added to the canvas before exporting.

**Q: Fonts not loading?**  
A: Check internet connection - fonts are loaded from Google Fonts CDN.

**Q: Performance issues with many text blocks?**  
A: Recommended maximum ~100 text blocks for optimal performance.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abhishek Kumar**

- GitHub: [@Abhishek8211](https://github.com/Abhishek8211)
- Email: abhishekkrbgp8211@gmail.com

---

## 🙏 Acknowledgments

- Google Fonts for handwriting font collection
- Lucide React for beautiful icons
- jsPDF for PDF generation
- React community for excellent documentation

---

## 🔮 Roadmap

- [ ] **Touch support** for tablets and mobile devices
- [ ] **Multi-page support** for longer documents
- [ ] **Custom font upload** - Use your own handwriting
- [ ] **Collaboration mode** - Real-time multi-user editing
- [ ] **Templates** - Pre-designed layouts
- [ ] **Cloud storage** - Save and sync projects
- [ ] **Mobile app** - Native iOS/Android versions
- [ ] **AI handwriting generation** - Train on your writing style

---

<div align="center">

### ⭐ Star this repo if you find it useful!

**Made with Passion by Abhishek Kumar**

[Report Bug](https://github.com/Abhishek8211/HandwrittenAI/issues) • [Request Feature](https://github.com/Abhishek8211/HandwrittenAI/issues)

</div>
