import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowLeft, Camera, CheckCircle, XCircle, Loader2, QrCode, RefreshCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { validateTrashImage } from '../../utils/aiValidator';
import { checkTimeLimit } from '../../utils/timeUtils';
import { QrScannerComponent } from './QrScannerComponent';
import { useUser } from '../../contexts/UserContext';
import { registrarDescarte } from '../../services/dataService';

interface ScannerProps {
  onNavigate: (screen: string) => void;
}

type Step = 'scan_qr' | 'take_photo' | 'analyzing' | 'result';

export function Scanner({ onNavigate }: ScannerProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState<Step>('scan_qr');
  const [binData, setBinData] = useState<{id: string, type: string} | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);

  // Verificação Inicial
  useEffect(() => {
    const userStr = localStorage.getItem('recife_sustentavel_current_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const { allowed, timeLeft } = checkTimeLimit(user.lastDisposalTime || null);

      if (!allowed) {
        toast.error(`Limite diário atingido! Volte em ${timeLeft}.`);
        onNavigate('home');
      }
    }
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    const type = decodedText.includes(':') ? decodedText.split(':')[1].trim() : 'LIXO GERAL';
    const id = decodedText.includes(':') ? decodedText.split(':')[0].trim() : 'REC-TEST';
    
    setBinData({ id, type });
    toast.success(`Lixeira identificada: ${type}`);
    setTimeout(() => setStep('take_photo'), 500);
  };

  const capturePhoto = async () => {
    if (!webcamRef.current || !binData) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Erro na captura. Tente novamente.");
      return;
    }

    setStep('analyzing');
    const result = await validateTrashImage(imageSrc, binData.type);
    setAnalysis(result);
    setStep('result');

    if (result.approved) {
      handleSave(result.points_multiplier);
    }
  };

  const handleSave = async (multiplier: number) => {
    setSaving(true);
    const res = await registrarDescarte(binData?.type || 'GERAL', multiplier);
    if (res.success) {
      toast.success(`+${res.points} Capivaras! Saldo atualizado.`);
      await refreshUser();
    } else {
      toast.error(res.msg);
    }
    setSaving(false);
  };

  return (
    // Z-Index 9999 garante que fique SOBRE todo o resto do app
    <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col">
      
      {/* Header */}
      <div className="absolute top-0 w-full p-6 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-50">
        <button 
          className="p-3 bg-zinc-800 rounded-full text-white hover:bg-zinc-700" 
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-sm uppercase tracking-widest text-zinc-300">
          {step === 'scan_qr' ? '1. QR Code' : step === 'take_photo' ? '2. Foto' : 'Análise'}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          
          {/* 1. QR CODE */}
          {step === 'scan_qr' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center gap-8">
              <h2 className="text-2xl font-bold text-center text-white">Escaneie o QR Code</h2>
              <div className="relative w-full max-w-[320px] aspect-square border-4 border-green-500 rounded-3xl overflow-hidden bg-black">
                <QrScannerComponent onScanSuccess={handleScanSuccess} scanRegionId="qr-reader-box" />
              </div>
              <p className="text-zinc-400 text-center px-4">Aponte para o adesivo na lixeira.</p>
            </motion.div>
          )}

          {/* 2. FOTO */}
          {step === 'take_photo' && binData && (
            <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center h-full justify-center">
              <div className="w-full max-w-sm aspect-[3/4] relative rounded-3xl overflow-hidden border-2 border-zinc-700 bg-zinc-900 mb-8">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full bg-black/70 p-4 text-center">
                  <p className="font-bold text-green-400 text-lg uppercase">{binData.type}</p>
                </div>
              </div>
              <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white border-4 border-zinc-300 shadow-xl active:scale-95 transition-transform" />
            </motion.div>
          )}

          {/* 3. ANALISANDO */}
          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Analisando...</h2>
              <p className="text-zinc-400">Validando material e volume.</p>
            </motion.div>
          )}

          {/* 4. RESULTADO (CORRIGIDO: CORES ESCURAS FORÇADAS) */}
          {step === 'result' && analysis && (
            <motion.div key="result" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl p-8 text-center shadow-2xl">
              {analysis.approved ? (
                <>
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Aprovado!</h2>
                  <p className="text-zinc-300 text-sm mb-6">{analysis.reason}</p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-xl font-bold" onClick={() => onNavigate('home')}>
                    {saving ? 'Salvando...' : 'Resgatar Pontos'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Recusado</h2>
                  
                  {/* Caixa de erro com contraste alto */}
                  <div className="bg-red-950/50 border border-red-900 p-4 rounded-xl mb-8">
                    <p className="text-red-200 text-sm font-medium leading-relaxed">
                      {analysis.reason || "Erro desconhecido na validação."}
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full h-14 text-lg rounded-xl border-zinc-600 text-white hover:bg-zinc-800" onClick={() => setStep('take_photo')}>
                    Tentar Novamente
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}