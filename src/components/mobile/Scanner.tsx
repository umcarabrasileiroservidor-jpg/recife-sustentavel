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

type Screen = 'home' | 'scanner' | 'history' | 'wallet' | 'rewards' | 'penalties' | 'map' | 'profile';

interface ScannerProps {
  onNavigate: (screen: Screen) => void;
}

type Step = 'scan_qr' | 'take_photo' | 'analyzing' | 'result';

export function Scanner({ onNavigate }: ScannerProps) {
  const { refreshUser } = useUser();
  const [step, setStep] = useState<Step>('scan_qr');
  const [binData, setBinData] = useState<{id: string, type: string} | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null); // Estado para guardar a foto
  
  const webcamRef = useRef<Webcam>(null);

  // Verificação Inicial
  useEffect(() => {
    const userStr = localStorage.getItem('recife_sustentavel_session');
    if (userStr) {
      const session = JSON.parse(userStr);
      // Verifica ultimo_descarte do Neon
      const { allowed, timeLeft } = checkTimeLimit(session.user.ultimo_descarte ? new Date(session.user.ultimo_descarte).getTime() : null);

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
    if (!imageSrc) return toast.error("Erro na câmera");

    setCurrentImage(imageSrc); // Guarda a imagem para enviar depois
    setStep('analyzing');
    
    const result = await validateTrashImage(imageSrc, binData.type);
    setAnalysis(result);
    setStep('result');

    if (result.approved) {
      // Passa a imagem guardada para a função de salvar
      handleSave(result.points_multiplier, imageSrc);
    }
  };

  const handleSave = async (multiplier: number, imageSrc: string) => {
    setSaving(true);
    // Enviar payload correto para API: tipo_residuo, imageBase64, multiplicador_volume
    const res = await registrarDescarte({ 
      tipo_residuo: binData?.type || 'GERAL', 
      imageBase64: imageSrc, 
      multiplicador_volume: multiplier 
    });
    
    if (res.success) {
      toast.success(`+${res.points} Capivaras! Saldo atualizado.`);
      await refreshUser();
      setStep('result'); // Mantém na tela de resultado por um momento
    } else {
      toast.error(res.msg || 'Erro ao processar descarte');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col">
      {/* ... (O restante do JSX de renderização permanece IGUAL ao anterior, só a lógica acima mudou) ... */}
      {/* Vou repetir o JSX para garantir que você tenha o arquivo completo sem erros */}
      
      <div className="absolute top-0 w-full p-4 flex items-center justify-between bg-black/80 z-50">
        <button onClick={() => onNavigate('home')} className="p-2 bg-zinc-800 rounded-full">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="font-bold text-zinc-300">
          {step === 'scan_qr' ? '1. QR Code' : step === 'take_photo' ? '2. Foto' : 'Análise'}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 'scan_qr' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4">Leia o QR Code</h2>
              <div className="w-[300px] h-[300px] rounded-3xl overflow-hidden border-4 border-green-500 relative bg-black">
                <QrScannerComponent onScanSuccess={handleScanSuccess} scanRegionId="qr-box" />
              </div>
            </motion.div>
          )}

          {step === 'take_photo' && (
            <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-sm aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden border-2 border-zinc-700">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full bg-black/60 p-4 text-center">
                  <p className="text-green-400 font-bold">{binData?.type}</p>
                  <p className="text-xs text-white">Tire foto do lixo</p>
                </div>
              </div>
              <button onClick={capturePhoto} className="mt-6 w-20 h-20 bg-white rounded-full border-4 border-zinc-400" />
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">IA Analisando...</h2>
            </motion.div>
          )}

          {step === 'result' && analysis && (
            <motion.div key="result" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-sm p-6 rounded-3xl shadow-2xl text-center" style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
              {analysis.approved ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Aprovado!</h2>
                  <p className="text-zinc-400 mb-6">{analysis.reason}</p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl" onClick={() => onNavigate('home')}>
                    {saving ? 'Salvando...' : 'Concluir'}
                  </Button>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Recusado</h2>
                  <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p className="text-red-200 text-sm font-medium">{analysis.reason}</p>
                  </div>
                  <Button variant="outline" className="w-full h-12 text-white border-zinc-600 hover:bg-zinc-800" onClick={() => setStep('take_photo')}>
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