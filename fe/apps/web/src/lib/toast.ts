import { useSyncExternalStore } from 'react'

type ToastType = 'success' | 'error'

type ToastAction = {
  label: string
  onClick: () => void
}

type ToastItem = {
  id: number
  title: string
  description?: string
  type: ToastType
  action?: ToastAction
}

type ToastInput = {
  title: string
  description?: string
  type?: ToastType
  action?: ToastAction
}

let currentToast: ToastItem | null = null
let nextToastId = 1
let clearTimer: ReturnType<typeof setTimeout> | null = null

const listeners = new Set<() => void>()

function emitChange(): void {
  listeners.forEach((listener) => listener())
}

function setToast(toast: ToastItem | null): void {
  currentToast = toast
  emitChange()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): ToastItem | null {
  return currentToast
}

function clearExistingTimer(): void {
  if (!clearTimer) {
    return
  }

  clearTimeout(clearTimer)
  clearTimer = null
}

export function dismissToast(): void {
  clearExistingTimer()
  setToast(null)
}

export function showToast(input: ToastInput): void {
  clearExistingTimer()

  const toast: ToastItem = {
    id: nextToastId,
    title: input.title,
    description: input.description,
    type: input.type ?? 'success',
    action: input.action,
  }

  nextToastId += 1
  setToast(toast)

  clearTimer = setTimeout(() => {
    if (currentToast?.id === toast.id) {
      setToast(null)
    }
    clearTimer = null
  }, 4200)
}

export function useToast(): ToastItem | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
