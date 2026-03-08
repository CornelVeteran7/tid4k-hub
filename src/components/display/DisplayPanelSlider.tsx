import { useState, useEffect } from 'react';

interface Panel {
  id: string;
  tip: string;
  continut: string;
  durata: number;
}

interface DisplayPanelSliderProps {
  panels: Panel[];
  primaryColor: string;
}

export function DisplayPanelSlider({ panels, primaryColor }: DisplayPanelSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animState, setAnimState] = useState<'visible' | 'fading'>('visible');

  useEffect(() => {
    if (panels.length <= 1) return;
    const duration = (panels[currentIndex]?.durata || 8) * 1000;
    const timer = setTimeout(() => {
      setAnimState('fading');
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % panels.length);
        setAnimState('visible');
      }, 600);
    }, duration);
    return () => clearTimeout(timer);
  }, [currentIndex, panels]);

  if (panels.length === 0) return null;
  const panel = panels[currentIndex];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-[8vw] py-[12vh]">
      <div
        className="text-center max-w-[80vw] transition-opacity duration-500 ease-in-out"
        style={{ opacity: animState === 'visible' ? 1 : 0 }}
      >
        <span
          className="inline-block px-[2vw] py-[0.5vh] rounded-full text-[1.8vh] font-bold mb-[2vh] uppercase tracking-wider"
          style={{ backgroundColor: primaryColor }}
        >
          {panel.tip}
        </span>
        <h2 className="text-[5vh] font-bold leading-tight">{panel.continut}</h2>
      </div>

      {/* Panel indicators */}
      {panels.length > 1 && (
        <div className="absolute bottom-[8vh] flex gap-[0.5vw]">
          {panels.map((_, i) => (
            <div
              key={i}
              className="h-[0.8vh] rounded-full transition-all duration-500"
              style={{
                width: i === currentIndex ? '3vw' : '0.8vh',
                backgroundColor: i === currentIndex ? primaryColor : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
