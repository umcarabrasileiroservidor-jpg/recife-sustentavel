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
    // Padrão esperado: ID:TIPO
    // Ex: REC-PLASTICO:PLASTICO
    const parts = decodedText.split(':');
    
    // Se não tiver :, tenta adivinhar ou usa Geral
    let type = parts.length > 1 ? parts[1].trim() : 'GERAL';
    let id = parts[0].trim();

    // Normaliza para maiúsculas para ficar bonito
    type = type.toUpperCase();

    // Define a cor baseada no tipo (para feedback visual)
    let colorClass = 'text-gray-500';
    if (type === 'PLASTICO') colorClass = 'text-red-500';
    if (type === 'PAPEL') colorClass = 'text-blue-500';
    if (type === 'METAL') colorClass = 'text-yellow-500';
    if (type === 'VIDRO') colorClass = 'text-green-500';
    if (type === 'ORGANICO') colorClass = 'text-amber-800'; // Marrom

    setBinData({ id, type });
    
    // Toast personalizado com a cor
    toast.success(`Lixeira de ${type} identificada!`, {
      style: { color: type === 'PLASTICO' ? 'red' : 'green' } // Exemplo simples
    });
    
    setStep('take_photo');
  };

  const handleSendPhoto = async () => {
    if (!webcamRef.current || !binData) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Erro na câmera.");
      return;
    }

    setStep('sending');

    const res = await registrarDescarte(binData.type, 1, imageSrc);
    
    if (res.success) {
      setStep('success');
    } else {
      toast.error("Falha no envio. Tente novamente.");
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
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 pt-6 flex items-center justify-between z-10 shadow-sm">
        <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex flex-col items-end">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Novo Descarte</span>
           <div className="flex gap-1 mt-1">
             <div className={`h-1.5 w-6 rounded-full transition-colors ${getProgress() >= 0 ? 'bg-[#2E8B57]' : 'bg-gray-200'}`} />
             <div className={`h-1.5 w-6 rounded-full transition-colors ${getProgress() >= 33 ? 'bg-[#2E8B57]' : 'bg-gray-200'}`} />
             <div className={`h-1.5 w-6 rounded-full transition-colors ${getProgress() >= 66 ? 'bg-[#2E8B57]' : 'bg-gray-200'}`} />
             <div className={`h-1.5 w-6 rounded-full transition-colors ${getProgress() >= 100 ? 'bg-[#2E8B57]' : 'bg-gray-200'}`} />
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* 0. INTRODUÇÃO - BOTÃO CORRIGIDO AQUI */}
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-16 h-16 text-[#2E8B57]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Como funciona?</h2>
                  <p className="text-gray-500 px-4">Para garantir a qualidade da reciclagem, nosso processo tem 2 etapas simples:</p>
                </div>

                <div className="space-y-4 text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 font-bold text-[#2E8B57]">1</div>
                    <div>
                      <h4 className="font-bold text-gray-800">Identifique</h4>
                      <p className="text-sm text-gray-500">Escaneie o QR Code da lixeira.</p>
                    </div>
                  </div>
                  <div className="w-0.5 h-6 bg-gray-200 ml-4" />
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 font-bold text-[#2E8B57]">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800">Fotografe</h4>
                      <p className="text-sm text-gray-500">Tire uma foto nítida do lixo sendo descartado.</p>
                    </div>
                  </div>
                </div>

                {/* CORREÇÃO DO BOTÃO: Estilo inline para garantir cor */}
                <Button 
                  className="w-full h-14 text-lg rounded-xl shadow-lg font-bold"
                  style={{ backgroundColor: '#2E8B57', color: 'white' }} 
                  onClick={() => setStep('scan_qr')}
                >
                  Começar Agora
                </Button>
              </div>
            </motion.div>
          )}

          {/* 1. SCANNER QR CODE */}
          {step === 'scan_qr' && (
            <motion.div key="scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col items-center justify-center gap-6">
               <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">Passo 1 de 2</h2>
                  <p className="text-gray-500">Aponte para o código na lixeira</p>
               </div>

               <div className="relative w-full max-w-xs aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-gray-100">
                  <QrScannerComponent onScanSuccess={handleScanSuccess} scanRegionId="qr-reader-box" />
                  <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none">
                    <div className="w-full h-1 bg-red-500 absolute top-1/2 left-0 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  </div>
               </div>

               <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
                  <QrCode className="w-4 h-4" />
                  <span>Procurando código...</span>
               </div>
            </motion.div>
          )}

          {/* 2. TIRA FOTO */}
          {step === 'take_photo' && binData && (
            <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center w-full h-full">
               <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-[#2E8B57] rounded-full text-sm font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4" /> Lixeira de {binData.type}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Registre o Descarte</h2>
               </div>

               <div className="relative w-full max-w-sm flex-1 bg-black rounded-3xl overflow-hidden shadow-xl mb-6">
                  <Webcam 
                    audio={false} 
                    ref={webcamRef} 
                    screenshotFormat="image/jpeg" 
                    videoConstraints={{ facingMode: "environment" }}
                    className="w-full h-full object-cover"
                  />
               </div>

               <div className="w-full px-6 pb-4">
                 <button 
                    onClick={handleSendPhoto}
                    className="w-full h-16 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    style={{ backgroundColor: '#2E8B57' }}
                 >
                    <Camera className="w-6 h-6" />
                    Tirar Foto e Enviar
                 </button>
                 <button onClick={() => setStep('scan_qr')} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 py-2">
                    Escanear outra lixeira
                 </button>
               </div>
            </motion.div>
          )}

          {/* 3. LOADING */}
          {step === 'sending' && (
            <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-16 h-16 text-[#2E8B57] animate-spin mx-auto mb-4" />
              <h3 className="mt-8 text-xl font-bold text-gray-800">Enviando dados...</h3>
              <p className="text-gray-500 mt-2">Não feche o aplicativo</p>
            </motion.div>
          )}

          {/* 4. SUCESSO */}
          {step === 'success' && (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Info className="w-12 h-12 text-amber-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Enviado para Análise!</h2>
              
              <Card className="bg-white border-amber-100 shadow-sm mb-8 w-full">
                <CardContent className="p-4 text-left">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Recebemos sua foto com sucesso! 📸
                    <br/><br/>
                    Para garantir a pontuação justa, um de nossos auditores irá verificar a imagem em breve.
                  </p>
                  <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">Seus pontos aparecerão no saldo assim que aprovado.</p>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold shadow-lg" onClick={() => onNavigate('home')}>
                Voltar ao Início
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}