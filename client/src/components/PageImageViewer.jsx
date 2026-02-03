

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

const PageImageViewer = ({ imagePath, lines = [], activeText = "" }) => {

    const imgRef = useRef(null);
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    
    const [scale, setScale] = useState({ x: 1, y: 1 });
    const [loading, setLoading] = useState(true);
    const [naturalSize, setNaturalSize] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    
    // Add mouse drag to pan
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const imageUrl = imagePath
        ? `${import.meta.env.VITE_CDN_URL}${imagePath}`
        : null;

    // Normalize text for comparison - more lenient matching
    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Check if a line should be highlighted - improved matching
    const shouldHighlight = (lineText) => {
        if (!lineText || !activeText) return false;
        
        const normLine = normalizeText(lineText);
        const normActive = normalizeText(activeText);
        
        if (normLine.length < 5) return false;
        
        return normActive.includes(normLine) || normLine.includes(normActive);
    };

    // ⚠️ IMPORTANT: Define activeLines BEFORE using it in useEffect
    const activeLines = lines.filter(line => shouldHighlight(line.text));

    // Calculate scale when image loads or resizes
    const updateScale = () => {
        if (!imgRef.current || !naturalSize) return;
        
        const displayWidth = imgRef.current.clientWidth;
        const displayHeight = imgRef.current.clientHeight;
        
        const scaleX = displayWidth / naturalSize.w;
        const scaleY = displayHeight / naturalSize.h;
        
        setScale({ x: scaleX, y: scaleY });
    };

    useEffect(() => {
        if (naturalSize) {
            updateScale();
            window.addEventListener('resize', updateScale);
            return () => window.removeEventListener('resize', updateScale);
        }
    }, [naturalSize]);

    // Auto-zoom to highlighted text
    useEffect(() => {
          return;
        if (!naturalSize || activeLines.length === 0 || !containerRef.current || !imgRef.current) {

            // Reset zoom when no active text
            if (!activeText && zoomLevel !== 1) {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
            }
            return;
        }

        // Calculate the bounding box of all highlighted lines
        const pageMinX = Math.min(...lines.map(l => l.bbox.x));
        const pageMinY = Math.min(...lines.map(l => l.bbox.y));

        const highlights = activeLines.map(line => ({
            x: (line.bbox.x - pageMinX) * scale.x,
            y: (line.bbox.y - pageMinY) * scale.y,
            w: line.bbox.w * scale.x,
            h: line.bbox.h * scale.y
        }));

        // Find the bounding box that contains all highlights
        const minX = Math.min(...highlights.map(h => h.x));
        const minY = Math.min(...highlights.map(h => h.y));
        const maxX = Math.max(...highlights.map(h => h.x + h.w));
        const maxY = Math.max(...highlights.map(h => h.y + h.h));

        const highlightWidth = maxX - minX;
        const highlightHeight = maxY - minY;
        const centerX = minX + highlightWidth / 2;
        const centerY = minY + highlightHeight / 2;

        // Calculate zoom level to fit highlighted area (with padding)
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        const padding = 80;
        const targetZoom = Math.min(
            (containerWidth - padding) / highlightWidth,
            (containerHeight - padding) / highlightHeight,
            3
        );

        const newZoom = Math.max(1.5, Math.min(3, targetZoom));

        // Calculate pan offset to center the highlighted area
        const imageWidth = imgRef.current.clientWidth;
        const imageHeight = imgRef.current.clientHeight;
        
        const scaledImageWidth = imageWidth * newZoom;
        const scaledImageHeight = imageHeight * newZoom;
        
        const zoomedCenterX = centerX * newZoom;
        const zoomedCenterY = centerY * newZoom;
        
        let offsetX = (containerWidth / 2) - zoomedCenterX;
        let offsetY = (containerHeight / 2) - zoomedCenterY;
        
        const maxOffsetX = 0;
        const minOffsetX = containerWidth - scaledImageWidth;
        const maxOffsetY = 0;
        const minOffsetY = containerHeight - scaledImageHeight;
        
        offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, offsetX));
        offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, offsetY));

        setZoomLevel(newZoom);
        setPanOffset({ x: offsetX, y: offsetY });

    }, [activeText, activeLines.length, naturalSize, scale, lines, zoomLevel]);


    // Mouse drag handlers
    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - panOffset.x,
                y: e.clientY - panOffset.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            const newOffset = {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            };
            
            if (containerRef.current && imgRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const containerHeight = containerRef.current.clientHeight;
                const scaledImageWidth = imgRef.current.clientWidth * zoomLevel;
                const scaledImageHeight = imgRef.current.clientHeight * zoomLevel;
                
                const maxOffsetX = 0;
                const minOffsetX = containerWidth - scaledImageWidth;
                const maxOffsetY = 0;
                const minOffsetY = containerHeight - scaledImageHeight;
                
                newOffset.x = Math.max(minOffsetX, Math.min(maxOffsetX, newOffset.x));
                newOffset.y = Math.max(minOffsetY, Math.min(maxOffsetY, newOffset.y));
            }
            
            setPanOffset(newOffset);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart, zoomLevel, panOffset]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span>Textbook Page {activeLines.length > 0 && `(${activeLines.length} matches)`}</span>
                {naturalSize && (
                    <span className="text-xs text-gray-500">
                        {naturalSize.w} × {naturalSize.h}px
                    </span>
                )}
            </div>
            
            {/* Zoom Controls */}
            <div className="absolute top-20 right-8 z-20 flex flex-col gap-2">
                <button
                    onClick={() => {
                        const newZoom = Math.min(zoomLevel + 0.5, 4);
                        setZoomLevel(newZoom);
                    }}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    title="Zoom In"
                >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                </button>
                <button
                    onClick={() => {
                        const newZoom = Math.max(zoomLevel - 0.5, 1);
                        setZoomLevel(newZoom);
                        if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
                    }}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    title="Zoom Out"
                >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" />
                    </svg>
                </button>
                <button
                    onClick={() => {
                        setZoomLevel(1);
                        setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 ${
                        zoomLevel === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Reset Zoom"
                    disabled={zoomLevel === 1}
                >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {Math.round(zoomLevel * 100)}%
                    </span>
                </div>
            </div>

           <div 
    ref={containerRef}
    className="relative bg-gray-100 dark:bg-gray-900 flex-1 overflow-hidden"

                style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                onMouseDown={handleMouseDown}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {imageUrl ? (
           <div
  ref={wrapperRef}
  className="relative w-full h-full flex items-start justify-center"
  style={{ position: 'relative' }}
>


                        <img
                            ref={imgRef}
                            src={imageUrl}
                            onLoad={(e) => {
                                const w = e.target.naturalWidth;
                                const h = e.target.naturalHeight;
                                
                                setNaturalSize({ w, h });
                                setLoading(false);
                                
                                setTimeout(() => {
                                    if (imgRef.current) {
                                        const displayWidth = imgRef.current.clientWidth;
                                        const displayHeight = imgRef.current.clientHeight;
                                        
                                        setScale({
                                            x: displayWidth / w,
                                            y: displayHeight / h
                                        });
                                    }
                                }, 50);
                            }}
                            className="w-full h-auto block"
style={{ display: 'block', maxHeight: 'none' }}

                            alt="Textbook page"
                        />
{/* 🧠 Selectable Text Overlay */}
<div
  className="absolute inset-0 z-10"
  style={{
    pointerEvents: "auto",
    userSelect: "text",
    width: `${imgRef.current?.clientWidth}px`,
    height: `${imgRef.current?.clientHeight}px`
  }}
>

  {naturalSize && imgRef.current && lines.map((line, idx) => {
    const scaleX = imgRef.current.clientWidth / naturalSize.w;
    const scaleY = imgRef.current.clientHeight / naturalSize.h;

    return (
      <span
        key={idx}
        style={{
          position: "absolute",
          left: `${line.bbox.x * scaleX}px`,
          top: `${line.bbox.y * scaleY}px`,
          width: `${line.bbox.w * scaleX}px`,
          height: `${line.bbox.h * scaleY}px`,
          fontSize: `${line.bbox.h * scaleY}px`,
          lineHeight: 1,
          color: "transparent",
          background: "transparent",
          whiteSpace: "pre",
          cursor: "text"
        }}
      >
        {line.text}
      </span>
    );
  })}
</div>

                        {/* Highlight overlays */}
                        
                    </div>
                ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                        Page image not available
                    </div>
                )}
            </div>

            <style>{`
                @keyframes glow {
                    from {
                        box-shadow: 0 0 20px rgba(255, 193, 7, 0.8), inset 0 0 10px rgba(255, 235, 59, 0.4);
                        border-color: #FFC107;
                    }
                    to {
                        box-shadow: 0 0 30px rgba(255, 193, 7, 1), inset 0 0 15px rgba(255, 235, 59, 0.6);
                        border-color: #FFD54F;
                    }
                }
            `}</style>
        </div>
    );
};

export default PageImageViewer;