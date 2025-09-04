import { PackageIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceDisplay from "@/components/voice-display";
import { Link } from "wouter";

export default function VoiceInput() {
  return (
    <div className="max-w-md mx-auto gradient-bg min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-16 text-white" data-testid="voice-header">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 text-white hover:bg-white/30"
              data-testid="back-button"
            >
              <ArrowLeft className="text-xl" />
            </Button>
          </Link>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <PackageIcon className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="page-title">音声入力</h1>
            <p className="text-sm opacity-90" data-testid="page-subtitle">リアルタイム音声認識</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <VoiceDisplay />
      </div>
    </div>
  );
}