/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import {
  Lock,
  Plus,
  Trash2,
  Download,
  Copy,
  Sparkle,
  Check,
  ChevronDown,
  Loader2,
  Hand,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Box,
  PenTool,
  Sun,
  Moon,
  type LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { HexAlphaColorPicker } from "react-colorful";

import acidGreenPlastic from './assets/materials/acid-green-plastic.png';
import terrazzoStone from './assets/materials/terrazzo-stone.png';
import goldMetal from './assets/materials/gold-metal.png';
import silverMetal from './assets/materials/silver-metal.png';
import greyMetal from './assets/materials/grey-metal.png';
import offWhitePaper from './assets/materials/off-white-paper.png';
import glass from './assets/materials/glass.png';

// --- Components ---

// --- Components ---

const FigmaColorPicker = ({ 
  color, 
  onChange, 
  onClose,
  anchorRect
}: { 
  color: string, 
  onChange: (c: string) => void, 
  onClose: () => void,
  anchorRect: DOMRect | null
}) => {
  const dragControls = useDragControls();
  // Extract hex and alpha
  const hex = color.slice(0, 7);
  const alpha = color.length > 7 ? Math.round((parseInt(color.slice(7, 9), 16) / 255) * 100) : 100;

  const [localHex, setLocalHex] = useState(hex.replace('#', '').toUpperCase());
  const scrubRef = useRef<{ startX: number; startAlpha: number } | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocalHex(hex.replace('#', '').toUpperCase());
  }, [hex]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
    setLocalHex(val);
    if (val.length === 6) {
      onChange(`#${val}${color.slice(7) || 'ff'}`);
    }
  };

  const handleScrubMove = (e: MouseEvent | TouchEvent) => {
    if (!scrubRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - scrubRef.current.startX;
    const newAlpha = Math.min(100, Math.max(0, scrubRef.current.startAlpha + Math.round(delta / 2)));
    const aHex = Math.round((newAlpha / 100) * 255).toString(16).padStart(2, '0');
    onChangeRef.current(`${hex}${aHex}`);
  };

  const handleScrubEnd = () => {
    scrubRef.current = null;
    window.removeEventListener('mousemove', handleScrubMove);
    window.removeEventListener('mouseup', handleScrubEnd);
    window.removeEventListener('touchmove', handleScrubMove);
    window.removeEventListener('touchend', handleScrubEnd);
    document.body.style.cursor = '';
  };

  const handleScrubStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    scrubRef.current = { startX: clientX, startAlpha: alpha };
    window.addEventListener('mousemove', handleScrubMove);
    window.addEventListener('mouseup', handleScrubEnd);
    window.addEventListener('touchmove', handleScrubMove);
    window.addEventListener('touchend', handleScrubEnd);
    document.body.style.cursor = 'ew-resize';
  };

  // Calculate initial position
  const initialPos = {
    x: anchorRect ? Math.max(10, Math.min(window.innerWidth - 250, anchorRect.left - 260)) : window.innerWidth / 2 - 120,
    y: anchorRect ? Math.max(10, Math.min(window.innerHeight - 340, anchorRect.top)) : window.innerHeight / 2 - 170
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[9998]" 
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <motion.div 
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.95, x: initialPos.x, y: initialPos.y }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-[9999] bg-[var(--bg-panel)] border border-[var(--overlay-10)] rounded-xl p-4 w-[240px] pointer-events-auto cursor-default"
        onMouseDown={(e) => e.stopPropagation()}
      >
      <style>{`
        .figma-picker .react-colorful__saturation { border-radius: 8px 8px 0 0; height: 140px; }
        .figma-picker .react-colorful__hue, .figma-picker .react-colorful__alpha { height: 12px; border-radius: 6px; margin-top: 12px; }
        .figma-picker .react-colorful__pointer { width: 16px; height: 16px; }
      `}</style>
      <div 
        className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <span className="text-xs font-medium text-[var(--text-secondary)] pointer-events-none">Color Picker</span>
        <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
          <RotateCcw size={12} />
        </button>
      </div>
      <div className="figma-picker" onPointerDown={(e) => e.stopPropagation()}>
        <HexAlphaColorPicker color={color} onChange={onChange} className="!w-full !h-auto" />
      </div>
      <div className="mt-4 flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex-1 flex items-center gap-2 bg-[var(--bg-panel-2)] border border-[var(--overlay-10)] rounded-lg px-2 py-1.5">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Hex</span>
          <input
            type="text"
            value={localHex}
            onChange={handleHexChange}
            className="bg-transparent border-none outline-none text-xs font-mono text-[var(--text-primary)] w-full"
          />
        </div>
        <div className="w-20 flex items-center gap-1 bg-[var(--bg-panel-2)] border border-[var(--overlay-10)] rounded-lg px-2 py-1.5">
          <input
            type="text"
            value={alpha}
            onChange={(e) => {
              const a = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              const aHex = Math.round((a / 100) * 255).toString(16).padStart(2, '0');
              onChange(`${hex}${aHex}`);
            }}
            className="bg-transparent border-none outline-none text-xs font-mono text-[var(--text-primary)] w-full text-right"
          />
          <span
            className="text-xs font-medium text-[var(--text-secondary)] cursor-ew-resize select-none"
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart}
          >%</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full mt-4 py-2 bg-[#B6F23B] text-black text-sm font-bold rounded-lg hover:bg-[#c7f75a] transition-colors"
      >
        Confirm
      </button>
    </motion.div>
    </>
  );
};

