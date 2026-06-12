import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';
import type { AudioPlayer } from 'expo-audio/build/AudioModule.types';
import { useCallback, useEffect } from 'react';

const SOUNDS = {
  generated: require('../../presentation/assets/sounds/generated.mp3'),
  splash: require('../../presentation/assets/sounds/splash.mp3'),
  completedCourse: require('../../presentation/assets/sounds/completed-course.mp3'),
  completedChapter: require('../../presentation/assets/sounds/completed-chapter.mp3'),
} as const;

export type SoundKey = keyof typeof SOUNDS;

const LOAD_TIMEOUT_MS = 5000;
const players = new Map<SoundKey, AudioPlayer>();
let audioModeReady = false;
let preloadPromise: Promise<void> | null = null;

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
    });
    await setIsAudioActiveAsync(true);
    audioModeReady = true;
  } catch {
    // Non-critical — playback may still work
  }
}

function getPlayer(key: SoundKey): AudioPlayer {
  let player = players.get(key);
  if (!player) {
    player = createAudioPlayer(SOUNDS[key], { keepAudioSessionActive: true });
    players.set(key, player);
  }
  return player;
}

function waitUntilLoaded(player: AudioPlayer, timeoutMs = LOAD_TIMEOUT_MS): Promise<void> {
  if (player.isLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error('Sound load timeout'));
    }, timeoutMs);

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.isLoaded) {
        clearTimeout(timeout);
        subscription.remove();
        resolve();
      }
    });
  });
}

/** Precarga todos los efectos para evitar fallos en el primer play. */
export async function preloadSounds(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = (async () => {
      await ensureAudioMode();
      await Promise.all(
        (Object.keys(SOUNDS) as SoundKey[]).map(async (key) => {
          await waitUntilLoaded(getPlayer(key));
        }),
      );
    })().catch(() => {
      preloadPromise = null;
    });
  }
  await preloadPromise;
}

export async function playSound(key: SoundKey): Promise<void> {
  try {
    await preloadSounds();
    const player = getPlayer(key);
    if (!player.isLoaded) {
      await waitUntilLoaded(player);
    }
    if (player.playing) {
      player.pause();
    }
    await player.seekTo(0);
    player.play();
  } catch {
    // Sound errors are non-critical — fail silently
  }
}

export function useSoundEffect() {
  useEffect(() => {
    void preloadSounds();
  }, []);

  const play = useCallback((key: SoundKey) => {
    void playSound(key);
  }, []);

  return { play };
}
