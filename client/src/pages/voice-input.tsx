import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Home, Volume2 } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function VoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if browser supports Web Speech API
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const voiceCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch('/api/voice-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, timestamp: new Date().toISOString() })
      });
      if (!response.ok) throw new Error('Failed to process voice command');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "音声コマンド実行成功",
        description: data.message || "コマンドが正常に処理されました",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "音声コマンドの処理に失敗しました",
        variant: "destructive",
      });
    }
  });

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "非対応",
        description: "このブラウザは音声認識に対応していません",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setConfidence(0);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
          setConfidence(event.results[i][0].confidence);
        } else {
          interimTranscript += transcriptPart;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        voiceCommandMutation.mutate(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast({
        title: "音声認識エラー",
        description: "音声の認識に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div className="max-w-md mx-auto gradient-bg min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-16 text-white" data-testid="header">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="back-button">
              <Home className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" data-testid="page-title">音声入力</h1>
            <p className="text-sm opacity-90" data-testid="page-subtitle">音声でアイテムを管理</p>
          </div>
        </div>
      </header>

      {/* Voice Input Area */}
      <div className="px-6 py-8 space-y-6">
        {/* Voice Status Card */}
        <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl" data-testid="voice-status-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-white/30'
              }`} data-testid="voice-indicator">
                {isListening ? (
                  <Volume2 className="text-white text-3xl" />
                ) : (
                  <Mic className="text-white text-3xl" />
                )}
              </div>
              
              <div className="text-white">
                <h3 className="text-lg font-semibold" data-testid="voice-status-title">
                  {isListening ? "聞いています..." : "音声入力待機中"}
                </h3>
                <p className="text-sm opacity-80" data-testid="voice-status-description">
                  {isListening ? "話してください" : "ボタンを押して話してください"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcript Display */}
        {transcript && (
          <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl" data-testid="transcript-card">
            <CardContent className="p-6">
              <h4 className="text-white font-semibold mb-3" data-testid="transcript-label">認識したテキスト:</h4>
              <p className="text-white text-lg" data-testid="transcript-text">{transcript}</p>
              {confidence > 0 && (
                <p className="text-white/70 text-sm mt-2" data-testid="confidence-score">
                  信頼度: {Math.round(confidence * 100)}%
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Voice Control Button */}
        <div className="text-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported || voiceCommandMutation.isPending}
            className={`w-24 h-24 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'
            } shadow-xl transform hover:scale-105 transition-all duration-200`}
            data-testid="voice-toggle-button"
          >
            {isListening ? (
              <MicOff className="text-white text-3xl" />
            ) : (
              <Mic className="text-white text-3xl" />
            )}
          </Button>
        </div>

        {/* Help Section */}
        <Card className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl" data-testid="help-card">
          <CardContent className="p-6">
            <h4 className="text-white font-semibold mb-3" data-testid="help-title">音声コマンド例:</h4>
            <div className="space-y-2 text-white/90 text-sm" data-testid="help-examples">
              <p>• "りんごを10個追加して"</p>
              <p>• "牛乳の在庫を確認して"</p>
              <p>• "パンの数量を5個に変更して"</p>
              <p>• "低在庫アイテムを表示して"</p>
            </div>
          </CardContent>
        </Card>

        {!isSupported && (
          <Card className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-3xl" data-testid="unsupported-card">
            <CardContent className="p-6">
              <p className="text-white text-center" data-testid="unsupported-message">
                このブラウザは音声認識に対応していません。Chrome、Edge、またはSafariをお使いください。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}