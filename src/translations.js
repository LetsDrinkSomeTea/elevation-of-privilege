/**
 * Language translations for Elevation of Privilege game
 */

export const translations = {
    en: {
        yourHand: 'Your Hand',
        cardSize: 'Card Size:',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        xlarge: 'XL',
        back: 'Back',
        helpTitle: 'Help (H)',
        clickToMark: 'Click or tap a card to mark it as "played". Press',
        forHelp: 'for help.',
        player: 'Player',
        of: 'of',
        seed: 'Seed:',
        players: 'Players',
        played: 'played',
        hostView: 'HOST VIEW',
        helpHeading: 'Help & Keyboard Shortcuts',
        howToPlayHeading: 'How to Play',
        howToPlay1: 'Click or tap a card to mark it as "played"',
        howToPlay2: 'Your played state is automatically saved',
        howToPlay3: 'Use the size controls to adjust card size',
        keyboardShortcuts: 'Keyboard Shortcuts',
        toggleCard: 'Toggle card played state',
        navigateCards: 'Navigate between cards',
        showHelp: 'Show this help',
        gameRules: 'Game Rules',
        gameRulesText: 'For complete rules, see the',
        eopGame: 'Elevation of Privilege card game',
        gotIt: 'Got it!',
        setupTitle: 'Elevation of Privilege - Setup',
        seedLabel: 'Seed:',
        seedPlaceholder: 'e.g. Workshop2026',
        playersLabel: 'Number of Players:',
        generateLinks: 'Generate Links',
        copyAllLinks: 'Copy All Links',
        allLinksCopied: 'All Links Copied',
        hostLink: 'Host Link',
        hostLinkDesc: 'For the moderator (screen sharing):',
        playerLinks: 'Player Links',
        playerLinksDesc: 'Share these links with the players:',
        copy: 'Copy',
        copied: 'Copied',
        enterSeed: 'Please enter a seed',
        validPlayers: 'Please enter a valid number of players (2-32)',
        gameLinks: 'Elevation of Privilege - Game Links',
        host: 'Host',
        errorNoSeed: 'Error: No seed found in URL',
        errorInvalidPlayers: 'Error: Invalid player count. Must be between 2-32 players.',
        errorMissingParams: 'Error: Missing or invalid parameters in URL'
    },
    de: {
        yourHand: 'Deine Hand',
        cardSize: 'Kartengröße:',
        small: 'Klein',
        medium: 'Mittel',
        large: 'Groß',
        xlarge: 'XL',
        back: 'Zurück',
        helpTitle: 'Hilfe (H)',
        clickToMark: 'Klicke auf eine Karte, um sie als "gespielt" zu markieren. Drücke',
        forHelp: 'für Hilfe.',
        player: 'Spieler',
        of: 'von',
        seed: 'Seed:',
        players: 'Spieler',
        played: 'gespielt',
        hostView: 'HOST ANSICHT',
        helpHeading: 'Hilfe & Tastaturkürzel',
        howToPlayHeading: 'Spielanleitung',
        howToPlay1: 'Klicke oder tippe auf eine Karte, um sie als "gespielt" zu markieren',
        howToPlay2: 'Dein Spielstatus wird automatisch gespeichert',
        howToPlay3: 'Verwende die Größensteuerung, um die Kartengröße anzupassen',
        keyboardShortcuts: 'Tastaturkürzel',
        toggleCard: 'Kartenstatus umschalten',
        navigateCards: 'Zwischen Karten navigieren',
        showHelp: 'Diese Hilfe anzeigen',
        gameRules: 'Spielregeln',
        gameRulesText: 'Die vollständigen Regeln findest du im',
        eopGame: 'Elevation of Privilege Kartenspiel',
        gotIt: 'Verstanden!',
        setupTitle: 'Elevation of Privilege - Einrichtung',
        seedLabel: 'Seed:',
        seedPlaceholder: 'z.B. Workshop2026',
        playersLabel: 'Anzahl Spieler:',
        generateLinks: 'Links generieren',
        copyAllLinks: 'Alle Links kopieren',
        allLinksCopied: 'Alle Links kopiert',
        hostLink: 'Host-Link',
        hostLinkDesc: 'Für den Moderator (Bildschirm teilen):',
        playerLinks: 'Spieler-Links',
        playerLinksDesc: 'Teile diese Links mit den Spielern:',
        copy: 'Kopieren',
        copied: 'Kopiert',
        enterSeed: 'Bitte Seed eingeben',
        validPlayers: 'Bitte gültige Spieleranzahl eingeben (2-32)',
        gameLinks: 'Elevation of Privilege - Spiellinks',
        host: 'Host',
        errorNoSeed: 'Fehler: Kein Seed in URL gefunden',
        errorInvalidPlayers: 'Fehler: Ungültige Spieleranzahl. Muss zwischen 2-32 Spielern sein.',
        errorMissingParams: 'Fehler: Fehlende oder ungültige Parameter in URL'
    }
};

const STORAGE_KEY_LANGUAGE = 'eop_language';
let currentLanguage = 'en';

/**
 * Gets the current language from localStorage or browser preference
 */
export function initLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (saved && (saved === 'en' || saved === 'de')) {
        currentLanguage = saved;
    } else {
        const browserLang = navigator.language || navigator.userLanguage;
        currentLanguage = browserLang.startsWith('de') ? 'de' : 'en';
    }
    document.documentElement.setAttribute('lang', currentLanguage);
    return currentLanguage;
}

/**
 * Gets a translated string
 * @param {string} key - Translation key
 * @returns {string} Translated string
 */
export function t(key) {
    return translations[currentLanguage][key] || key;
}

/**
 * Toggles between English and German
 */
export function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'de' : 'en';
    localStorage.setItem(STORAGE_KEY_LANGUAGE, currentLanguage);
    document.documentElement.setAttribute('lang', currentLanguage);
    window.location.reload();
}

/**
 * Gets the current language code
 * @returns {string} Current language code ('en' or 'de')
 */
export function getCurrentLanguage() {
    return currentLanguage;
}
