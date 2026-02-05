import { motion, AnimatePresence } from "framer-motion";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

const WhiteboardPanel = ({
  currentSegment,
  isReading,
  teacherBoardWords,
  teacherBoardHighlightIndex,
  activeEquationStep,
  equationStepChars,
  activeStepUnderline,
  explanationWords
}) => {
  
  const renderTeacherBoardContent = () => {
    if (!currentSegment) return null;

    if (currentSegment.type === "text" && currentSegment.example) {
      return (
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed space-y-4">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-3 text-lg">
            📝 Example:
          </div>
          {teacherBoardWords.map((word, idx) => (
            <span
              key={idx}
              className={`inline-block mr-2 transition-all duration-200 ${
                teacherBoardHighlightIndex === idx
                  ? "text-green-600 dark:text-green-400 font-bold scale-110 bg-yellow-200 dark:bg-yellow-900 px-1 rounded"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      );
    }

    if (currentSegment.type === "equation") {
      const eq = currentSegment;
      return (
        <div className="space-y-8 text-gray-800 dark:text-gray-200">
          {/* Problem statement */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border-l-4 border-blue-500 shadow-sm">
            <div className="font-bold text-blue-700 dark:text-blue-300 mb-3 text-lg flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Problem:
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-lg font-medium bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <BlockMath math={eq.problem} />
            </div>
          </div>

          {/* Detailed Steps */}
          <div className="space-y-6">
            <div className="font-bold text-purple-700 dark:text-purple-300 text-xl flex items-center gap-2 pb-2 border-b-2 border-purple-300 dark:border-purple-700">
              <span className="text-2xl">📚</span>
              Solution Steps:
            </div>

            {eq.steps.map((step, idx) => {
              const isActive = idx === activeEquationStep;
              const isPast = idx < activeEquationStep;
              const revealedChars = equationStepChars[idx] || 0;
              const showUnderline = activeStepUnderline === idx;

              // Split explanation into words for progressive reveal
              const explanationWordsList = step.explanation?.split(/\s+/) || [];
              const revealedExplanationWords = explanationWords[idx] || 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-400 dark:border-green-600 shadow-lg scale-[1.02]"
                      : isPast
                      ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                      : "bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 opacity-60"
                  }`}
                >
                  {/* Step number badge */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        isActive
                          ? "bg-green-500 text-white shadow-md"
                          : isPast
                          ? "bg-gray-400 dark:bg-gray-600 text-white"
                          : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 space-y-3">
                      {/* Step title */}
                      <div className={`font-semibold text-base ${
                        isActive 
                          ? "text-green-700 dark:text-green-300" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {step.step}
                      </div>

                      {/* Formula with typing effect and underline */}
                      <div className={`bg-white dark:bg-gray-900 p-4 rounded-lg shadow-inner overflow-x-auto ${
                        showUnderline ? "underline-animation" : ""
                      }`}>
                        <BlockMath
                          math={
                            isActive && !isPast
                              ? step.formula.substring(0, revealedChars) + (revealedChars < step.formula.length ? "|" : "")
                              : step.formula
                          }
                        />
                      </div>

                      {/* Progressive explanation reveal */}
                      {step.explanation && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">💡 </span>
                          {explanationWordsList.map((word, wordIdx) => {
                            const shouldShow = wordIdx < revealedExplanationWords || !isActive;
                            return (
                              <span
                                key={wordIdx}
                                className={`inline-block mr-1 transition-all duration-200 ${
                                  shouldShow ? "opacity-100" : "opacity-0"
                                }`}
                                style={{
                                  transitionDelay: !isActive ? "0ms" : `${wordIdx * 50}ms`
                                }}
                              >
                                {word}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Final Result */}
          <AnimatePresence>
            {activeEquationStep >= eq.steps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 p-6 rounded-xl border-2 border-amber-400 dark:border-amber-600 shadow-xl"
              >
                <div className="font-bold text-amber-700 dark:text-amber-300 mb-4 text-xl flex items-center gap-2">
                  <span className="text-3xl">🎉</span>
                  Final Answer:
                </div>
                <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-lg">
                  <BlockMath math={eq.result} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
      <AnimatePresence mode="wait">
        {isReading && (
          <motion.div
            key="whiteboard-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="whiteboard-content"
          >
            {renderTeacherBoardContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {!isReading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400 dark:text-gray-600 space-y-3">
            <div className="text-6xl">📚</div>
            <p className="text-lg font-medium">Whiteboard</p>
            <p className="text-sm">Content will appear here when reading</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhiteboardPanel;