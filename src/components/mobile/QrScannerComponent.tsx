import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  scanRegionId: string;
}

export const QrScannerComponent: React.FC<QrScannerProps> = ({ onScanSuccess, scanRegionId }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Evita recriação duplicada
    if (scannerRef.current) return;

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scanRegionId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" }, // Tenta câmera traseira
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
            // REMOVIDO: supportedScanTypes (causava o erro e não é necessário aqui)
          },
          (decodedText) => {
            // Sucesso! Para a câmera e avisa o pai
            html5QrCode.stop().then(() => {
                scannerRef.current = null;
                onScanSuccess(decodedText);
            }).catch(err => console.warn("Erro ao parar scanner:", err));
          },
          (errorMessage) => {
            // Ignora erros de frame (comum enquanto procura QR)
          }
        );
        setLoading(false);
      } catch (err) {
        console.error("Falha na câmera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões ou se está usando HTTPS.");
        setLoading(false);
      }
    };

    // Pequeno delay para garantir que a DIV existe no DOM
    const timer = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scanRegionId, onScanSuccess]);

  return (
    <div className="relative w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl">
      {/* Container onde a biblioteca injeta o vídeo */}
      <div id={scanRegionId} className="w-full h-full" />

      {/* Overlays de Estado */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 z-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-2" />
            <p className="text-zinc-400 text-sm">Iniciando câmera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-30 p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-white text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Mira Visual (Para o usuário saber onde apontar) */}
      {!loading && !error && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-primary/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1" />
          </div>
        </div>
      )}
    </div>
  );
};