import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FULLSCREEN_ENTER_DELAY_MS } from '../constants/readerConfig';

/**
 * Manages fullscreen enter/exit and navigation-on-exit behaviour.
 * @param {object} opts
 * @param {boolean}  opts.loading         - true while chapter is still loading
 * @param {object}   opts.chapter         - chapter object (needs book_id for navigation)
 * @param {function} opts.onStopReading   - called whenever fullscreen state changes (stops audio)
 * @param {function} opts.onShowExitDialog - called on mobile when fullscreen is exited
 */
const useFullscreen = ({ loading, chapter, onStopReading, onShowExitDialog }) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenAttempted = useRef(false);

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );

    onStopReading();
    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && !loading && fullscreenAttempted.current) {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 1024;

      if (isMobile) {
        onShowExitDialog();
      } else {
        navigate(chapter?.book_id ? '/subjects' : -1);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    const timer = setTimeout(() => {
      if (!fullscreenAttempted.current && !loading) {
        fullscreenAttempted.current = true;
        enterFullscreen();
      }
    }, FULLSCREEN_ENTER_DELAY_MS);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isFullscreen, enterFullscreen, exitFullscreen };
};

export default useFullscreen;