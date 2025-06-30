import { AudioHandler } from './audioHandler.js';
import { ResultsHandler } from './resultsHandler.js';

class HearingTest {
    constructor() {
        this.audioHandler = new AudioHandler();
        this.resultsHandler = new ResultsHandler('audiogram');
        
        this.currentScreen = 'welcome-screen';
        this.testInProgress = false;
        
        // Test parameters
        this.maxDB = 90;
        this.minDB = -10;
        this.dbStep = 5;
        this.currentDB = this.maxDB;
        
        this.initializeEventListeners();
        console.log('HearingTest initialized');
    }

    initializeEventListeners() {
        // Welcome screen
        document.getElementById('start-calibration').addEventListener('click', () => this.showScreen('calibration-screen'));

        // Calibration screen
        document.getElementById('play-calibration').addEventListener('click', () => this.playCalibrationTone());
        document.getElementById('start-test').addEventListener('click', () => this.startTest());

        // Test screen
        document.getElementById('heard-tone').addEventListener('click', () => this.handleHeardResponse());

        // Results screen
        document.getElementById('download-results').addEventListener('click', () => this.resultsHandler.downloadResults());
        document.getElementById('restart-test').addEventListener('click', () => this.restart());

        // Add no-response timeout
        document.getElementById('test-screen').addEventListener('click', (e) => {
            // If they clicked anywhere but the "heard it" button, count as "not heard"
            if (e.target.id !== 'heard-tone' && this.testInProgress) {
                this.handleNotHeardResponse();
            }
        });
    }

    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show requested screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;

        // Update test instruction if showing test screen
        if (screenId === 'test-screen') {
            this.updateTestInstruction();
        }
    }

    updateTestInstruction() {
        const instruction = document.getElementById('test-instruction');
        if (instruction) {
            const text = `Click the button when you hear the tone in your ${this.audioHandler.currentEar} ear (${this.audioHandler.currentFrequency}Hz at ${this.currentDB}dB)`;
            instruction.textContent = text;
            console.log('Updated instruction:', text);
        }
    }

    async playCalibrationTone() {
        console.log('Playing calibration tone');
        const success = await this.audioHandler.playCalibrationTone();
        if (!success) {
            alert('Failed to play calibration tone. Please check your audio settings and try again.');
        }
    }

    async startTest() {
        console.log('Starting test');
        this.showScreen('test-screen');
        this.testInProgress = true;
        
        // Start with left ear
        this.audioHandler.setTestEar('left');
        
        // Reset test state and start with first frequency
        this.currentDB = this.maxDB;
        await this.startFrequencyTest(this.audioHandler.frequencies[0]);
    }

    async startFrequencyTest(frequency) {
        console.log('Testing frequency:', frequency, 'at', this.currentDB, 'dB');
        const success = await this.audioHandler.playTone(frequency, this.currentDB);
        
        if (!success) {
            alert('Failed to play test tone. Please check your audio settings and try again.');
            this.showScreen('calibration-screen');
            return;
        }

        // Update progress bar
        const totalSteps = this.audioHandler.frequencies.length * 2; // Both ears
        const currentStep = (this.audioHandler.frequencies.indexOf(frequency) + 
            (this.audioHandler.currentEar === 'right' ? this.audioHandler.frequencies.length : 0));
        const progress = (currentStep / totalSteps) * 100;
        
        document.querySelector('.progress').style.width = `${progress}%`;
        console.log('Progress:', progress + '%');
        
        // Update instruction for current ear
        this.updateTestInstruction();

        // Set timeout for response
        setTimeout(() => {
            if (this.testInProgress && 
                this.audioHandler.currentFrequency === frequency && 
                this.audioHandler.currentGain === this.currentDB) {
                console.log('No response timeout - treating as not heard');
                this.handleNotHeardResponse();
            }
        }, 3000); // 3 seconds to respond
    }

    async handleHeardResponse() {
        if (!this.testInProgress) return;

        console.log('User heard tone:', {
            frequency: this.audioHandler.currentFrequency,
            dB: this.currentDB,
            ear: this.audioHandler.currentEar
        });

        this.audioHandler.stopTone();
        
        // Record the current result and move to next frequency
        this.resultsHandler.addResult(
            this.audioHandler.currentFrequency, 
            this.currentDB,
            this.audioHandler.currentEar
        );
        
        // Get next frequency
        const nextFrequency = this.audioHandler.getNextFrequency();
        
        if (nextFrequency) {
            // Reset volume for new frequency
            this.currentDB = this.maxDB;
            // Continue with next frequency
            await this.startFrequencyTest(nextFrequency);
        } else {
            // Test complete
            this.completeTest();
        }
    }

    async handleNotHeardResponse() {
        if (!this.testInProgress) return;

        console.log('User did not hear tone:', {
            frequency: this.audioHandler.currentFrequency,
            dB: this.currentDB,
            ear: this.audioHandler.currentEar
        });

        this.audioHandler.stopTone();
        
        // Decrease volume and try again
        this.currentDB -= this.dbStep;
        
        // If we've reached the minimum volume without response
        if (this.currentDB < this.minDB) {
            console.log('Reached minimum volume - recording as not heard');
            // Record as not heard at max dB
            this.resultsHandler.addResult(
                this.audioHandler.currentFrequency, 
                this.maxDB,
                this.audioHandler.currentEar
            );
            
            // Move to next frequency
            const nextFrequency = this.audioHandler.getNextFrequency();
            if (nextFrequency) {
                this.currentDB = this.maxDB;
                await this.startFrequencyTest(nextFrequency);
            } else {
                this.completeTest();
            }
        } else {
            // Try again at lower volume
            await this.startFrequencyTest(this.audioHandler.currentFrequency);
        }
    }

    completeTest() {
        console.log('Test complete - showing results');
        this.testInProgress = false;
        this.showScreen('results-screen');
        this.resultsHandler.drawAudiogram();
    }

    restart() {
        console.log('Restarting test');
        // Reset all handlers
        this.audioHandler = new AudioHandler();
        this.resultsHandler = new ResultsHandler('audiogram');
        this.currentDB = this.maxDB;
        
        // Show welcome screen
        this.showScreen('welcome-screen');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new HearingTest();
}); 