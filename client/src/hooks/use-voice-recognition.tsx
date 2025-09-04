import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecognitionProps {
  onResult: (transcript: string, confidence?: number) => void;
  onEnd: () => void;
  onError: (error: string) => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useVoiceRecognition({
  onResult,
  onEnd,
  onError,
  lang = 'ja-JP',
  continuous = false,
  interimResults = true,
}: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startRecognition = useCallback(() => {
    if (!isSupported) {
      onError('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
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

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, isListening, lang, continuous, interimResults, onResult, onEnd, onError]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startRecognition,
    stopRecognition,
  };
}
