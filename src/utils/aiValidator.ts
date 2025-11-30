import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURAÇÃO ---
// COLE SUA CHAVE AQUI DENTRO
const API_KEY = "AIzaSyAO2sLQecop-sz4u7PBP2pEyY7xgLAANCE"; 

// ⚠️ DICA DE OURO: Mude para true se a API do Google der erro na apresentação!
// Assim o sistema finge que analisou e aprova (para você não travar).
const USE_MOCK_AI = true; 

const genAI = new GoogleGenerativeAI(API_KEY);

export async function validateTrashImage(imageBase64: string, expectedType: string) {
  console.log("🔍 Iniciando validação de IA para:", expectedType);

  // --- MODO DE SEGURANÇA (MOCK) ---
  if (USE_MOCK_AI) {
    console.warn("⚠️ Usando IA Simulada (Mock Mode)");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Finge que pensa
    return {
      approved: true,
      volume: "medio",
      points_multiplier: 1.5,
      reason: "Validação simulada com sucesso (Modo Apresentação)."
    };
  }

  // --- MODO REAL ---
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Atue como fiscal de reciclagem. O usuário diz que é: ${expectedType}.
    Responda APENAS este JSON (sem markdown):
    {
      "approved": boolean, 
      "volume": "baixo" | "medio" | "alto",
      "points_multiplier": number,
      "reason": "Explicação curta em português."
    }
  `;

  try {
    // Limpeza agressiva do Base64 (Remove o cabeçalho data:image...)
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
    ]);
    
    const response = await result.response;
    let text = response.text();
    
    // Limpa formatação JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    console.log("🤖 Resposta da IA:", text);
    return JSON.parse(text);

  } catch (error: any) {
    console.error("❌ Erro Crítico na IA:", error);
    
    // Retorna erro legível para a tela
    return { 
      approved: false, 
      volume: "baixo", 
      points_multiplier: 0, 
      reason: `Erro técnico: ${error.message || "Falha na API"}. Verifique a chave.` 
    }; 
  }
}