// --- Types ---

type ModelOption = {
  id: string;
  label: string;
  provider: 'gemini' | 'openai';
  quality?: 'medium' | 'high';
  description: string;
};

const MODELS: ModelOption[] = [
  {
    id: 'gemini-2.5-flash-image',
    label: 'Standard (Free)',
    provider: 'gemini',
    description: 'Free tier, fast generation.'
  },
  {
    id: 'gpt-image-1-high',
    label: 'High Quality (Paid)',
    provider: 'openai',
    quality: 'high',
    description: 'Org-billed OpenAI generation, higher fidelity.'
  }
];

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

type SizePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  description: string;
};

const PRESETS: SizePreset[] = [
  { id: 'small', label: 'Small Icon', width: 32, height: 32, description: 'Minimalist, single object' },
  { id: 'medium', label: 'Medium Icon', width: 48, height: 48, description: 'Moderate detail' },
  { id: 'large', label: 'Large Icon', width: 72, height: 72, description: 'High detail, single object' },
  { id: 'xlarge', label: 'XL Icon', width: 120, height: 120, description: 'Maximum detail icon' },
  { id: 'scene', label: 'Scene', width: 393, height: 260, description: 'Complex scenario, background elements' },
  { id: 'custom', label: 'Custom', width: 393, height: 393, description: 'Manually defined dimensions' },
];

type ImageType = {
  id: '3d' | 'vector';
  label: string;
  icon: LucideIcon;
};

const IMAGE_TYPES: ImageType[] = [
  { id: '3d', label: '3D', icon: Box },
  { id: 'vector', label: 'Vector', icon: PenTool },
];

type Material = {
  id: string;
  label: string;
  image: string;
};

const MATERIALS: Material[] = [
  { id: 'acid-green-plastic', label: 'Acid-Green Plastic', image: acidGreenPlastic },
  { id: 'terrazzo-stone', label: 'Terrazzo Stone', image: terrazzoStone },
  { id: 'gold-metal', label: 'Gold Metal', image: goldMetal },
  { id: 'silver-metal', label: 'Silver Metal', image: silverMetal },
  { id: 'grey-metal', label: 'Grey Metal', image: greyMetal },
  { id: 'off-white-paper', label: 'Off-White Paper', image: offWhitePaper },
  { id: 'glass', label: 'Glass', image: glass },
];

