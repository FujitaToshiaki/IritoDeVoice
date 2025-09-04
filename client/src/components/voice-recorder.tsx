import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onEnd: () => void;
}

export default function VoiceRecorder({ isRecording, onStart, onEnd }: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState("");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const processVoiceCommandMutation = useMutation({
    mutationFn: async (data: { transcript: string; userId: string }) => {
      const response = await apiRequest("POST", "/api/voice-command", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.interpretation?.success && data.result) {
        toast({
          title: "音声コマンド実行完了",
          description: data.result.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      } else {
        toast({
          title: "音声コマンドエラー",
          description: data.interpretation?.message || "音声コマンドを理解できませんでした",
          variant: "destructive",
        });
      }
      handleStop();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "音声コマンドの処理中にエラーが発生しました",
        variant: "destructive",
      });
      handleStop();
    },
  });

  const { startRecognition, stopRecognition, isSupported } = useVoiceRecognition({
    onResult: (result) => {
      setTranscript(result);
    },
    onEnd: () => {
      if (transcript.trim()) {
        processVoiceCommandMutation.mutate({
          transcript: transcript.trim(),
          userId: "current_user"
        });
      } else {
        handleStop();
      }
    },
    onError: (error) => {
      console.error("Voice recognition error:", error);
      toast({
        title: "音声認識エラー",
        description: "音声を認識できませんでした。もう一度お試しください。",
        variant: "destructive",
      });
      handleStop();
    },
    continuous: true,
  });

  const handleStart = () => {
    if (!isSupported) {
      toast({
        title: "音声認識未対応",
        description: "お使いのブラウザは音声認識に対応していません。",
        variant: "destructive",
      });
      return;
    }

    setTranscript("");
    setIsOverlayOpen(true);
    onStart();
    startRecognition();
  };

  const handleStop = () => {
    stopRecognition();
    setIsOverlayOpen(false);
    onEnd();
    setTranscript("");
  };

  if (!isOverlayOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" data-testid="voice-overlay">
      <Card className="bg-white rounded-3xl p-8 mx-4 text-center max-w-sm w-full">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto voice-recording">
            <Mic className="text-white text-2xl" />
          </div>
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-primary voice-pulse mx-auto w-20 h-20"></div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-card-foreground mb-2" data-testid="voice-title">
          {processVoiceCommandMutation.isPending ? "処理中..." : "音声認識中..."}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4" data-testid="voice-instruction">
          商品の操作を音声で指示してください
        </p>
        
        <Card className="bg-gray-100 border-none rounded-xl p-3 mb-4">
          <p className="text-sm text-card-foreground" data-testid="voice-transcript">
            {transcript || "聞き取り中..."}
          </p>
        </Card>
        
        <Button 
          onClick={handleStop} 
          className="w-full bg-primary text-white py-3 rounded-xl font-medium"
          disabled={processVoiceCommandMutation.isPending}
          data-testid="voice-stop-button"
        >
          {processVoiceCommandMutation.isPending ? "処理中..." : "停止"}
        </Button>
      </Card>
    </div>
  );
}
