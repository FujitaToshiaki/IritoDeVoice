import { useState, useRef, useCallback } from 'react';

// Minimal type declarations for speech recognition
type SpeechRecognition = any;
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceRecognitionProps {
  onResult: (transcript: string, confidence?: number) => void;
  onEnd: () => void;
  onError: (error: string) => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  silenceDuration?: number; // milliseconds of silence before auto-stop
  volumeThreshold?: number; // threshold for detecting sound
}

export function useVoiceRecognition({
  onResult,
  onEnd,
  onError,
  lang = 'ja-JP',
  continuous = true,
  interimResults = true,
  silenceDuration = 5000,
  volumeThreshold = 0.01,
}: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const stopRequestedRef = useRef(false);

  // Check if speech recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const stopRecognition = useCallback(() => {
    stopRequestedRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const startRecognition = useCallback(async () => {
    if (!isSupported) {
      onError('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const checkSilence = () => {
        if (!analyserRef.current) return;
        const buffer = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sum / buffer.length);

        if (rms < volumeThreshold) {
          if (silenceStartRef.current === null) {
            silenceStartRef.current = performance.now();
          } else if (performance.now() - silenceStartRef.current > silenceDuration) {
            stopRecognition();
            return;
          }
        } else {
          silenceStartRef.current = null;
        }
        rafRef.current = requestAnimationFrame(checkSilence);
      };

      rafRef.current = requestAnimationFrame(checkSilence);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onstart = () => {
        stopRequestedRef.current = false;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let latestConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            latestConfidence = confidence;
          } else {
            interimTranscript += transcript;
            latestConfidence = confidence;
          }
        }

        const currentTranscript = finalTranscript + interimTranscript;
        onResult(currentTranscript, latestConfidence);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopRecognition();
        setIsListening(false);
        onError(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        if (!stopRequestedRef.current) {
          recognition.start();
        } else {
          setIsListening(false);
          onEnd();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      onError('マイクへのアクセスに失敗しました');
    }
  }, [isSupported, isListening, lang, interimResults, onResult, onEnd, onError, silenceDuration, volumeThreshold, stopRecognition]);

  return {
    isListening,
    isSupported,
    startRecognition,
    stopRecognition,
  };
}