const DEFAULT_COLORS = ['#B6F23B', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const CURRENT_COLORS = [
  '#B6F23B', '#92C926', // Brand Lime
  '#7A67DB', '#6252B2', // Purple
  '#406BE2', '#355ABD', // Blue
  '#02B3E3', '#028CB2', // Cyan
  '#00BD55', '#009945', // Green
  '#FFC725', '#E59B23', // Yellow
  '#E13D7C', '#B23062', // Pink
  '#DE3838', '#A61D1D', // Red
  '#EEC49E', '#BF9E7F', // Peach
  '#FCF9F7', '#E5E3E1', // Paper
  '#F2EFED', '#DBD9D7', // Sand
  '#A39D9A', '#807B78', // Stone
  '#876E58', '#665342', // Brown
  '#545250', '#3B3938'  // Charcoal
];

// --- App Component ---

export default function App() {
  const [paletteTab, setPaletteTab] = useState<'current' | 'custom'>('current');
  const [customColors, setCustomColors] = useState<string[]>(DEFAULT_COLORS);
  const [newColor, setNewColor] = useState('#6366f1');
  const [selectedSize, setSelectedSize] = useState<SizePreset>(PRESETS[5]); // Custom
  const [customWidth, setCustomWidth] = useState(393);
  const [customHeight, setCustomHeight] = useState(393);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [canvasBg, setCanvasBg] = useState('rgba(255, 255, 255, 0.1)');
  const [activeTool, setActiveTool] = useState<'select' | 'hand'>('select');
  const [prevTool, setPrevTool] = useState<'select' | 'hand'>('select');
  const [activePicker, setActivePicker] = useState<number | 'canvas' | null>(null);
  const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [zoomInput, setZoomInput] = useState('100');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
  const [imageType, setImageType] = useState<ImageType['id']>('vector');
  const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIALS[0].id);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [referenceImageEnabled, setReferenceImageEnabled] = useState(false);
  const [exportScale, setExportScale] = useState(1);

  // Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<string | null>(null);
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  // --- Handlers ---

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    
    // Native wheel listener to prevent browser zoom
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 10));
      }
    };
    window.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
      
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        setPrevTool(activeTool);
        setActiveTool('hand');
      }
      if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      }
      if (e.key.toLowerCase() === 'h') {
        setActiveTool('hand');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setActiveTool(prevTool);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, activeTool, prevTool]);

  // Sync zoom input with zoom state
  useEffect(() => {
    setZoomInput(Math.round(zoom * 100).toString());
  }, [zoom]);

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setZoomInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) {
      setZoom(num / 100);
    }
  };

  const handleZoomInputBlur = () => {
    const num = parseInt(zoomInput);
    if (isNaN(num) || num <= 0) {
      setZoomInput(Math.round(zoom * 100).toString());
    } else {
      setZoom(Math.min(Math.max(num / 100, 0.1), 10));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 10));
    } else {
      // Figma-style trackpad panning
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed || activeTool === 'hand' || e.button === 1) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Auto-zoom on size change
  useEffect(() => {
    const width = selectedSize.id === 'custom' ? customWidth : selectedSize.width;
    const height = selectedSize.id === 'custom' ? customHeight : selectedSize.height;
    
    // Calculate zoom to take up ~40% of viewport
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    
    const targetRatio = 0.4;
    const zoomW = (viewportW * targetRatio) / width;
    const zoomH = (viewportH * targetRatio) / height;
    
    let newZoom = Math.min(zoomW, zoomH);
    // Clamp zoom between 0.5 and 2 for presets unless they are huge/tiny
    newZoom = Math.min(Math.max(newZoom, 0.5), 4);
    
    // If it's a tiny icon, maybe zoom in more
    if (width <= 120) newZoom = Math.max(newZoom, 2);

    setZoom(newZoom);
    setPan({ x: 0, y: 0 });
  }, [selectedSize.id]);

  const resetCanvas = () => {
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
  };

  const activeColors = paletteTab === 'current' ? CURRENT_COLORS : customColors;

  const addColor = () => {
    if (customColors.length >= 50) return;
    setCustomColors(prev => [...prev, newColor.toUpperCase()]);
    setNewColor('#6366f1');
  };

  const removeColor = (colorToRemove: string) => {
    setCustomColors(customColors.filter(c => c !== colorToRemove));
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...customColors];
    newColors[index] = color.toUpperCase();
    setCustomColors(newColors);
  };

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = corner;
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      w: currentWidth,
      h: currentHeight
    };
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    let newW = startPos.current.w;
    let newH = startPos.current.h;

    const corner = isResizing.current;
    
    if (corner.includes('r')) newW = Math.max(32, startPos.current.w + dx * 2);
    if (corner.includes('l')) newW = Math.max(32, startPos.current.w - dx * 2);
    if (corner.includes('b')) newH = Math.max(32, startPos.current.h + dy * 2);
    if (corner.includes('t')) newH = Math.max(32, startPos.current.h - dy * 2);

    setCustomWidth(newW);
    setCustomHeight(newH);
    setIsCustom(true);
    
    // If we were on a preset, switch to custom when resizing
    if (selectedSize.id !== 'custom') {
      setSelectedSize(PRESETS[5]);
    }
  };

  const handleResizeEnd = () => {
    isResizing.current = null;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  };

  const generateIllustration = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const width = selectedSize.id === 'custom' ? customWidth : selectedSize.width;
      const height = selectedSize.id === 'custom' ? customHeight : selectedSize.height;

      const systemPrompt = `You are a world-class illustrator specializing in a specific flat-vector, geometric illustration style commonly used in fintech and modern banking products.

      ### ABSOLUTE COLOR RESTRICTION (CRITICAL) ###
      You are FORBIDDEN from using any colors, tints, shades, or hex codes other than the ones provided below.
      ALLOWED PALETTE: ${activeColors.join(', ')}

      - DO NOT introduce new colors.
      - DO NOT generate "shades" or "tints" of these colors.
      - DO NOT use gradients.
      - DO NOT use drop shadows.
      - If you need a "shade" for a 2.5D effect, you MUST select a DIFFERENT color from the ALLOWED PALETTE above. If no suitable darker color exists in the palette, DO NOT attempt to create one; use a contrasting color from the list instead.

      ILLUSTRATION STYLE & SHAPE VOCABULARY:
      - Perspective & Dimensionality: Default to a 2.5D or isometric perspective. Simulate depth strictly by using flat geometric planes and intersecting shapes.
      - Anatomy & Interaction: Construct human hands using highly simplified, blocky vector outlines. No realistic anatomical details.
      - Shape Construction: Build all forms using strict geometric precision (perfect circles, exact rectangles, consistent radii). Avoid organic or hand-drawn pathing.
      - Shading & Color Blocks: Every distinct color area MUST be a solid block of color from the ALLOWED PALETTE. Every area MUST be separated by a solid 1px black stroke.

      STRICT TECHNICAL RULES:
      1. Stroke: Every single object, plane, and color block MUST have a 1px centered black outline (stroke="#000000").
      2. Shading: Shading must be a solid block color from the palette. Never use shading without solid black outlines. Never blend or use multiple colors within the same fill area.
      3. Background: The background MUST be transparent.
      4. Output: Return ONLY a high-quality PNG image.`;

      let base64Image = '';

      if (selectedModel.provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Gemini API key is missing. Set GEMINI_API_KEY in .env.local.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const parts: any[] = [
          { text: `Generate a PNG illustration for: "${prompt}". Dimensions: ${width}x${height}` }
        ];
        if (referenceImage) {
          parts.push({
            inlineData: {
              mimeType: "image/png",
              data: referenceImage.split(',')[1]
            }
          });
          parts[0].text += " Use the provided reference image to inform the style, composition, or subject matter of the illustration.";
        }

        const response = await ai.models.generateContent({
          model: selectedModel.id,
          contents: [{ parts }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Image = part.inlineData.data ?? '';
            break;
          }
        }
      } else {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("OpenAI API key is missing. Set OPENAI_API_KEY in .env.local.");
        }

        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const size = width === height ? '1024x1024' : width > height ? '1536x1024' : '1024x1536';

        let userText = `Generate a PNG illustration for: "${prompt}". Target aspect ratio: ${width}x${height}`;
        if (referenceImage) {
          userText += " Use the provided reference image to inform the style, composition, or subject matter of the illustration.";
        }

        const fullPrompt = `${systemPrompt}\n\n${userText}`;

        const response = referenceImage
          ? await openai.images.edit({
              model: 'gpt-image-1',
              image: await dataUrlToFile(referenceImage, 'reference.png'),
              prompt: fullPrompt,
              size,
              quality: selectedModel.quality,
              background: 'transparent',
            })
          : await openai.images.generate({
              model: 'gpt-image-1',
              prompt: fullPrompt,
              size,
              quality: selectedModel.quality,
              background: 'transparent',
            });

        base64Image = response.data?.[0]?.b64_json ?? '';
      }

      if (!base64Image) {
        throw new Error("The model failed to generate a PNG image. Please try a more specific prompt.");
      }

      setGeneratedImage(`data:image/png;base64,${base64Image}`);
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
      // Fallback: just copy the base64 string if image copy fails
      navigator.clipboard.writeText(generatedImage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const downloadPng = () => {
    if (!generatedImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * exportScale;
      canvas.height = img.naturalHeight * exportScale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `illustration-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = generatedImage;
  };

  const currentWidth = selectedSize.id === 'custom' ? customWidth : selectedSize.width;
  const currentHeight = selectedSize.id === 'custom' ? customHeight : selectedSize.height;

  const isCompact = windowHeight < 850;

  return (
    <div
      data-theme={theme}
      className={`fixed inset-0 bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans selection:bg-[#B6F23B]/20 overflow-hidden flex flex-col ${isSpacePressed || activeTool === 'hand' ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing select-none' : ''}`}
      onWheel={handleWheel}
      onMouseDown={(e) => {
        setActivePicker(null);
        handleMouseDown(e);
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Full Screen Dot Matrix Background */}
      <div className="absolute inset-0 pointer-events-none z-0" 
           style={{
             backgroundImage: 'radial-gradient(var(--dot-color) 1px, transparent 1px)',
             backgroundSize: '24px 24px',
             backgroundPosition: `${pan.x}px ${pan.y}px`
           }} />

      {/* Header - Full Width */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-8 flex items-center justify-between bg-[var(--bg-panel)] border-b border-[var(--overlay-8)]">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-normal text-[var(--text-primary)]">
            Current <span className="text-[#B6F23B]">Image Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay-5)] rounded-lg border border-[var(--overlay-10)] transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={resetCanvas}
            disabled={isGenerating}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay-5)] rounded-lg border border-[var(--overlay-10)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Reset Canvas"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!generatedImage}
            className={`p-2 rounded-lg border border-[var(--overlay-10)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${copySuccess ? 'text-[#B6F23B] bg-[#B6F23B]/5 border-[#B6F23B]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay-5)]'}`}
            title="Copy Image"
          >
            {copySuccess ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex-1 z-10 pt-16">
        {/* Sidebar Controls - Left */}
        <aside className="fixed left-0 top-16 bottom-0 w-[280px] z-40 bg-[var(--bg-panel)] border-r border-[var(--overlay-8)] overflow-y-auto scrollbar-hide flex flex-col">
          {/* Size Panel */}
          <section className="px-5 py-5 border-b border-[var(--overlay-8)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)]">Size</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Custom</span>
                <button
                  onClick={() => {
                    const next = !isCustom;
                    setIsCustom(next);
                    if (!next) {
                      setSelectedSize(PRESETS[4]); // Scene
                    } else {
                      setSelectedSize(PRESETS[5]); // Custom
                    }
                  }}
                  className={`w-10 h-5 rounded-full relative transition-colors p-1 ${isCustom ? 'bg-[#B6F23B]' : 'bg-[var(--overlay-10)]'}`}
                >
                  <motion.div
                    animate={{ x: isCustom ? 20 : 0 }}
                    className="w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isCustom ? (
                <motion.div
                  key="presets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-4 gap-2">
                    {PRESETS.slice(0, 4).map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedSize(preset)}
                        disabled={isGenerating}
                        className={`aspect-square rounded-lg border text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                          selectedSize.id === preset.id
                            ? 'border-[var(--text-primary)] bg-[var(--overlay-10)] text-[var(--text-primary)]'
                            : 'border-[var(--overlay-10)] text-[var(--text-tertiary)] hover:border-[var(--overlay-20)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        {preset.width}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedSize(PRESETS[4])}
                    disabled={isGenerating}
                    className={`w-full aspect-[393/260] rounded-xl border flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedSize.id === 'scene'
                        ? 'border-[var(--text-primary)] bg-[var(--overlay-10)]'
                        : 'border-[var(--overlay-10)] hover:border-[var(--overlay-20)] hover:bg-[var(--overlay-5)]'
                    }`}
                  >
                    <span className={`text-xs font-bold uppercase tracking-widest ${selectedSize.id === 'scene' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>Scene</span>
                    <span className="text-xs font-mono text-[var(--text-tertiary)]">393 x 260</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Width</label>
                    <input
                      type="number"
                      value={customWidth}
                      disabled={isGenerating}
                      onChange={(e) => {
                        setCustomWidth(Number(e.target.value));
                        setIsCustom(true);
                        if (selectedSize.id !== 'custom') setSelectedSize(PRESETS[5]);
                      }}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-field)] border border-[var(--overlay-10)] text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-[#B6F23B] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Height</label>
                    <input
                      type="number"
                      value={customHeight}
                      disabled={isGenerating}
                      onChange={(e) => {
                        setCustomHeight(Number(e.target.value));
                        setIsCustom(true);
                        if (selectedSize.id !== 'custom') setSelectedSize(PRESETS[5]);
                      }}
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-field)] border border-[var(--overlay-10)] text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-[#B6F23B] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Model Selection */}
          <section className="px-5 py-5 border-b border-[var(--overlay-8)]">
            <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)] mb-3">AI Model</h2>

            <div className="relative">
              <select
                value={selectedModel.id}
                onChange={(e) => {
                  const model = MODELS.find(m => m.id === e.target.value);
                  if (model) setSelectedModel(model);
                }}
                className="w-full bg-[var(--bg-field)] border border-[var(--overlay-10)] text-[var(--text-primary)] text-sm rounded-xl px-4 py-2.5 appearance-none focus:ring-2 focus:ring-[#B6F23B] outline-none cursor-pointer"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
            </div>
          </section>

          {/* Prompt Input */}
          <section className="px-5 py-5">
            <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)] mb-3">Prompt</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe the illustration..."
              className={`w-full h-24 px-4 py-3 text-sm bg-[var(--bg-field)] border text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-[#B6F23B] outline-none resize-none placeholder:text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed ${
                error ? 'border-red-900/50 bg-red-950/20' : 'border-[var(--overlay-10)]'
              }`}
            />

            {/* Reference Image Upload */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Reference Image</span>
                <button
                  onClick={() => {
                    const next = !referenceImageEnabled;
                    setReferenceImageEnabled(next);
                    if (!next) setReferenceImage(null);
                  }}
                  className={`w-10 h-5 rounded-full relative transition-colors p-1 ${referenceImageEnabled ? 'bg-[#B6F23B]' : 'bg-[var(--overlay-10)]'}`}
                >
                  <motion.div
                    animate={{ x: referenceImageEnabled ? 20 : 0 }}
                    className="w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {referenceImageEnabled && (
                !referenceImage ? (
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-[var(--overlay-10)] rounded-xl cursor-pointer hover:bg-[var(--overlay-5)] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-1">
                      <Move size={16} className="text-[var(--text-tertiary)] mb-1" />
                      <p className="text-xs text-[var(--text-tertiary)] font-medium">Upload Image</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setReferenceImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-20 rounded-xl overflow-hidden border border-[var(--overlay-10)]">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-bold">Image Selected</p>
                    </div>
                  </div>
                )
              )}
            </div>

            {error && (
              <p className="mt-2 text-xs text-red-400 font-medium bg-red-950/30 p-2 rounded-lg border border-red-900/30">
                {error}
              </p>
            )}
            <button
              onClick={generateIllustration}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-4 py-3 bg-[#B6F23B] text-black text-base font-bold rounded-xl hover:bg-[#c7f75a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle size={18} />
                  Generate
                </>
              )}
            </button>
          </section>
        </aside>

        {/* Sidebar Controls - Right */}
        <aside className="fixed right-0 top-16 bottom-0 w-[280px] z-40 bg-[var(--bg-panel)] border-l border-[var(--overlay-8)] overflow-y-auto scrollbar-hide">
          {/* Image Type */}
          <section className="px-5 py-5 border-b border-[var(--overlay-8)]">
            <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)] mb-3">Image Type</h2>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setImageType(type.id)}
                  disabled={isGenerating}
                  className={`py-4 rounded-lg border text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1.5 ${
                    imageType === type.id
                      ? 'border-[var(--text-primary)] bg-[var(--overlay-10)] text-[var(--text-primary)]'
                      : 'border-[var(--overlay-10)] text-[var(--text-tertiary)] hover:border-[var(--overlay-20)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <type.icon size={20} />
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          {imageType === 'vector' ? (
            /* Brand Palette */
            <section className="px-5 py-5 border-b border-[var(--overlay-8)]">
              <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)] mb-3">Brand Palette</h2>

              {/* Segmented Controller */}
              <div className="flex p-1 bg-[var(--overlay-4)] rounded-lg mb-4">
                <button
                  onClick={() => setPaletteTab('current')}
                  disabled={isGenerating}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${paletteTab === 'current' ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  Current
                  <Lock size={10} className={paletteTab === 'current' ? 'text-[var(--pill-active-text)]/50' : 'opacity-50'} />
                </button>
                <button
                  onClick={() => setPaletteTab('custom')}
                  disabled={isGenerating}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${paletteTab === 'custom' ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  Custom
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {activeColors.map((color, index) => (
                  <div
                    key={index}
                    className="group relative flex justify-center"
                  >
                    <button
                      onClick={(e) => {
                        if (paletteTab === 'current' || isGenerating) return;
                        e.stopPropagation();
                        setActivePicker(activePicker === index ? null : index);
                        setPickerAnchor(e.currentTarget.getBoundingClientRect());
                      }}
                      disabled={isGenerating}
                      className={`w-9 h-9 rounded-lg border border-[var(--overlay-10)] transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${paletteTab === 'current' ? 'cursor-default' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                    {paletteTab === 'custom' && (
                      <button
                        onClick={() => removeColor(color)}
                        disabled={isGenerating}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:hidden"
                      >
                        <Trash2 size={8} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {paletteTab === 'custom' && (
                <div className="mt-4 pt-4 border-t border-[var(--overlay-5)]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePicker(-1);
                      setPickerAnchor(e.currentTarget.getBoundingClientRect());
                    }}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-[var(--overlay-5)] hover:bg-[var(--overlay-10)] text-[var(--text-primary)] rounded-xl transition-all flex items-center justify-between px-4 border border-[var(--overlay-10)] border-dashed group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Add Color</span>
                    <Plus size={16} className="text-[var(--text-tertiary)] group-hover:text-[#B6F23B] transition-colors" />
                  </button>
                </div>
              )}
            </section>
          ) : (
            /* Materials */
            <section className="px-5 py-5 border-b border-[var(--overlay-8)]">
              <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)] mb-3">Materials</h2>
              <div className="grid grid-cols-3 gap-2">
                {MATERIALS.map(material => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterial(material.id)}
                    disabled={isGenerating}
                    className={`p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1.5 ${
                      selectedMaterial === material.id
                        ? 'border-[var(--text-primary)] bg-[var(--overlay-10)]'
                        : 'border-[var(--overlay-10)] hover:border-[var(--overlay-20)]'
                    }`}
                  >
                    <img src={material.image} alt={material.label} className="w-10 h-10 object-contain" />
                    <span className={`text-[10px] font-medium text-center leading-tight ${selectedMaterial === material.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {material.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Canvas Background Control */}
          <section className="px-5 py-5 border-b border-[var(--overlay-8)]">
            <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)] mb-3">Canvas Style</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--text-secondary)]">Background Color</span>
                <div className="flex gap-2 items-center relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePicker(activePicker === 'canvas' ? null : 'canvas');
                      setPickerAnchor(e.currentTarget.getBoundingClientRect());
                    }}
                    disabled={isGenerating}
                    className="w-7 h-7 rounded-lg border border-[var(--overlay-10)] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: canvasBg }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Export */}
          <section className="px-5 py-5">
            <h2 className="font-semibold text-base tracking-wide text-[var(--text-primary)] mb-3">Export</h2>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[1, 2, 3, 4].map(scale => (
                <button
                  key={scale}
                  onClick={() => setExportScale(scale)}
                  disabled={isGenerating}
                  className={`aspect-square rounded-lg border text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    exportScale === scale
                      ? 'border-[var(--text-primary)] bg-[var(--overlay-10)] text-[var(--text-primary)]'
                      : 'border-[var(--overlay-10)] text-[var(--text-tertiary)] hover:border-[var(--overlay-20)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>
            <button
              onClick={downloadPng}
              disabled={!generatedImage}
              className="w-full py-3 bg-[var(--overlay-10)] hover:bg-[var(--overlay-20)] text-[var(--text-primary)] text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-[var(--overlay-10)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Download
            </button>
          </section>
        </aside>

        {/* Global Color Picker Portal */}
        <AnimatePresence>
          {activePicker !== null && (
            <FigmaColorPicker 
              color={activePicker === 'canvas' ? canvasBg : (activePicker === -1 ? newColor : customColors[activePicker as number])}
              onChange={(c) => {
                if (activePicker === 'canvas') setCanvasBg(c);
                else if (activePicker === -1) setNewColor(c);
                else updateColor(activePicker as number, c);
              }}
              onClose={() => {
                if (activePicker === -1) addColor();
                setActivePicker(null);
              }}
              anchorRect={pickerAnchor}
            />
          )}
        </AnimatePresence>

        {/* Canvas Area - Full Screen */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="relative transition-transform duration-75 ease-out pointer-events-auto"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center'
            }}
          >
            {/* Canvas Container */}
            <div 
              ref={canvasRef}
              className="shadow-[0_0_100px_rgba(0,0,0,0.5)] relative"
              style={{ 
                width: currentWidth, 
                height: currentHeight,
                backgroundColor: canvasBg
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                {isGenerating && (
                  <div className="absolute inset-0 z-50 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  </div>
                )}
                {generatedImage ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img 
                      src={generatedImage} 
                      alt="Generated Illustration" 
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-100/5 gap-4">
                  </div>
                )}
              </div>

              {/* Resize Handles - Corners */}
              {!isGenerating && (
                <>
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 'tl')} 
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[var(--bg-canvas)] border-2 border-[#B6F23B] rounded-sm cursor-nwse-resize z-20 hover:scale-125 transition-transform" 
                    style={{ transform: `scale(${1/zoom})` }}
                  />
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 'tr')} 
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[var(--bg-canvas)] border-2 border-[#B6F23B] rounded-sm cursor-nesw-resize z-20 hover:scale-125 transition-transform" 
                    style={{ transform: `scale(${1/zoom})` }}
                  />
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 'bl')} 
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[var(--bg-canvas)] border-2 border-[#B6F23B] rounded-sm cursor-nesw-resize z-20 hover:scale-125 transition-transform" 
                    style={{ transform: `scale(${1/zoom})` }}
                  />
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 'br')} 
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[var(--bg-canvas)] border-2 border-[#B6F23B] rounded-sm cursor-nwse-resize z-20 hover:scale-125 transition-transform" 
                    style={{ transform: `scale(${1/zoom})` }}
                  />
                  
                  {/* Resize Handles - Sides */}
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 't')} 
                    className="absolute -top-2 left-0 right-0 h-4 bg-transparent hover:bg-[#B6F23B]/20 cursor-ns-resize z-10 transition-colors" 
                    style={{ transform: `scaleY(${1/zoom})`, transformOrigin: 'top' }}
                  />
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 'b')} 
                    className="absolute -bottom-2 left-0 right-0 h-4 bg-transparent hover:bg-[#B6F23B]/20 cursor-ns-resize z-10 transition-colors" 
                    style={{ transform: `scaleY(${1/zoom})`, transformOrigin: 'bottom' }}
                  />
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 'l')} 
                    className="absolute top-0 bottom-0 -left-2 w-4 bg-transparent hover:bg-[#B6F23B]/20 cursor-ew-resize z-10 transition-colors" 
                    style={{ transform: `scaleX(${1/zoom})`, transformOrigin: 'left' }}
                  />
                  <div 
                    onMouseDown={(e) => handleResizeStart(e, 'r')} 
                    className="absolute top-0 bottom-0 -right-2 w-4 bg-transparent hover:bg-[#B6F23B]/20 cursor-ew-resize z-10 transition-colors" 
                    style={{ transform: `scaleX(${1/zoom})`, transformOrigin: 'right' }}
                  />
                </>
              )}
            </div>

            {/* Dimensions Pill */}
            <div className="absolute left-1/2" style={{ top: `calc(100% + ${20 / zoom}px)`, transform: `translateX(-50%) scale(${1/zoom})`, transformOrigin: 'top' }}>
              <div className="bg-[var(--bg-canvas)] text-[var(--text-primary)] px-2.5 py-1 rounded-full text-[9px] font-bold shadow-2xl flex items-center gap-2 border border-[var(--overlay-10)] whitespace-nowrap">
                <span className="text-[#B6F23B]">W</span> {currentWidth}
                <div className="w-px h-2 bg-[var(--overlay-10)]" />
                <span className="text-[#B6F23B]">H</span> {currentHeight}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Panel */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[var(--bg-panel)] border border-[var(--overlay-10)] px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1 border-r border-[var(--overlay-10)] pr-4">
            <button
              onClick={() => setActiveTool('select')}
              disabled={isGenerating}
              className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${activeTool === 'select' ? 'bg-[#B6F23B] text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay-5)]'}`}
              title="Select (V)"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              onClick={() => setActiveTool('hand')}
              disabled={isGenerating}
              className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${activeTool === 'hand' ? 'bg-[#B6F23B] text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay-5)]'}`}
              title="Hand (H)"
            >
              <Hand size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.05, 0.1))}
              disabled={isGenerating}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomOut size={16} />
            </button>
            <div className="flex items-center gap-0.5 bg-[var(--overlay-5)] px-2 py-1 rounded-md border border-[var(--overlay-10)]">
              <input
                type="text"
                value={zoomInput}
                onChange={handleZoomInputChange}
                onBlur={handleZoomInputBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleZoomInputBlur()}
                className="text-sm font-mono w-8 text-center bg-transparent border-none outline-none text-[var(--text-secondary)]"
              />
              <span className="text-xs font-bold text-[var(--text-tertiary)]">%</span>
            </div>
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.05, 10))}
              disabled={isGenerating}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              disabled={isGenerating}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-l border-[var(--overlay-10)] ml-1 pl-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
