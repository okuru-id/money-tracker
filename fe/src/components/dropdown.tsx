import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconChevronDown, IconCheck, IconX } from '@tabler/icons-react'

export type DropdownOption = {
  value: string
  label: string
}

type DropdownProps = {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 1100,
    })
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const menu = isOpen && !disabled ? (
    <div className="dropdown__menu" ref={menuRef} style={menuStyle}>
      <div className="dropdown__options">
        {options.length === 0 ? (
          <div className="dropdown__empty">No options</div>
        ) : (
          options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`dropdown__option ${option.value === value ? 'dropdown__option--selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <span className="dropdown__option-label">{option.label}</span>
              {option.value === value && (
                <span className="dropdown__option-check">
                  <IconCheck size={14} />
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      <div className={`dropdown ${className}`} ref={containerRef}>
        {label && <label className="dropdown__label">{label}</label>}
        <button
          type="button"
          className={`dropdown__trigger ${isOpen ? 'dropdown__trigger--open' : ''} ${disabled ? 'dropdown__trigger--disabled' : ''}`}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'dropdown__value' : 'dropdown__placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="dropdown__icons">
            {value && !disabled && (
              <span className="dropdown__clear" onClick={handleClear}>
                <IconX size={14} />
              </span>
            )}
            <span className={`dropdown__chevron ${isOpen ? 'dropdown__chevron--up' : ''}`}>
              <IconChevronDown size={16} />
            </span>
          </span>
        </button>
      </div>
      {menu ? createPortal(menu, document.body) : null}
    </>
  )
}
