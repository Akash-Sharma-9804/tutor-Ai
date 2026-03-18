import { useState, useEffect } from 'react';
import api from '../api/axios'; // shared axios instance
import { normalizeMathsContent, normalizeEnglishContent, normalizePhysicsContent } from '../utils/normalizeContent';

// Picks the right normalizer based on subject name from chapter metadata
const normalizeBySubject = (content, chapter) => {
  const subject = (chapter?.subject_name || chapter?.subject || '').toLowerCase();
  if (/physics/i.test(subject))  return normalizePhysicsContent(content);
  if (/math/i.test(subject))     return normalizeMathsContent(content);
  if (/english/i.test(subject))  return normalizeEnglishContent(normalizeMathsContent(content));
  // Default: run both maths + english normalizers for generic subjects
  return normalizeEnglishContent(normalizeMathsContent(content));
};

// ─── API calls (inlined, no separate service file) ────────────────────────────

const fetchChapterContent = async (chapterId) => {
  const [contentRes, progressRes] = await Promise.all([
    api.get(`/books/chapters/${chapterId}/content`),
    api.get(`/books/chapters/${chapterId}/progress`).catch(() => ({ data: null })),
  ]);
  return { content: contentRes.data, progress: progressRes.data };
};

export const saveSegmentProgress = async (chapterId, payload) => {
  await api.post(`/books/chapters/${chapterId}/progress`, payload);
};

export const fetchDetailedExplanation = async (chapterId, text, context) => {
  const { data } = await api.post(`/books/chapters/${chapterId}/explain-detailed`, { text, context });
  if (typeof data === 'string') return data;
  if (data?.explanation) {
    const exp = data.explanation;
    if (typeof exp === 'string') return exp;
    if (typeof exp === 'object') return exp.text || exp.content || exp.explanation || JSON.stringify(exp, null, 2);
  }
  return JSON.stringify(data, null, 2);
};

export const getTTSStreamUrl = (chapterId) =>
  `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/tts`;

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useChapterData = (chapterId) => {
  const [chapterData, setChapterData]           = useState(null);
  const [chapter, setChapter]                   = useState(null);
  const [navigation, setNavigation]             = useState({ previous: null, next: null });
  const [pageImages, setPageImages]             = useState({});
  const [segments, setSegments]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentPdfPage, setCurrentPdfPage]     = useState(1);

  useEffect(() => { load(); }, [chapterId]); // eslint-disable-line

  const load = async () => {
    try {
      setLoading(true);
      const { content: data, progress: saved } = await fetchChapterContent(chapterId);

      setChapter(data.chapter);
      setChapterData(normalizeBySubject(data.content, data.chapter));
      setNavigation(data.navigation);

      const imageMap = {};
      (data.segments || []).forEach(s => { imageMap[s.page] = s.image_path; });
      setPageImages(imageMap);
      setSegments(data.segments || []);

      // Restore saved position
      if (saved?.lastPosition?.paragraph_id) {
        const m = saved.lastPosition.paragraph_id.match(/^page(\d+)_seg(\d+)$/);
        if (m) {
          const pg = parseInt(m[1]), sg = parseInt(m[2]);
          const sections = data.content?.sections || [];
          if (pg < sections.length && sg < (sections[pg]?.content?.length || 0)) {
            setCurrentPageIndex(pg);
            setCurrentSegmentIndex(sg);
          }
        }
      } else {
        setCurrentPageIndex(0);
        setCurrentSegmentIndex(0);
        const firstPage = data.content?.sections?.[0]?.content?.[0]?.page_number;
        if (firstPage) setCurrentPdfPage(firstPage);
      }
    } catch (err) {
      console.error('Failed to load chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    chapterData, chapter, navigation, pageImages, segments, loading,
    currentPageIndex, setCurrentPageIndex,
    currentSegmentIndex, setCurrentSegmentIndex,
    currentPdfPage, setCurrentPdfPage,
  };
};

export default useChapterData;