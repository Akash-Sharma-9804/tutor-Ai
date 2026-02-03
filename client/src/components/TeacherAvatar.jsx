import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect, useRef } from "react";

export default function TeacherAvatar({ isSpeaking, audioRef }) {

    const { rive, RiveComponent } = useRive({
        src: "/4532-9211-character-face-animation.riv",
        stateMachines: "State Machine 1",
        autoplay: true,
    });

    const talkInput = useStateMachineInput(
        rive,
        "State Machine 1",
        "isTalking"
    );

    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrame = useRef(null);

   useEffect(() => {
  if (!audioRef?.current || !talkInput) return;

  const audio = audioRef.current;

  // 🟢 FORCE resume when TTS starts
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }

  const resumeContext = async () => {
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
  };

  resumeContext();

  // 🟢 Re-create analyser EVERY new audio
  analyserRef.current = audioCtxRef.current.createAnalyser();
  analyserRef.current.fftSize = 256;      // more sensitive

  try {
    const source = audioCtxRef.current.createMediaElementSource(audio);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioCtxRef.current.destination);
  } catch (err) {
    console.log("Audio already attached");
  }


        const data = new Uint8Array(analyserRef.current.frequencyBinCount);

        const update = () => {

            // 🔥 PRIORITY 1 – Follow TTS speaking flag
            // ALWAYS use real audio volume — never force true
            analyserRef.current.getByteFrequencyData(data);

          const volume = data.reduce((a, b) => a + b, 0) / data.length;

// 🟢 Much better for Deepgram voice
const threshold = 1.2;

// 🟢 Fallback to isSpeaking if analyser silent
if (volume > threshold) {
  talkInput.fire();
}




            animationFrame.current = requestAnimationFrame(update);
        };

        update();

        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };

    }, [audioRef, rive, isSpeaking, talkInput]);

    return (
        <div className="w-full h-full">
            <RiveComponent />
        </div>
    );
}
