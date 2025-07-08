export class AudioHandler {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.pannerNode = null;
        this.isPlaying = false;
        
        // Test frequencies in Hz (from low to high)
        this.frequencies = [250, 500, 1000, 2000, 4000, 8000];
        
        // Current test state
        this.currentFrequency = null;
        this.currentGain = null;
        this.currentEar = 'left'; // Default to left ear first
    }

    async initialize() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({
                latencyHint: 'interactive',
                sampleRate: 44100
            });
            
            // Create and connect nodes
            this.gainNode = this.audioContext.createGain();
            this.pannerNode = new StereoPannerNode(this.audioContext, { pan: -1 }); // Start with left ear
            
            // Connect the nodes
            this.gainNode.connect(this.pannerNode);
            this.pannerNode.connect(this.audioContext.destination);
            
            console.log('Audio context initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Web Audio API:', error);
            return false;
        }
    }

    async playCalibrationTone() {
        if (!this.audioContext) await this.initialize();
        
        // Use 1000 Hz as calibration tone, play in both ears
        this.pannerNode.pan.setValueAtTime(0, this.audioContext.currentTime);
        console.log('Playing calibration tone in both ears');
        
        // Hide both controls initially (in case of replays)
        document.querySelector('.volume-adjustment').classList.add('hidden');
        document.querySelector('.continue-controls').classList.add('hidden');
        
        // Play the tone
        const result = await this.playTone(1000, -20); // -20 dB as a comfortable starting volume
        
        if (result) {
            // Show volume adjustment text immediately
            document.querySelector('.volume-adjustment').classList.remove('hidden');
            
            // Show the continue button after 5 seconds
            setTimeout(() => {
                document.querySelector('.continue-controls').classList.remove('hidden');
            }, 5000);
        }
        
        return result;
    }

    setTestEar(ear) {
        this.currentEar = ear;
        const panValue = ear === 'left' ? -1 : 1;
        this.pannerNode.pan.setValueAtTime(panValue, this.audioContext.currentTime);
        console.log(`Switched to ${ear} ear, pan value: ${panValue}`);
    }

    async playTone(frequency, decibels) {
        if (this.isPlaying) this.stopTone();

        try {
            // Convert decibels to gain value (normalize to avoid excessive volume)
            const gainValue = Math.min(1.0, Math.pow(10, decibels / 20));
            
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            this.gainNode.gain.setValueAtTime(gainValue, this.audioContext.currentTime);
            
            this.oscillator.connect(this.gainNode);
            this.oscillator.start();
            this.isPlaying = true;
            this.currentFrequency = frequency;
            this.currentGain = decibels;

            console.log(`Playing ${frequency}Hz at ${decibels}dB in ${this.currentEar} ear`);
            return true;
        } catch (error) {
            console.error('Failed to play tone:', error);
            return false;
        }
    }

    stopTone() {
        if (this.oscillator && this.isPlaying) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.isPlaying = false;
            console.log('Tone stopped');
        }
    }

    // Get the next test frequency
    getNextFrequency() {
        if (!this.currentFrequency) {
            return this.frequencies[0];
        }
        
        const currentIndex = this.frequencies.indexOf(this.currentFrequency);
        if (currentIndex < this.frequencies.length - 1) {
            return this.frequencies[currentIndex + 1];
        }
        
        // If we've completed all frequencies for the current ear
        if (this.currentEar === 'left') {
            this.setTestEar('right');
            return this.frequencies[0];
        }
        
        return null; // No more frequencies to test
    }

    // Calculate hearing level in dB based on frequency response
    calculateHearingLevel(frequency, lowestHeardDB) {
        return {
            frequency,
            dB: lowestHeardDB,
            ear: this.currentEar,
            status: this.getHearingStatus(lowestHeardDB)
        };
    }

    getHearingStatus(dB) {
        if (dB <= 25) return 'Normal';
        if (dB <= 40) return 'Mild Loss';
        if (dB <= 55) return 'Moderate Loss';
        if (dB <= 70) return 'Moderately Severe Loss';
        if (dB <= 90) return 'Severe Loss';
        return 'Profound Loss';
    }
} 