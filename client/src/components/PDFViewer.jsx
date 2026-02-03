import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Loader2, RotateCw } from 'lucide-react';

const PDFViewer = ({ pdfUrl, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.3);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
const textLayerRef = useRef(null);

  const pdfDocRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, rotation]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      const pdfjsLib = window.pdfjsLib || await loadPDFJS();
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setLoading(false);
      
      renderPage(currentPage);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF. Please try again.');
      setLoading(false);
    }
  };

  const loadPDFJS = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const renderPage = async (pageNum) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale, rotation });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</p>
        <button
          onClick={loadPDF}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg transition-all"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-300 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-200 dark:border-gray-600"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {currentPage} / {numPages}
              </span>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-200 dark:border-gray-600"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Zoom & Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-200 dark:border-gray-600"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(scale * 100)}%
              </span>
            </div>
            
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-200 dark:border-gray-600"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
            
            <button
              onClick={handleRotate}
              className="p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all shadow-sm border border-gray-200 dark:border-gray-600"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
            
            <button
              onClick={handleFullscreen}
              className="p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all shadow-sm border border-gray-200 dark:border-gray-600"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div 
        className="overflow-auto bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" 
        style={{ height: '60vh', minHeight: '400px' }}
      >
        <div className="flex justify-center items-start p-6">
          <canvas
            ref={canvasRef}
            className="shadow-2xl bg-white rounded-lg border-4 border-white dark:border-gray-700"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Page Info Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t border-gray-300 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">Page {currentPage} of {numPages}</span>
          <span>•</span>
          <span>Zoom: {Math.round(scale * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;