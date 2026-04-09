import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn, formatTime } from '../lib/utils';

interface TimerProps {
  onSolveComplete: (time: number) => void;
}

type TimerState = 'idle' | 'inspecting' | 'pressing' | 'ready' | 'running';

export const Timer: React.FC<TimerProps> = ({ onSolveComplete }) => {
  const [state, setState] = useState<TimerState>('idle');
  const stateRef = useRef<TimerState>('idle');
  const [time, setTime] = useState(0);
  const [inspectionTime, setInspectionTime] = useState(15);
  const timerRef = useRef<number | null>(null);
  const inspectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSolveCompleteRef = useRef(onSolveComplete);

  useEffect(() => {
    onSolveCompleteRef.current = onSolveComplete;
  }, [onSolveComplete]);

  const updateState = useCallback((newState: TimerState) => {
    stateRef.current = newState;
    setState(newState);
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 0.1) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, []);

  const startInspection = useCallback(() => {
    updateState('inspecting');
    setInspectionTime(15);
    setTime(0);
    
    if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
    
    inspectionTimerRef.current = setInterval(() => {
      setInspectionTime((prev) => {
        if (prev <= 1) {
          if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
          playBeep(400, 0.5); // DNF beep
          updateState('idle');
          return 0;
        }
        if (prev === 8) playBeep(600, 0.1); // 8 seconds warning
        if (prev === 3) playBeep(600, 0.1); // 12 seconds warning
        return prev - 1;
      });
    }, 1000);
  }, [updateState, playBeep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        const currentState = stateRef.current;
        
        if (currentState === 'idle') {
          startInspection();
        } else if (currentState === 'inspecting') {
          if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
          updateState('pressing');
          holdTimeoutRef.current = setTimeout(() => {
            updateState('ready');
          }, 300); // 0.3s hold to turn green
        } else if (currentState === 'running') {
          // Stop timer
          if (timerRef.current) cancelAnimationFrame(timerRef.current);
          const finalTime = (performance.now() - startTimeRef.current) / 1000;
          setTime(finalTime);
          updateState('idle');
          playBeep();
          onSolveCompleteRef.current(finalTime);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        const currentState = stateRef.current;
        if (currentState === 'pressing') {
          // Released too early, go back to inspecting
          if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
          updateState('inspecting');
          // Resume inspection timer
          inspectionTimerRef.current = setInterval(() => {
            setInspectionTime((prev) => {
              if (prev <= 1) {
                if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
                playBeep(400, 0.5);
                updateState('idle');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (currentState === 'ready') {
          // Start timer
          updateState('running');
          startTimeRef.current = performance.now();
          
          const updateTimer = () => {
            setTime((performance.now() - startTimeRef.current) / 1000);
            timerRef.current = requestAnimationFrame(updateTimer);
          };
          timerRef.current = requestAnimationFrame(updateTimer);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
    };
  }, [updateState, playBeep, startInspection]);

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const currentState = stateRef.current;
    if (currentState === 'idle') {
      startInspection();
    } else if (currentState === 'inspecting') {
      if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
      updateState('pressing');
      holdTimeoutRef.current = setTimeout(() => {
        updateState('ready');
      }, 300);
    } else if (currentState === 'running') {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      const finalTime = (performance.now() - startTimeRef.current) / 1000;
      setTime(finalTime);
      updateState('idle');
      playBeep();
      onSolveCompleteRef.current(finalTime);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const currentState = stateRef.current;
    if (currentState === 'pressing') {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      updateState('inspecting');
      inspectionTimerRef.current = setInterval(() => {
        setInspectionTime((prev) => {
          if (prev <= 1) {
            if (inspectionTimerRef.current) clearInterval(inspectionTimerRef.current);
            playBeep(400, 0.5);
            updateState('idle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (currentState === 'ready') {
      updateState('running');
      startTimeRef.current = performance.now();
      const updateTimer = () => {
        setTime((performance.now() - startTimeRef.current) / 1000);
        timerRef.current = requestAnimationFrame(updateTimer);
      };
      timerRef.current = requestAnimationFrame(updateTimer);
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center py-20 w-full select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={cn(
        "text-8xl md:text-[12rem] font-mono font-bold tracking-tighter transition-colors duration-150",
        state === 'pressing' ? "text-red-500" :
        state === 'ready' ? "text-green-500" :
        state === 'inspecting' ? "text-yellow-500" :
        "text-slate-800"
      )}>
        {state === 'inspecting' ? inspectionTime : formatTime(time)}
      </div>
      <p className="mt-4 text-slate-500 font-medium h-6">
        {state === 'idle' && 'Press Space to start inspection'}
        {state === 'inspecting' && 'Hold Space when ready'}
        {state === 'running' && 'Tap or press Space to stop'}
        {(state === 'pressing' || state === 'ready') && ''}
      </p>
    </div>
  );
};
