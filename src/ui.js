/**
 * UI helper functions for Elevation of Privilege game
 */

import { t, getCurrentLanguage } from './translations.js';

/**
 * Updates the card counter display
 * @param {number} playedCount - Number of played cards
 * @param {number} totalCount - Total number of cards
 */
export function updateCardCounter(playedCount, totalCount) {
    let counter = document.getElementById('card-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'card-counter';
        counter.className = 'card-counter';
        document.querySelector('.header-bar').appendChild(counter);
    }
    counter.textContent = `${playedCount} ${t('of')} ${totalCount} ${t('played')}`;
}

/**
 * Updates UI elements with current language
 */
export function updateUILanguage() {
    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = getCurrentLanguage() === 'en' ? 'DE' : 'EN';
    }
    
    const sizeLabels = document.querySelectorAll('.size-controls span');
    if (sizeLabels.length > 0) {
        sizeLabels[0].textContent = t('cardSize');
    }
    
    const sizeSmall = document.getElementById('size-small');
    const sizeMedium = document.getElementById('size-medium');
    const sizeLarge = document.getElementById('size-large');
    const sizeXLarge = document.getElementById('size-xlarge');
    
    if (sizeSmall) sizeSmall.textContent = t('small');
    if (sizeMedium) sizeMedium.textContent = t('medium');
    if (sizeLarge) sizeLarge.textContent = t('large');
    if (sizeXLarge) sizeXLarge.textContent = t('xlarge');
    
    const helpBtn = document.querySelector('.help-btn');
    if (helpBtn) helpBtn.title = t('helpTitle');
    
    const backBtns = document.querySelectorAll('.small-btn');
    backBtns.forEach(btn => {
        if (btn.textContent.includes('Back') || btn.textContent.includes('Zurück')) {
            btn.textContent = t('back');
        }
    });
    
    const instructionText = document.querySelector('.instruction-text');
    if (instructionText) {
        instructionText.innerHTML = `${t('clickToMark')} <kbd>H</kbd> ${t('forHelp')}`;
    }
}

/**
 * Creates and shows the help modal
 */
export function createHelpModal() {
    const modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.className = 'modal';
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeHelpModal();
        }
    };
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="closeHelpModal()">&times;</span>
            <h2>${t('helpHeading')}</h2>
            
            <h3>${t('howToPlayHeading')}</h3>
            <ul>
                <li>${t('howToPlay1')}</li>
                <li>${t('howToPlay2')}</li>
                <li>${t('howToPlay3')}</li>
            </ul>
            
            <h3>${t('keyboardShortcuts')}</h3>
            <table class="shortcuts-table">
                <tr><td><kbd>Space</kbd> / <kbd>Enter</kbd></td><td>${t('toggleCard')}</td></tr>
                <tr><td><kbd>←</kbd> / <kbd>→</kbd></td><td>${t('navigateCards')}</td></tr>
                <tr><td><kbd>H</kbd> / <kbd>?</kbd></td><td>${t('showHelp')}</td></tr>
            </table>
            
            <h3>${t('gameRules')}</h3>
            <p>${t('gameRulesText')} <a href="https://github.com/adamshostack/eop" target="_blank">${t('eopGame')}</a>.</p>
            
            <button onclick="closeHelpModal()" class="primary-btn">${t('gotIt')}</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

/**
 * Shows the help modal
 */
export function showHelpModal() {
    let modal = document.getElementById('help-modal');
    if (!modal) {
        modal = createHelpModal();
    }
    modal.style.display = 'flex';
}

/**
 * Closes the help modal
 */
export function closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}
