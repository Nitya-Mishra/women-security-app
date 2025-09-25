import React, { useRef, useEffect, useState } from 'react';

const SirenAudio = ({ playing, onEnd }) => {
  const audioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [oscillator, setOscillator] = useState(null);

  useEffect(() => {
    // Initialize audio context
    const initAudio = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        setAudioContext(context);
      } catch (error) {
        console.error('Audio context not supported:', error);
      }
    };

    initAudio();
  }, []);

  useEffect(() => {
    if (!audioContext) return;

    if (playing) {
      // Create oscillator for siren sound
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configure siren sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.5);
      
      // Create pulsating effect
      gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.25);
      
      // Connect nodes
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Start oscillator
      osc.start();
      setOscillator(osc);

      // Create pulsating effect interval
      const interval = setInterval(() => {
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.25);
      }, 500);

      return () => {
        clearInterval(interval);
        if (osc) {
          osc.stop();
          osc.disconnect();
        }
      };
    } else if (oscillator) {
      // Stop oscillator when not playing
      oscillator.stop();
      oscillator.disconnect();
      setOscillator(null);
    }
  }, [playing, audioContext]);

  // Fallback to HTML5 audio if Web Audio API is not available
  useEffect(() => {
    if (!audioContext && audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(error => {
          console.error('Error playing siren fallback:', error);
        });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [playing, audioContext]);

  return (
    <>
      {/* Fallback audio element */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
        loop
        onEnded={onEnd}
      />
    </>
  );
};

export default SirenAudio;