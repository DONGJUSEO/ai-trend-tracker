// AI Trend Tracker Design System
// 8pt Grid System + Glassmorphism Dark Theme

export const colors = {
  // Background layers
  bg: {
    primary: '#0a0a0f',
    secondary: '#111827',
    tertiary: '#1a1a2e',
    card: 'rgba(255, 255, 255, 0.05)',
    cardHover: 'rgba(255, 255, 255, 0.08)',
  },
  // Text
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    tertiary: '#64748b',
    accent: '#60a5fa',
  },
  // Brand / Category colors
  category: {
    huggingface: '#FFD21E',
    youtube: '#FF0000',
    papers: '#3B82F6',
    news: '#10B981',
    github: '#8B5CF6',
    conferences: '#F59E0B',
    platforms: '#EC4899',
    jobs: '#06B6D4',
    policies: '#6366F1',
    system: '#6B7280',
  },
  // Accent gradients
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    cool: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  // Glass
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    backgroundHover: 'rgba(255, 255, 255, 0.08)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

export const typography = {
  h1: {
    fontSize: '2.25rem',
    lineHeight: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: 600,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: 600,
  },
  body: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 400,
  },
} as const;

export const glassmorphism = {
  card: 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl',
  cardHover: 'hover:bg-white/8 hover:border-white/15 transition-all duration-300',
  sidebar: 'bg-white/5 backdrop-blur-2xl border-r border-white/10',
  input: 'bg-white/5 backdrop-blur-sm border border-white/10 focus:border-white/20',
  badge: 'bg-white/10 backdrop-blur-sm border border-white/10',
} as const;

export const animation = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  fadeIn: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  slideIn: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
  scaleIn: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
} as const;
