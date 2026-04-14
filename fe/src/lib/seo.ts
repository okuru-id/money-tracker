import { useEffect } from 'react'

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>

export type SeoConfig = {
  title: string
  description: string
  path: string
  robots?: string
  type?: 'website'
  imagePath?: string
  imageAlt?: string
  jsonLd?: JsonLd
}

const SITE_NAME = 'dompetku.id'
const FALLBACK_BASE_URL = 'https://dompetku.id'
const JSON_LD_ELEMENT_ID = 'route-json-ld'
const DEFAULT_DESCRIPTION =
  'Catat pemasukan dan pengeluaran keluarga lebih cepat dengan dompetku.id. Gunakan scan struk, AI, dan dashboard bersama untuk memantau keuangan dari satu tempat.'
const DEFAULT_TITLE = 'dompetku.id | Aplikasi Catat Keuangan Keluarga dengan AI dan Scan Struk'
const DEFAULT_IMAGE_ALT =
  'Ilustrasi pengguna memantau pertumbuhan keuangan keluarga bersama dompetku.id'
const DEFAULT_IMAGE_PATH = '/hero-person.png'
const DEFAULT_ROBOTS = 'index,follow,max-image-preview:large'

const defaultSeoConfig: SeoConfig = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  robots: DEFAULT_ROBOTS,
  type: 'website',
  imagePath: DEFAULT_IMAGE_PATH,
  imageAlt: DEFAULT_IMAGE_ALT,
}

function getConfiguredBaseUrl(): string {
  const configuredBaseUrl = (import.meta.env.VITE_APP_BASE_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, '')

  const looksLocal = configuredBaseUrl
    ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBaseUrl)
    : false

  if (import.meta.env.PROD) {
    if (configuredBaseUrl && !looksLocal) {
      return configuredBaseUrl
    }

    return FALLBACK_BASE_URL
  }

  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '')
  }

  return FALLBACK_BASE_URL
}

export function getPublicAbsoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getConfiguredBaseUrl()}${normalizedPath}`
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.content = content
}

function upsertCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }

  element.href = href
}

function clearJsonLd(): void {
  document.getElementById(JSON_LD_ELEMENT_ID)?.remove()
}

function upsertJsonLd(jsonLd?: JsonLd): void {
  clearJsonLd()

  if (!jsonLd) {
    return
  }

  const element = document.createElement('script')
  element.id = JSON_LD_ELEMENT_ID
  element.type = 'application/ld+json'
  element.textContent = JSON.stringify(jsonLd)
  document.head.appendChild(element)
}

export function applySeo(config: SeoConfig): void {
  const resolvedConfig = {
    ...defaultSeoConfig,
    ...config,
  }
  const canonicalUrl = getPublicAbsoluteUrl(resolvedConfig.path)
  const imageUrl = getPublicAbsoluteUrl(resolvedConfig.imagePath ?? DEFAULT_IMAGE_PATH)
  const imageAlt = resolvedConfig.imageAlt ?? DEFAULT_IMAGE_ALT

  document.title = resolvedConfig.title

  upsertCanonical(canonicalUrl)
  upsertMeta('name', 'description', resolvedConfig.description)
  upsertMeta('name', 'robots', resolvedConfig.robots ?? DEFAULT_ROBOTS)
  upsertMeta('property', 'og:locale', 'id_ID')
  upsertMeta('property', 'og:type', resolvedConfig.type ?? 'website')
  upsertMeta('property', 'og:site_name', SITE_NAME)
  upsertMeta('property', 'og:title', resolvedConfig.title)
  upsertMeta('property', 'og:description', resolvedConfig.description)
  upsertMeta('property', 'og:url', canonicalUrl)
  upsertMeta('property', 'og:image', imageUrl)
  upsertMeta('property', 'og:image:alt', imageAlt)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', resolvedConfig.title)
  upsertMeta('name', 'twitter:description', resolvedConfig.description)
  upsertMeta('name', 'twitter:image', imageUrl)
  upsertMeta('name', 'twitter:image:alt', imageAlt)
  upsertJsonLd(resolvedConfig.jsonLd)
}

export function resetSeo(): void {
  applySeo(defaultSeoConfig)
}

export function usePageSeo(config: SeoConfig): void {
  const {
    description,
    imageAlt,
    imagePath,
    jsonLd,
    path,
    robots,
    title,
    type,
  } = config
  const jsonLdSignature = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    applySeo({
      title,
      description,
      path,
      robots,
      type,
      imagePath,
      imageAlt,
      jsonLd,
    })

    return () => {
      resetSeo()
    }
  }, [description, imageAlt, imagePath, jsonLd, jsonLdSignature, path, robots, title, type])
}
