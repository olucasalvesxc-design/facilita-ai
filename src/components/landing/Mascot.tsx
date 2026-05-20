import { motion } from 'motion/react';

export type MascotPose = 'thinking' | 'pointing' | 'shopping' | 'calendar' | 'alert' | 'welcome';

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
}

const poses: Record<MascotPose, { rightArm: string; leftArm: string; eyeScale?: number; mouthPath: string }> = {
  thinking: {
    rightArm: 'rotate(-80deg) translate(0, -18px)',
    leftArm: 'rotate(10deg)',
    mouthPath: 'M 50 91 Q 70 98 90 91',
  },
  pointing: {
    rightArm: 'rotate(-20deg) translate(14px, -6px)',
    leftArm: 'rotate(5deg)',
    mouthPath: 'M 50 91 Q 70 102 90 91',
  },
  shopping: {
    rightArm: 'rotate(30deg)',
    leftArm: 'rotate(-30deg)',
    mouthPath: 'M 50 91 Q 70 102 90 91',
  },
  calendar: {
    rightArm: 'rotate(-40deg) translate(6px, -10px)',
    leftArm: 'rotate(40deg) translate(-6px, -10px)',
    mouthPath: 'M 50 91 Q 70 102 90 91',
  },
  alert: {
    rightArm: 'rotate(-120deg) translate(-2px, -26px)',
    leftArm: 'rotate(120deg) translate(2px, -26px)',
    eyeScale: 1.15,
    mouthPath: 'M 55 95 Q 70 88 85 95',
  },
  welcome: {
    rightArm: 'rotate(-70deg) translate(4px, -20px)',
    leftArm: 'rotate(70deg) translate(-4px, -20px)',
    mouthPath: 'M 48 91 Q 70 106 92 91',
  },
};

