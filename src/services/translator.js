import { ref } from 'vue'

export const SUPPORTED_LANGUAGES = [
  { code: 'pt', name: 'Português', label: 'PT', flag: '🇧🇷', country: 'Brasil' },
  { code: 'es', name: 'Español', label: 'ES', flag: '🇪🇸', country: 'España' },
  { code: 'en', name: 'English', label: 'EN', flag: '🇺🇸', country: 'USA' }
]

const STORAGE_KEY = 'didascalias_app_lang'

// Estado reativo global do idioma selecionado
export const currentLanguage = ref(localStorage.getItem(STORAGE_KEY) || 'pt')
export const isTranslating = ref(false)

/**
 * Define o cookie do Google Translate para sincronização imediata
 */
function setGoogleTranslateCookie(lang) {
  const cookieValue = lang === 'pt' ? '/pt/pt' : `/pt/${lang}`
  const hostname = window.location.hostname

  document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`

  if (hostname && hostname !== 'localhost' && !hostname.includes('127.0.0.1')) {
    document.cookie = `googtrans=${cookieValue}; domain=.${hostname}; path=/; max-age=31536000`
  }
}

/**
 * Limpa cookies de tradução quando retorna ao Português original
 */
function clearGoogleTranslateCookie() {
  const hostname = window.location.hostname
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  document.cookie = 'googtrans=/pt/pt; path=/; max-age=31536000'

  if (hostname && hostname !== 'localhost' && !hostname.includes('127.0.0.1')) {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${hostname}; path=/;`
    document.cookie = `googtrans=/pt/pt; domain=.${hostname}; path=/; max-age=31536000`
  }
}

/**
 * Inicializa o script e o widget do Google Translate
 */
export function initTranslator() {
  if (window._didascaliasTranslatorInitialized) return
  window._didascaliasTranslatorInitialized = true

  const savedLang = localStorage.getItem(STORAGE_KEY) || 'pt'
  currentLanguage.value = savedLang

  if (savedLang !== 'pt') {
    setGoogleTranslateCookie(savedLang)
  }

  window.googleTranslateElementInit = () => {
    try {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'pt',
            includedLanguages: 'pt,es,en',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        )

        // Se houver um idioma salvo previamente, aplica no combo
        if (savedLang && savedLang !== 'pt') {
          setTimeout(() => {
            applyLanguageToDom(savedLang)
          }, 300)
        }
      }
    } catch (e) {
      console.warn('Aviso na inicialização do tradutor:', e)
    }
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script')
    script.id = 'google-translate-script'
    script.type = 'text/javascript'
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.head.appendChild(script)
  }
}

/**
 * Dispara a mudança de valor no elemento interno do Google Translate
 */
function applyLanguageToDom(langCode) {
  const combo = document.querySelector('.goog-te-combo')
  if (combo) {
    combo.value = langCode
    combo.dispatchEvent(new Event('change'))
    return true
  }
  return false
}

/**
 * Altera o idioma do sistema
 */
export function changeLanguage(langCode) {
  if (!['pt', 'es', 'en'].includes(langCode)) return

  const prevLang = currentLanguage.value
  currentLanguage.value = langCode
  localStorage.setItem(STORAGE_KEY, langCode)

  if (langCode === 'pt') {
    clearGoogleTranslateCookie()
  } else {
    setGoogleTranslateCookie(langCode)
  }

  isTranslating.value = true

  const applied = applyLanguageToDom(langCode)

  if (!applied || prevLang !== 'pt' && langCode === 'pt') {
    // Se o combo não responder imediatamente ou voltando para PT, faz recarregamento suave
    setTimeout(() => {
      window.location.reload()
    }, 200)
  } else {
    setTimeout(() => {
      isTranslating.value = false
    }, 400)
  }
}
