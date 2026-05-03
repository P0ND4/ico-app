import { useState, useRef, useCallback, useEffect } from "react";

export interface PathStep {
  id: number;
  title: string;
  description: string;
  activity: string;
}

export interface PathData {
  title: string;
  description: string;
  steps: PathStep[];
}

export interface UseMockLearningPathReturn {
  path: PathData | null;
  isLoading: boolean;
  generate: (topic: string) => void;
}

function buildPath(topic: string): PathData {
  const displayTopic = topic || 'este tema';

  return {
    title: `Ruta de Aprendizaje: ${displayTopic}`,
    description: `Un camino estructurado para dominar "${displayTopic}" desde sus fundamentos hasta su aplicación práctica, desarrollando autonomía y pensamiento crítico en cada etapa.`,
    steps: [
      {
        id: 1,
        title: `Fundamentos de ${displayTopic}`,
        description: `Explorá los conceptos esenciales y el vocabulario clave de ${displayTopic}. Comprendé por qué este conocimiento es relevante y cómo se conecta con lo que ya sabés.`,
        activity: 'Actividad Práctica: Creá un mapa conceptual que relacione los términos fundamentales con ejemplos de tu vida cotidiana.',
      },
      {
        id: 2,
        title: 'Desarrollo Conceptual',
        description: `Profundizá en los principios intermedios de ${displayTopic}, identificando patrones y relaciones que no son evidentes a primera vista.`,
        activity: 'Actividad Práctica: Resolvé tres problemas de dificultad creciente y documentá tu proceso de razonamiento paso a paso.',
      },
      {
        id: 3,
        title: 'Conexiones Interdisciplinarias',
        description: `Descubrí cómo ${displayTopic} se relaciona con otras áreas del conocimiento. Las ideas más poderosas surgen en las intersecciones.`,
        activity: 'Actividad Práctica: Escribí un ensayo breve conectando este tema con otra disciplina que te apasione. ¿Qué patrones se repiten?',
      },
      {
        id: 4,
        title: 'Aplicación y Proyecto',
        description: `Llevá ${displayTopic} a la práctica con un proyecto concreto. La teoría cobra sentido cuando la aplicás a un desafío real.`,
        activity: 'Actividad Práctica: Diseñá y ejecutá un mini-proyecto que demuestre tu comprensión. Documentá obstáculos, soluciones y aprendizajes.',
      },
      {
        id: 5,
        title: 'Reflexión y Síntesis',
        description: `Consolidá lo aprendido sobre ${displayTopic} a través de la reflexión crítica. ¿Qué cambiarías de tu enfoque inicial? ¿Qué preguntas nuevas surgieron?`,
        activity: 'Actividad Práctica: Prepará una presentación o artículo explicando el tema a alguien que no sabe nada al respecto. Enseñar es la mejor forma de aprender.',
      },
    ],
  };
}

export function useMockLearningPath(): UseMockLearningPathReturn {
  const [path, setPath] = useState<PathData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback((topic: string) => {
    setIsLoading(true);
    setPath(null);

    timeoutRef.current = setTimeout(() => {
      setPath(buildPath(topic));
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

  return { path, isLoading, generate };
}