export function Mascot({ pose = 'pointing', size = 160, className = '' }: MascotProps) {
  const p = poses[pose];
  const s = p.eyeScale ?? 1;

  return (
    <motion.div
      className={`select-none ${className}`}
      style={{ width: size, height: size * 1.4 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.05 }}
      style={{ filter: 'drop-shadow(0 0 20px rgba(255,122,0,0.35))' }}
    >
      <svg
        viewBox="0 0 140 196"
        width={size}
        height={size * 1.4}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Shadow ── */}
        <ellipse cx="70" cy="193" rx="38" ry="4" fill="rgba(255,122,0,0.12)" />

        {/* ── Feet ── */}
        <rect x="43" y="171" width="24" height="18" rx="9" fill="#FF7A00" />
        <rect x="73" y="171" width="24" height="18" rx="9" fill="#FF7A00" />

        {/* ── Body ── */}
        <rect x="32" y="104" width="76" height="72" rx="22" fill="#111111" />
        <rect x="32" y="104" width="76" height="72" rx="22" fill="none" stroke="rgba(255,122,0,0.35)" strokeWidth="1.5" />
        {/* Collar V */}
        <path d="M 54 104 L 70 122 L 86 104" fill="none" stroke="#FF7A00" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Chest dot badge */}
        <circle cx="70" cy="138" r="5" fill="rgba(255,122,0,0.2)" stroke="#FF7A00" strokeWidth="1" />
        <circle cx="70" cy="138" r="2.5" fill="#FF7A00" />

        {/* ── Left Arm ── */}
        <motion.g
          style={{ transformOrigin: '38px 116px' }}
          animate={{ rotate: pose === 'alert' || pose === 'welcome' ? -70 : pose === 'thinking' ? 10 : 5 }}
          transition={{ duration: 0.5, type: 'spring', damping: 14 }}
        >
          <rect x="6" y="110" width="34" height="14" rx="7" fill="#111111" stroke="rgba(255,122,0,0.3)" strokeWidth="1.2" />
          <circle cx="8" cy="117" r="6" fill="#1a1a1a" stroke="rgba(255,122,0,0.2)" strokeWidth="1" />
        </motion.g>

        {/* ── Right Arm ── */}
        <motion.g
          style={{ transformOrigin: '102px 116px' }}
          animate={{ rotate: pose === 'alert' || pose === 'welcome' ? 70 : pose === 'thinking' ? -80 : pose === 'pointing' ? -20 : pose === 'calendar' ? -40 : 0 }}
          transition={{ duration: 0.5, type: 'spring', damping: 14 }}
        >
          <rect x="100" y="110" width="34" height="14" rx="7" fill="#111111" stroke="rgba(255,122,0,0.3)" strokeWidth="1.2" />
          <circle cx="132" cy="117" r="6" fill="#FF7A00" />
          {pose === 'pointing' && (
            <rect x="134" y="114" width="16" height="6" rx="3" fill="#FF7A00" />
          )}
          {pose === 'thinking' && (
            <circle cx="70" cy="108" r="5" fill="#FF7A00" opacity="0.7" />
          )}
        </motion.g>

        {/* ── Head ── */}
        <rect x="20" y="12" width="100" height="96" rx="30" fill="#1a1a1a" />

        {/* Orange top stripe / visor */}
        <clipPath id="head-clip">
          <rect x="20" y="12" width="100" height="96" rx="30" />
        </clipPath>
        <g clipPath="url(#head-clip)">
          <rect x="20" y="12" width="100" height="26" fill="#FF7A00" opacity="0.9" />
          {/* Visor reflection */}
          <rect x="30" y="16" width="40" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
          {/* Circuit lines on body */}
          <line x1="40" y1="150" x2="40" y2="165" stroke="rgba(255,122,0,0.2)" strokeWidth="1" />
          <line x1="100" y1="150" x2="100" y2="165" stroke="rgba(255,122,0,0.2)" strokeWidth="1" />
        </g>

        {/* Head border */}
        <rect x="20" y="12" width="100" height="96" rx="30" fill="none" stroke="rgba(255,122,0,0.2)" strokeWidth="1.5" />

        {/* ── Eyes ── */}
        <motion.g
          animate={{ scaleY: s }}
          style={{ transformOrigin: '70px 65px' }}
          transition={{ duration: 0.3 }}
        >
          {/* Eye whites */}
          <ellipse cx="50" cy="66" rx="18" ry="19" fill="white" />
          <ellipse cx="90" cy="66" rx="18" ry="19" fill="white" />
          {/* Orange irises */}
          <ellipse cx="50" cy="68" rx="12" ry="12" fill="#FF7A00" />
          <ellipse cx="90" cy="68" rx="12" ry="12" fill="#FF7A00" />
          {/* Pupils */}
          <motion.ellipse
            cx="52" cy="67" rx="5.5" ry="6.5"
            fill="#050505"
            animate={{ cx: pose === 'pointing' ? 54 : pose === 'thinking' ? 48 : 52 }}
            transition={{ duration: 0.4 }}
          />
          <motion.ellipse
            cx="92" cy="67" rx="5.5" ry="6.5"
            fill="#050505"
            animate={{ cx: pose === 'pointing' ? 94 : pose === 'thinking' ? 88 : 92 }}
            transition={{ duration: 0.4 }}
          />
          {/* Shine */}
          <ellipse cx="55" cy="63" rx="2.5" ry="3" fill="rgba(255,255,255,0.85)" />
          <ellipse cx="95" cy="63" rx="2.5" ry="3" fill="rgba(255,255,255,0.85)" />
        </motion.g>

        {/* Blink animation overlay */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
          style={{ transformOrigin: '70px 66px' }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.88, 0.92, 0.96, 1] }}
        >
          <ellipse cx="50" cy="66" rx="18" ry="19" fill="#1a1a1a" opacity="0" />
          <ellipse cx="90" cy="66" rx="18" ry="19" fill="#1a1a1a" opacity="0" />
          {/* Closed eye lines (shown during blink) */}
          <path d="M 34 66 Q 50 58 66 66" stroke="#1a1a1a" strokeWidth="6" fill="none" strokeLinecap="round" opacity="1" />
          <path d="M 74 66 Q 90 58 106 66" stroke="#1a1a1a" strokeWidth="6" fill="none" strokeLinecap="round" opacity="1" />
        </motion.g>

        {/* Cheeks */}
        <ellipse cx="33" cy="80" rx="8" ry="5" fill="rgba(255,122,0,0.12)" />
        <ellipse cx="107" cy="80" rx="8" ry="5" fill="rgba(255,122,0,0.12)" />

        {/* Nose */}
        <circle cx="70" cy="85" r="3.5" fill="rgba(255,122,0,0.6)" />

        {/* Mouth */}
        <motion.path
          d={p.mouthPath}
          stroke="#FF7A00"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animate={{ d: p.mouthPath }}
          transition={{ duration: 0.4 }}
        />

        {/* Antenna */}
        <line x1="70" y1="12" x2="70" y2="2" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" />
        <motion.circle
          cx="70" cy="0" r="3.5"
          fill="#FF7A00"
          animate={{ r: [3.5, 5, 3.5], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
}
