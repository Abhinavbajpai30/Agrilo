import { createContext, useContext, useState, useEffect } from 'react'
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../utils/i18n'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [isLoading, setIsLoading] = useState(false)

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('agrilo_language')
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split('-')[0]
      if (SUPPORTED_LANGUAGES[browserLanguage]) {
        setCurrentLanguage(browserLanguage)
      }
    }
  }, [])

  // Update document language and direction when language changes
  useEffect(() => {
    const language = SUPPORTED_LANGUAGES[currentLanguage]
    if (language) {
      document.documentElement.lang = language.code
      document.documentElement.dir = language.direction
    }
  }, [currentLanguage])

  const changeLanguage = async (languageCode) => {
    if (!SUPPORTED_LANGUAGES[languageCode]) {
      console.warn(`Language ${languageCode} is not supported`)
      return
    }

    setIsLoading(true)

    try {
      // Simulate loading time for language change
      await new Promise(resolve => setTimeout(resolve, 300))

      setCurrentLanguage(languageCode)
      localStorage.setItem('agrilo_language', languageCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const translate = (key, fallback = null) => {
    const translation = getNestedValue(TRANSLATIONS[currentLanguage], key) ||
      getNestedValue(TRANSLATIONS.en, key) ||
      fallback ||
      key

    return translation
  }

  // Short alias for translate function
  const t = translate

  const getCurrentLanguage = () => SUPPORTED_LANGUAGES[currentLanguage]

  const getSupportedLanguages = () => Object.values(SUPPORTED_LANGUAGES)

  const isRTL = () => getCurrentLanguage()?.direction === 'rtl'

  const value = {
    currentLanguage,
    changeLanguage,
    translate,
    t, // Short alias
    getCurrentLanguage,
    getSupportedLanguages,
    isRTL,
    isLoading,
    SUPPORTED_LANGUAGES
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext