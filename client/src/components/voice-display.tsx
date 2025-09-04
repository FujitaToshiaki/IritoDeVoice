import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Trash2, X } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";

interface VoiceEntry {
  id: string;
  timestamp: Date;
  transcript: string;
  confidence?: number;
}

interface VoiceDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceDisplay({ isOpen, onClose }: VoiceDisplayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [voiceHistory, setVoiceHistory] = useState<VoiceEntry[]>([]);
  const [confidence, setConfidence] = useState<number>(0);

  const { startRecognition, stopRecognition, isSupported } = useVoiceRecognition({
    onResult: (transcript, confidenceScore) => {
      setCurrentTranscript(transcript);
      setConfidence(confidenceScore || 0);
    },
    onEnd: () => {
      if (currentTranscript.trim()) {
        const newEntry: VoiceEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          transcript: currentTranscript.trim(),
          confidence: confidence
        };
        setVoiceHistory(prev => [newEntry, ...prev]);
      }
      setCurrentTranscript("");
      setConfidence(0);
      setIsRecording(false);
    },
    onError: (error) => {
      console.error("音声認識エラー:", error);
      setIsRecording(false);
      setCurrentTranscript("");
    }
  });

  const handleStartRecording = () => {
    if (!isSupported) {
      alert("お使いのブラウザは音声認識に対応していません。");
      return;
    }
    setCurrentTranscript("");
    setConfidence(0);
    setIsRecording(true);
    startRecognition();
  };

  const handleStopRecording = () => {
    stopRecognition();
    setIsRecording(false);
  };

  const clearHistory = () => {
    setVoiceHistory([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-100";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" data-testid="voice-modal-overlay">
      <Card className="bg-white rounded-3xl p-6 shadow-xl border-0 max-w-sm w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" data-testid="voice-display">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900" data-testid="voice-display-title">
            音声入力・表示
          </h3>
          <div className="flex items-center space-x-2">
            {voiceHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-gray-500 hover:text-red-600"
                data-testid="clear-history-button"
              >
                <Trash2 size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              data-testid="close-modal-button"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

      {/* 音声入力コントロール */}
      <div className="flex items-center justify-center mb-6">
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-gradient-to-r from-purple-600 to-blue-500 hover:scale-105"
          }`}
          data-testid="voice-control-button"
        >
          {isRecording ? (
            <MicOff className="text-white text-2xl" />
          ) : (
            <Mic className="text-white text-2xl" />
          )}
        </Button>
      </div>

      {/* リアルタイム音声認識表示 */}
      {isRecording && (
        <Card className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6" data-testid="realtime-transcript">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">音声認識中...</span>
            </div>
            {confidence > 0 && (
              <Badge className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(confidence)}`} data-testid="confidence-badge">
                信頼度: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
          <div className="text-gray-900 text-base min-h-[2rem]" data-testid="current-transcript">
            {currentTranscript || "音声を話してください..."}
          </div>
        </Card>
      )}

      {/* 音声入力履歴 */}
      <div className="flex-1 overflow-hidden flex flex-col" data-testid="voice-history">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-800">入力履歴</h4>
          <Badge variant="secondary" className="text-xs" data-testid="history-count">
            {voiceHistory.length}件
          </Badge>
        </div>
        
        {voiceHistory.length === 0 ? (
          <div className="text-center py-6 text-gray-400 flex-1 flex flex-col justify-center" data-testid="no-history">
            <Volume2 className="mx-auto mb-2 text-gray-300" size={28} />
            <p className="text-sm">まだ音声入力がありません</p>
            <p className="text-xs">マイクボタンを押して話してみてください</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3" data-testid="history-list">
            {voiceHistory.map((entry, index) => (
              <Card key={entry.id} className="bg-gray-50 border-0 rounded-2xl p-3" data-testid={`history-item-${index}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium" data-testid={`history-time-${index}`}>
                    {formatTime(entry.timestamp)}
                  </span>
                  {entry.confidence && entry.confidence > 0 && (
                    <Badge 
                      className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(entry.confidence)}`}
                      data-testid={`history-confidence-${index}`}
                    >
                      {Math.round(entry.confidence * 100)}%
                    </Badge>
                  )}
                </div>
                <p className="text-gray-900 text-sm leading-relaxed" data-testid={`history-transcript-${index}`}>
                  {entry.transcript}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!isSupported && (
        <div className="text-center py-4 text-red-600" data-testid="unsupported-message">
          お使いのブラウザは音声認識に対応していません
        </div>
      )}
      </Card>
    </div>
  );
}