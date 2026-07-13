"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

export function AnimatedBackground() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme || !vantaRef.current) return;

    const isDarkMode = theme === 'dark' || theme === 'sunset';
    const getHexNum = (hex: string) => parseInt(hex.replace('#', '0x'), 16);

    const primaryHex = theme === 'dark' ? '#E27555' : theme === 'ocean' ? '#0077B6' : theme === 'sunset' ? '#F94144' : theme === 'earth' ? '#8D6E63' : '#2D6A4F';
    const secondaryHex = theme === 'dark' ? '#F4A261' : theme === 'ocean' ? '#48CAE4' : theme === 'sunset' ? '#F8961E' : theme === 'earth' ? '#81C784' : '#52B788';
    const bgHex = theme === 'dark' ? '#1c1917' : theme === 'sunset' ? '#2e1026' : theme === 'ocean' ? '#F0F8FF' : theme === 'earth' ? '#f5f5dc' : '#f9fbf9';

    const loadVanta = async () => {
      try {
        if (!vantaEffect) {
          // @ts-expect-error vanta does not have strict types for this path
          const BIRDS = (await import('vanta/dist/vanta.birds.min')).default;
          const effectObj = BIRDS({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: getHexNum(bgHex),
            color1: getHexNum(primaryHex),
            color2: getHexNum(secondaryHex),
            colorMode: "variance",
            birdSize: 1.50,
            wingSpan: 30.00,
            speedLimit: 6.00,
            separation: 40.00,
            alignment: 50.00,
            cohesion: 50.00,
            quantity: 4.50
          });
          setVantaEffect(effectObj);
        } else {
          vantaEffect.setOptions({
            backgroundColor: getHexNum(bgHex),
            color1: getHexNum(primaryHex),
            color2: getHexNum(secondaryHex),
          });
        }
      } catch (error) {
        console.error("Vanta effect could not load:", error);
      }
    };

    loadVanta();

  }, [theme, vantaEffect]);

  useEffect(() => {
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    }
  }, [vantaEffect]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500">
      <div 
        ref={vantaRef} 
        className="w-full h-full"
      />
      {/* Noise texture removed to fix 404 error */}
    </div>
  );
}
