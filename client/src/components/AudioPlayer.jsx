/**
 * AudioPlayer.jsx
 * Handles fetching TTS audio from the REST endpoint and playing it.
 * Used for chapter narration (auto-read mode).
 *
 * Props:
 *   text          — string to narrate
 *   autoPlay      — play immediately when text changes
 *   isActive      — if false, do nothing
 *   onStart       — () => void
 *   onEnd         — () => void
 *   onError       — (msg) => void
 *   voice         — 'default' | 'male' | 'calm'
 *   silenced      — if true, don't play (mic is active)
 */

import { useEffect, useRef, useCallback, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const AudioPlayer = ({
  text,
  autoPlay = false,
  isActive = true,
  onStart,
  onEnd,
  onError,
  voice = 'default',
  silenced = false,
}) => {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const abortRef = useRef(null);

  const fetchAndPlay = useCallback(async (textToSpeak) => {
    if (!textToSpeak || silenced || !isActive) return;

    // Abort previous request if still in flight
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/voice/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: textToSpeak, voice }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        onStart?.();
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        onEnd?.();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        onError?.('Audio playback failed');
      };

      await audio.play();
    } catch (err) {
      if (err.name === 'AbortError') return;
      setIsLoading(false);
      setIsPlaying(false);
      onError?.(err.message);
    }
  }, [voice, silenced, isActive, onStart, onEnd, onError]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Auto-play when text changes
  useEffect(() => {
    if (autoPlay && text) {
      fetchAndPlay(text);
    }
  }, [text, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop when silenced
  useEffect(() => {
    if (silenced) stop();
  }, [silenced, stop]);

  // Cleanup
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // This component is headless — no visible UI, controlled by parent
  return null;
};

export default AudioPlayer;

/**
 * useNarration — hook for auto-narrating chapter segments
 *
 * Usage:
 *   const { narrateText, stopNarration, isNarrating } = useNarration({ silenced });
 */
export const useNarration = ({ silenced = false, voice = 'default' } = {}) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const audioRef = useRef(null);
  const abortRef = useRef(null);

  const narrateText = useCallback(async (text) => {
    if (!text || silenced) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setCurrentText(text);
    setIsNarrating(true);

    return new Promise(async (resolve) => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_BASE}/api/voice/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ text, voice }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error('TTS failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsNarrating(false);
          URL.revokeObjectURL(url);
          resolve('ended');
        };

        audio.onerror = () => {
          setIsNarrating(false);
          resolve('error');
        };

        await audio.play();
      } catch (err) {
        setIsNarrating(false);
        resolve(err.name === 'AbortError' ? 'aborted' : 'error');
      }
    });
  }, [silenced, voice]);

  const stopNarration = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsNarrating(false);
  }, []);

  useEffect(() => {
    if (silenced) stopNarration();
  }, [silenced, stopNarration]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  return { narrateText, stopNarration, isNarrating, currentText };
};