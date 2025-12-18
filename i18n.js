// i18n Module - Internationalization support
const i18n = (function() {
    const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh'];
    const DEFAULT_LANGUAGE = 'ko';
    const STORAGE_KEY = 'md-printer-language';

    let currentLanguage = DEFAULT_LANGUAGE;
    let translations = {};

    // Detect browser language
    function detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        // Extract language code (e.g., 'en-US' -> 'en', 'ko-KR' -> 'ko')
        const langCode = browserLang.split('-')[0].toLowerCase();

        // Return if supported, otherwise return default
        return SUPPORTED_LANGUAGES.includes(langCode) ? langCode : DEFAULT_LANGUAGE;
    }

    // Load translation JSON file
    async function loadLanguage(lang) {
        try {
            const response = await fetch(`i18n/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load language file: ${lang}.json`);
            }
            translations = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading language file:', error);
            // Fallback to default language
            if (lang !== DEFAULT_LANGUAGE) {
                return loadLanguage(DEFAULT_LANGUAGE);
            }
            return false;
        }
    }

    // Get translated string by key (supports nested keys like 'app.title')
    function t(key) {
        const keys = key.split('.');
        let value = translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // Return key itself if translation not found
            }
        }

        return value;
    }

    // Update all DOM elements with data-i18n attribute
    function updateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = t(key);
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = currentLanguage;
    }

    // Set language and update UI
    async function setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return false;
        }

        currentLanguage = lang;

        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            console.warn('Failed to save language preference:', error);
        }

        // Load translations
        await loadLanguage(lang);

        // Update DOM
        updateDOM();

        // Update language selector if exists
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = lang;
        }

        // Dispatch custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

        return true;
    }

    // Get current language
    function getCurrentLanguage() {
        return currentLanguage;
    }

    // Get saved language from localStorage
    function getSavedLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to load saved language:', error);
            return null;
        }
    }

    // Initialize i18n system
    async function init() {
        // Priority: saved language > browser language > default language
        const savedLang = getSavedLanguage();
        const initialLang = savedLang || detectBrowserLanguage();

        await setLanguage(initialLang);

        // Setup language selector event listener
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', async (e) => {
                await setLanguage(e.target.value);
            });
        }

        console.log(`i18n initialized with language: ${currentLanguage}`);
    }

    // Public API
    return {
        init,
        t,
        setLanguage,
        getCurrentLanguage,
        SUPPORTED_LANGUAGES
    };
})();

// Export for use in other scripts
window.i18n = i18n;
