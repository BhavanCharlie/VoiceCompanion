import './PaletteIcon.css'

interface PaletteIconProps {
  size?: number
  className?: string
}

const PaletteIcon = ({ size = 64, className = '' }: PaletteIconProps) => {
  return (
    <div className={`palette-icon ${className}`}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Artist's Palette */}
        <path d="M60 20 C45 20, 30 30, 25 45 C20 60, 25 75, 35 85 C45 95, 60 100, 75 95 C90 90, 100 75, 100 60 C100 45, 90 30, 75 25 C60 20, 60 20, 60 20 Z" 
              fill="#D4A574" stroke="#8B6F47" strokeWidth="2"/>
        {/* Paint dots distributed around the palette */}
        <circle cx="40" cy="40" r="8" fill="#4A90E2"/>
        <circle cx="60" cy="30" r="8" fill="#50C878"/>
        <circle cx="80" cy="40" r="8" fill="#FFD700"/>
        <circle cx="85" cy="65" r="8" fill="#9B59B6"/>
        <circle cx="75" cy="85" r="8" fill="#E74C3C"/>
        <circle cx="50" cy="90" r="8" fill="#FF6B6B"/>
        <circle cx="35" cy="70" r="8" fill="#FFA500"/>
        <circle cx="45" cy="55" r="8" fill="#00CED1"/>
        {/* Highlights on paint dots */}
        <circle cx="40" cy="40" r="3" fill="white" opacity="0.3"/>
        <circle cx="60" cy="30" r="3" fill="white" opacity="0.3"/>
        <circle cx="80" cy="40" r="3" fill="white" opacity="0.3"/>
        <circle cx="85" cy="65" r="3" fill="white" opacity="0.3"/>
        <circle cx="75" cy="85" r="3" fill="white" opacity="0.3"/>
        <circle cx="50" cy="90" r="3" fill="white" opacity="0.3"/>
        <circle cx="35" cy="70" r="3" fill="white" opacity="0.3"/>
        <circle cx="45" cy="55" r="3" fill="white" opacity="0.3"/>
        {/* Thumbhole */}
        <circle cx="95" cy="55" r="12" fill="white"/>
        <circle cx="95" cy="55" r="10" fill="#D4A574"/>
      </svg>
    </div>
  )
}

export default PaletteIcon

