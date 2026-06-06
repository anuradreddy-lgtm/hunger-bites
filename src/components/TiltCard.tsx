import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxRotation = 10
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Normalized motion inputs (0.5 represents center)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Maps values to rotation limits with smooth spring damping physics
  const rotateX = useSpring(useTransform(y, [0, 1], [maxRotation, -maxRotation]), {
    damping: 20,
    stiffness: 150
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxRotation, maxRotation]), {
    damping: 20,
    stiffness: 150
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  // Interactive light glare highlight positioning
  const glareX = useTransform(x, [0, 1], ['10%', '90%']);
  const glareY = useTransform(y, [0, 1], ['10%', '90%']);
  const glareOpacity = useSpring(useTransform(x, [0, 0.5, 1], [0.12, 0, 0.12]), {
    damping: 25,
    stiffness: 150
  });

  const glareBg = useTransform([glareX, glareY], ([gX, gY]) => {
    return `radial-gradient(circle at ${gX} ${gY}, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%)`;
  });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800
      }}
      className={`relative ${className}`}
    >
      {/* Light sheen glare layer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: glareBg,
          opacity: glareOpacity,
          zIndex: 10,
          pointerEvents: 'none',
          borderRadius: 'inherit'
        }}
      />
      
      {/* 3D Children content container */}
      <div style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  );
};
export default TiltCard;
