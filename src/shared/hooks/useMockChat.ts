import { useState, useRef, useCallback, useEffect } from "react";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UseMockChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  send: (text: string) => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'model',
  text: '¡Hola! Soy tu tutor personal. ¿En qué tema quieres profundizar hoy? Mi objetivo es ayudarte a que tú mismo encuentres las respuestas.',
};

const RESPONSE_MATH = 'Las matemáticas son un lenguaje que describe patrones. ¿Qué concepto en particular te genera curiosidad? ¿Has notado cómo ciertos problemas se resuelven mejor cuando cambiamos la perspectiva? Contame qué parte te resulta más desafiante y lo exploramos juntos.';

const RESPONSE_HISTORY = 'La historia no es solo fechas: son decisiones humanas que moldearon nuestro presente. ¿Qué período o civilización te intriga más? ¿Qué crees que podemos aprender de esos eventos para aplicar hoy?';

const RESPONSE_CODE = 'La programación es el arte de descomponer problemas en instrucciones claras. ¿Hay algún lenguaje o concepto que quieras dominar? ¿Qué tipo de proyecto te gustaría construir? Pensá en el problema antes que en la sintaxis.';

const RESPONSE_DEFAULT = 'Qué buena pregunta. ¿Qué sabés ya sobre este tema? A veces las mejores respuestas surgen cuando nos hacemos las preguntas correctas. ¿Qué aspecto te gustaría explorar primero?';

function pickResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('matemática') || lower.includes('cálculo')) return RESPONSE_MATH;
  if (lower.includes('historia')) return RESPONSE_HISTORY;
  if (lower.includes('programación') || lower.includes('código')) return RESPONSE_CODE;
  return RESPONSE_DEFAULT;
}

export function useMockChat(): UseMockChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = useCallback((text: string) => {
    const userMessage: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      const response: ChatMessage = {
        role: 'model',
        text: pickResponse(text),
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { messages, isLoading, send };
}
