import { Text } from '@tarojs/components'
import './style.scss'

interface LiteIconProps {
  name?: string
  value?: string
  size?: number | string
  color?: string
  className?: string
}

const ICON_GLYPHS: Record<string, string> = {
  'chevron-right': '›',
  'chevron-left': '‹',
  'map-pin': '⌖',
  search: '⌕',
  calendar: '▦',
  filter: '☰',
  'check-circle': '✓',
  close: '✕',
  'star-2': '★',
  'subtract-circle': '—',
}

const normalizeIconSize = (size?: number | string) => {
  if (typeof size === 'number') {
    return `${size}px`
  }

  if (!size) {
    return '16px'
  }

  return /^\d+$/.test(size) ? `${size}px` : size
}

export default function LiteIcon({
  name,
  value,
  size = 16,
  color = 'currentColor',
  className = '',
}: LiteIconProps) {
  const iconName = name || value || ''
  const glyph = ICON_GLYPHS[iconName] || '•'
  const style = {
    fontSize: normalizeIconSize(size),
    color,
  }
  const mergedClassName = ['lite-icon', className].filter(Boolean).join(' ')

  return (
    <Text className={mergedClassName} style={style}>
      {glyph}
    </Text>
  )
}
