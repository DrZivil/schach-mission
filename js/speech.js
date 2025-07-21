/**
 * Speech System - Text-to-Speech functionality for mission instructions
 */

class SpeechSystem {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSupported = 'speechSynthesis' in window;
        this.voices = [];
        this.preferredVoice = null;
        
        if (this.isSupported) {
            this.initializeVoices();
        }
    }

    initializeVoices() {
        // Load voices
        const loadVoices = () => {
            this.voices = this.synthesis.getVoices();
            this.selectPreferredVoice();
        };

        // Voices might not be loaded immediately
        if (this.voices.length === 0) {
            this.synthesis.addEventListener('voiceschanged', loadVoices);
        }
        loadVoices();
    }

    selectPreferredVoice() {
        if (this.voices.length === 0) return;

        // Prefer German voices, then English, then any
        const germanVoices = this.voices.filter(voice => 
            voice.lang.startsWith('de') && voice.localService
        );
        
        const englishVoices = this.voices.filter(voice =>
            voice.lang.startsWith('en') && voice.localService
        );

        if (germanVoices.length > 0) {
            this.preferredVoice = germanVoices[0];
        } else if (englishVoices.length > 0) {
            this.preferredVoice = englishVoices[0];
        } else if (this.voices.length > 0) {
            this.preferredVoice = this.voices[0];
        }

        console.log('Selected voice:', this.preferredVoice?.name, this.preferredVoice?.lang);
    }

    speak(text, options = {}) {
        if (!this.isSupported) {
            console.warn('Speech synthesis not supported');
            return false;
        }

        // Stop any current speech
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure utterance
        utterance.voice = this.preferredVoice;
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 0.8;

        // Event handlers
        utterance.onstart = () => {
            console.log('Speech started:', text);
            this.onSpeechStart();
        };

        utterance.onend = () => {
            console.log('Speech ended');
            this.currentUtterance = null;
            this.onSpeechEnd();
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            this.currentUtterance = null;
            this.onSpeechEnd();
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
        
        return true;
    }

    stop() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
            this.currentUtterance = null;
            this.onSpeechEnd();
        }
    }

    isSpeaking() {
        return this.synthesis.speaking;
    }

    onSpeechStart() {
        // Update UI to show speech is active
        const speakBtn = document.getElementById('speak-btn');
        if (speakBtn) {
            speakBtn.innerHTML = '🔇';
            speakBtn.title = 'Vorlesen stoppen';
            speakBtn.classList.add('speaking');
        }
    }

    onSpeechEnd() {
        // Reset UI
        const speakBtn = document.getElementById('speak-btn');
        if (speakBtn) {
            speakBtn.innerHTML = '🔊';
            speakBtn.title = 'Anweisung vorlesen';
            speakBtn.classList.remove('speaking');
        }
    }

    // Utility methods for different content types
    speakInstruction(instruction) {
        return this.speak(instruction, { rate: 0.85 });
    }

    speakGoal(goal) {
        return this.speak(`Ziel: ${goal}`, { rate: 0.9 });
    }

    speakFeedback(message, isPositive = true) {
        const rate = isPositive ? 1.0 : 0.8;
        return this.speak(message, { rate });
    }

    speakHint(hint) {
        return this.speak(`Tipp: ${hint}`, { rate: 0.85 });
    }
}

// Global speech system instance
const speechSystem = new SpeechSystem();
window.speechSystem = speechSystem;
