import { useRef } from 'react';
import { saveSegmentProgress } from '../hooks/useChapterData';

/**
 * Manages segment/page navigation, progress saving, and subheading-skipping logic.
 */
const useSegmentNavigation = ({
  chapterId,
  chapterData,
  currentPageIndex,
  setCurrentPageIndex,
  currentSegmentIndex,
  setCurrentSegmentIndex,
  setShowDetailedExplanation,
}) => {
  const segmentStartTime = useRef(Date.now());

  const currentSection = chapterData?.sections?.[currentPageIndex] || { content: [], heading: '' };

  const saveProgress = async (segmentIdx, pageIdx) => {
    try {
      const seg = chapterData?.sections?.[pageIdx]?.content?.[segmentIdx];
      if (!seg) return;

      const timeSpent = Math.round((Date.now() - segmentStartTime.current) / 1000);
      const segmentId = seg.id || seg.segment_id || `page${pageIdx}_seg${segmentIdx}`;
      const pageNumber = chapterData?.sections?.[pageIdx]?.page_range?.[0] || pageIdx + 1;

      await saveSegmentProgress(chapterId, {
        paragraph_id: segmentId,
        page_number: pageNumber,
        segment_id: segmentId,
        time_spent_seconds: timeSpent,
        completed: 1,
      });
    } catch (err) {
      console.error('Progress save failed:', err);
    }
  };

  const isLastSegment = () => {
    const isLastSeg = currentSegmentIndex >= currentSection.content.length - 1;
    const isLastPage = currentPageIndex >= (chapterData?.sections?.length || 0) - 1;
    return isLastSeg && isLastPage;
  };

  const goToNextSegment = () => {
    saveProgress(currentSegmentIndex, currentPageIndex);
    segmentStartTime.current = Date.now();

    let nextSegIdx = currentSegmentIndex + 1;
    let nextPageIdx = currentPageIndex;

    if (nextSegIdx >= currentSection.content.length) {
      if (currentPageIndex < (chapterData?.sections?.length || 0) - 1) {
        nextPageIdx = currentPageIndex + 1;
        nextSegIdx = 0;
      }
    }

    // Skip ALL consecutive subheadings
    while (chapterData?.sections?.[nextPageIdx]?.content?.[nextSegIdx]?.type === 'subheading') {
      nextSegIdx += 1;
      if (nextSegIdx >= (chapterData?.sections?.[nextPageIdx]?.content?.length || 0)) {
        if (nextPageIdx < (chapterData?.sections?.length || 0) - 1) {
          nextPageIdx += 1;
          nextSegIdx = 0;
        } else {
          break;
        }
      }
    }

    if (nextPageIdx !== currentPageIndex) setCurrentPageIndex(nextPageIdx);
    setCurrentSegmentIndex(nextSegIdx);
    setShowDetailedExplanation(false);
  };

  const goToPreviousSegment = () => {
    let prevSegIdx = currentSegmentIndex - 1;
    let prevPageIdx = currentPageIndex;

    if (prevSegIdx < 0) {
      if (currentPageIndex > 0) {
        prevPageIdx = currentPageIndex - 1;
        prevSegIdx = chapterData.sections[prevPageIdx].content.length - 1;
      } else {
        return;
      }
    }

    // Skip ALL consecutive subheadings going backwards
    while (chapterData?.sections?.[prevPageIdx]?.content?.[prevSegIdx]?.type === 'subheading') {
      prevSegIdx -= 1;
      if (prevSegIdx < 0) {
        if (prevPageIdx > 0) {
          prevPageIdx -= 1;
          prevSegIdx = chapterData.sections[prevPageIdx].content.length - 1;
        } else {
          prevSegIdx = 0;
          break;
        }
      }
    }

    if (prevPageIdx !== currentPageIndex) setCurrentPageIndex(prevPageIdx);
    setCurrentSegmentIndex(prevSegIdx);
    setShowDetailedExplanation(false);
  };

  return {
    currentSection,
    segmentStartTime,
    isLastSegment,
    goToNextSegment,
    goToPreviousSegment,
    saveProgress,
  };
};

export default useSegmentNavigation;