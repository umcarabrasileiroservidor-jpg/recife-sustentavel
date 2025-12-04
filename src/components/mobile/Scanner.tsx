import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Camera, CheckCircle2, QrCode, Loader2, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { checkTimeLimit } from '../../utils/timeUtils';
import { QrScannerComponent } from './QrScannerComponent';
import { useUser } from '../../contexts/UserContext';
import { registrarDescarte } from '../../services/dataService';

// --- FUNÇÃO DE COMPRESSÃO DE IMAGEM ---
// Reduz a qualidade para garantir que o upload funcione no 4G/Serverless
const compressImage = (base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str); // Fallback se der erro
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

interface ScannerProps {
  onNavigate: (screen: string) => void;
}

type Step = 'intro' | 'scan_qr' | 'take_photo' | 'sending' | 'success';

export function Scanner({ onNavigate }: ScannerProps) {
  const { user } = useUser();
  const [step, setStep] = useState<Step>('intro');
  const [binData, setBinData] = useState<{id: string, type: string} | null>(null);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (user?.ultimo_descarte) {
      const { allowed, timeLeft } = checkTimeLimit(new Date(user.ultimo_descarte).getTime());
      if (!allowed) {
        toast.error(`Limite diário atingido! Volte em ${timeLeft}.`);
        onNavigate('home');
      }
    }
  }, [user]);

  const handleScanSuccess = (decodedText: string) => {
    const parts = decodedText.split(':');
    let type = parts.length > 1 ? parts[1].trim() : 'GERAL';
    let id = parts[0].trim();
    type = type.toUpperCase();

    let colorMsg = 'Identificado!';
    if (type.includes('PLASTICO')) colorMsg = '🔴 Lixeira Vermelha (Plástico)';
    if (type.includes('PAPEL')) colorMsg = '🔵 Lixeira Azul (Papel)';
    if (type.includes('VIDRO')) colorMsg = '🟢 Lixeira Verde (Vidro)';
    if (type.includes('METAL')) colorMsg = '🟡 Lixeira Amarela (Metal)';
    if (type.includes('ORGANICO')) colorMsg = '🟤 Lixeira Marrom (Orgânico)';

    setBinData({ id, type });
    toast.success(colorMsg);
    setStep('take_photo');
  };

  const handleSendPhoto = async () => {
    if (!webcamRef.current || !binData) return;
    
    try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            toast.error("Erro na câmera.");
            return;
        }

        setStep('sending');

        // 1. Comprime a imagem antes de enviar (CRUCIAL PARA MOBILE)
        const compressedImage = await compressImage(imageSrc);

        // 2. Envia
        const res = await registrarDescarte(binData.type, 1, compressedImage);
        
        if (res.success) {
            setStep('success');
        } else {
            throw new Error(res.msg || "Falha no envio");
        }
    } catch (error: any) {
        console.error(error);
        toast.error("Erro ao enviar foto. Verifique sua conexão.");
        setStep('take_photo');
    }
  };

  const getProgress = () => {
    switch(step) {
      case 'intro': return 0;
      case 'scan_qr': return 33;
      case 'take_photo': return 66;
      case 'success': return 100;
      default: return 50;
    }
  };

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Header Fixo */}
      <div className="bg-white border-b border-gray-100 p-4 pt-safe-top flex items-center justify-between z-10 shadow-sm shrink-0">
        <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex flex-col items-end">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Novo Descarte</span>
           <div className="flex gap-1 mt-1">
             {[0, 33, 66, 100].map(val => (
                <div key={val} className={`h-1.5 w-6 rounded-full transition-colors ${getProgress() >= val ? 'bg-[#2E8B57]' : 'bg-gray-200'}`} />
             ))}
           </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* 0. INTRO */}
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-16 h-16 text-[#2E8B57]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Como funciona?</h2>
                  <p className="text-gray-500 px-4">Garanta seus pontos em 2 etapas:</p>
                </div>
                <div className="space-y-4 text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-4"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 font-bold text-[#2E8B57]">1</div><div><h4 className="font-bold text-gray-800">Identifique</h4><p className="text-sm text-gray-500">Escaneie o QR Code da lixeira.</p></div></div>
                  <div className="w-0.5 h-6 bg-gray-200 ml-4" />
                  <div className="flex gap-4"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 font-bold text-[#2E8B57]">2</div><div><h4 className="font-bold text-gray-800">Fotografe</h4><p className="text-sm text-gray-500">Tire uma foto do lixo.</p></div></div>
                </div>
                <Button className="w-full h-14 text-lg rounded-xl shadow-lg font-bold" style={{ backgroundColor: '#2E8B57', color: 'white' }} onClick={() => setStep('scan_qr')}>Começar Agora</Button>
              </div>
            </motion.div>
          )}

          {/* 1. SCANNER */}
          {step === 'scan_qr' && (
            <motion.div key="scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col items-center justify-center gap-6">
               <div className="text-center"><h2 className="text-xl font-bold text-gray-800">Passo 1 de 2</h2><p className="text-gray-500">Aponte para o código na lixeira</p></div>
               <div className="relative w-full max-w-xs aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-gray-100">
                  <QrScannerComponent onScanSuccess={handleScanSuccess} scanRegionId="qr-reader-box" />
                  <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none"><div className="w-full h-1 bg-red-500 absolute top-1/2 left-0 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" /></div>
               </div>
            </motion.div>
          )}

          {/* 2. FOTO */}
          {step === 'take_photo' && binData && (
            <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center w-full h-full">
               <div className="text-center mb-4"><div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-[#2E8B57] rounded-full text-sm font-bold mb-2"><CheckCircle2 className="w-4 h-4" /> Lixeira de {binData.type}</div><h2 className="text-xl font-bold text-gray-800">Tire a Foto</h2></div>
               <div className="relative w-full max-w-sm flex-1 bg-black rounded-3xl overflow-hidden shadow-xl mb-6">
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full h-full object-cover" />
               </div>
               <div className="w-full px-6 pb-4">
                 <button onClick={handleSendPhoto} className="w-full h-16 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform" style={{ backgroundColor: '#2E8B57' }}>
                    <Camera className="w-6 h-6" /> Enviar Foto
                 </button>
                 <button onClick={() => setStep('scan_qr')} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 py-2">Escanear outra lixeira</button>
               </div>
            </motion.div>
          )}

          {/* 3. SENDING */}
          {step === 'sending' && (
            <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-16 h-16 text-[#2E8B57] animate-spin mx-auto mb-4" />
              <h3 className="mt-8 text-xl font-bold text-gray-800">Enviando...</h3>
              <p className="text-gray-500 mt-2">Comprimindo e salvando foto.</p>
            </motion.div>
          )}

          {/* 4. SUCCESS */}
          {step === 'success' && (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce"><Info className="w-12 h-12 text-amber-600" /></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Enviado para Análise!</h2>
              <Card className="bg-white border-amber-100 shadow-sm mb-8 w-full"><CardContent className="p-4 text-left"><p className="text-gray-600 text-sm leading-relaxed">Foto recebida com sucesso! 📸<br/>Um administrador irá validar em breve.</p><div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100"><AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /><p className="text-xs text-amber-700 font-medium">Pontos liberados após aprovação.</p></div></CardContent></Card>
              <Button className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold shadow-lg" onClick={() => onNavigate('home')}>Voltar ao Início</Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}