import { useState, useRef, useCallback, useEffect } from "react";

export interface UseMockSummaryReturn {
  summary: string;
  isLoading: boolean;
  generate: (text: string) => void;
}

const INITIAL_SUMMARY = '';

function buildSummary(topic: string): string {
  const displayTopic = topic.slice(0, 60) || 'el aprendizaje autónomo';

  return [
    `En torno a "${displayTopic}", el pensamiento crítico emerge como una herramienta fundamental para distinguir información relevante de ruido. El primer paso hacia la comprensión profunda es cuestionar nuestras propias certezas — ¿de dónde vienen nuestras creencias sobre este tema? Cada afirmación que encontramos merece ser examinada con el mismo rigor que aplicaríamos a nuestras propias ideas.`,
    `La práctica deliberada, enfocada en "${displayTopic}", transforma el conocimiento pasivo en habilidad activa. No basta con leer o escuchar: es necesario aplicar, fallar, corregir y volver a intentar. El error no es un obstáculo sino un indicador preciso de dónde debemos concentrar nuestra atención. ¿Cuándo fue la última vez que te permitiste equivocarte a propósito para aprender?`,
    `Finalmente, la autonomía intelectual no significa aprender en soledad. Discutir ideas con otros, exponer nuestros razonamientos al escrutinio y buscar perspectivas complementarias acelera la comprensión más que cualquier estudio aislado. La pregunta no es si sabemos lo suficiente, sino si estamos haciendo las preguntas adecuadas para seguir creciendo.`,
    `Te invito a reflexionar: ¿cómo integrarías estos principios en tu rutina diaria de aprendizaje? ¿Qué pequeño cambio podés hacer hoy para convertirte en un aprendiz más crítico y autónomo?`,
  ].join('\n\n');
}

export function useMockSummary(): UseMockSummaryReturn {
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback((text: string) => {
    setIsLoading(true);
    setSummary('');

    timeoutRef.current = setTimeout(() => {
      setSummary(buildSummary(text));
      setIsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { summary, isLoading, generate };
}
