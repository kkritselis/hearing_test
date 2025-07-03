export class ResultsHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.results = {
            left: [],
            right: []
        };
        this.setupCanvas();
    }

    setupCanvas() {
        // Get the device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        
        // Get the container's computed dimensions
        const container = this.canvas.parentElement;
        const containerStyle = getComputedStyle(container);
        const width = parseInt(containerStyle.width, 10);
        const height = parseInt(containerStyle.height, 10);
        
        console.log('Container dimensions:', { width, height, dpr });

        // Set canvas dimensions accounting for device pixel ratio
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Scale canvas CSS dimensions
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        // Scale the context to ensure correct drawing
        this.ctx.scale(dpr, dpr);
        
        // Set up canvas styling
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.font = '14px sans-serif';

        console.log('Canvas setup complete:', {
            cssWidth: width,
            cssHeight: height,
            pixelWidth: this.canvas.width,
            pixelHeight: this.canvas.height,
            dpr
        });
    }

    addResult(frequency, dB, ear) {
        console.log('Adding result:', { frequency, dB, ear });
        if (!this.results[ear]) {
            this.results[ear] = [];
        }
        this.results[ear].push({ frequency, dB });
        console.log('Current results:', this.results);
    }

    drawAudiogram() {
        console.log('Drawing audiogram with results:', this.results);
        
        const padding = {
            top: 40,
            right: 40,  // Increased right padding
            bottom: 60,
            left: 70
        };
        
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const canvasHeight = this.canvas.height / window.devicePixelRatio;
        
        const width = canvasWidth - (padding.left + padding.right);
        const height = canvasHeight - (padding.top + padding.bottom);

        console.log('Canvas dimensions:', {
            canvasWidth,
            canvasHeight,
            width,
            height,
            padding
        });

        // Draw axes and labels
        this.drawAxes(padding, width, height);
        
        // Plot results for each ear
        if (this.results.left.length > 0) {
            console.log('Drawing left ear results');
            this.plotEarResults(this.results.left, padding, width, height, '#4169E1', 'left');
        }
        
        if (this.results.right.length > 0) {
            console.log('Drawing right ear results');
            this.plotEarResults(this.results.right, padding, width, height, '#E14169', 'right');
        }
        
        // Draw legend
        this.drawLegend(padding);
    }

    drawAxes(padding, width, height) {
        const frequencies = [250, 500, 1000, 2000, 4000, 8000];
        const dBLevels = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

        // Clear the entire canvas first
        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        // Set styles for grid
        this.ctx.strokeStyle = '#333333';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.lineWidth = 0.5;
        
        // Draw grid
        this.ctx.beginPath();
        // Vertical grid lines (frequencies)
        frequencies.forEach((freq, index) => {
            const x = Math.round(padding.left + (width * (index / (frequencies.length - 1))));
            this.ctx.moveTo(x, padding.top);
            this.ctx.lineTo(x, height + padding.top);
        });
        // Horizontal grid lines (dB levels)
        dBLevels.forEach((dB, index) => {
            const y = Math.round(padding.top + (height * (index / (dBLevels.length - 1))));
            this.ctx.moveTo(padding.left, y);
            this.ctx.lineTo(width + padding.left, y);
        });
        this.ctx.stroke();

        // Draw main axes with thicker lines
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        // Vertical axis (dB levels)
        this.ctx.moveTo(padding.left, padding.top);
        this.ctx.lineTo(padding.left, height + padding.top);
        // Horizontal axis (frequencies)
        this.ctx.moveTo(padding.left, height + padding.top);
        this.ctx.lineTo(width + padding.left, height + padding.top);
        this.ctx.stroke();

        // Set text properties
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px sans-serif';

        // Draw frequency labels (x-axis)
        frequencies.forEach((freq, index) => {
            const x = Math.round(padding.left + (width * (index / (frequencies.length - 1))));
            
            // Draw tick
            this.ctx.beginPath();
            this.ctx.moveTo(x, height + padding.top);
            this.ctx.lineTo(x, height + padding.top + 5);
            this.ctx.stroke();
            
            // Format and draw frequency label
            const freqLabel = freq >= 1000 ? `${freq/1000}k` : freq;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${freqLabel}`, x, height + padding.top + 20);
        });

        // Draw dB labels (y-axis)
        dBLevels.forEach((dB, index) => {
            const y = Math.round(padding.top + (height * (index / (dBLevels.length - 1))));
            
            // Draw tick
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left - 5, y);
            this.ctx.lineTo(padding.left, y);
            this.ctx.stroke();
            
            // Draw dB label
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${dB}`, padding.left - 10, y + 5);
        });

        // Draw axis labels with better positioning
        // Y-axis label (Hearing Level)
        this.ctx.save();
        this.ctx.translate(padding.left - 35, height / 2 + padding.top);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Hearing Level (dB)', 0, 0);
        this.ctx.restore();
        
        // X-axis label (Frequency)
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Frequency (Hz)', padding.left + width / 2, height + padding.top + 40);
    }

    plotEarResults(earResults, padding, width, height, color, ear) {
        const frequencies = [250, 500, 1000, 2000, 4000, 8000];
        const maxDB = 90;
        const minDB = -10;
        const dbRange = maxDB - minDB;

        console.log(`Plotting ${ear} ear results:`, earResults);

        // Sort results by frequency to ensure proper line connection
        earResults.sort((a, b) => a.frequency - b.frequency);

        // Draw connecting lines
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;

        earResults.forEach((result, index) => {
            const freqIndex = frequencies.indexOf(result.frequency);
            if (freqIndex === -1) {
                console.warn('Frequency not found in scale:', result.frequency);
                return;
            }

            // Calculate x position based on frequency index
            const xPos = freqIndex / (frequencies.length - 1);
            const x = Math.round(padding.left + (width * xPos));

            // Calculate y position (invert the scale since higher dB means worse hearing)
            // Map dB value from [minDB, maxDB] to [0, 1] range
            const dbNormalized = (result.dB - minDB) / dbRange;
            // Then map to canvas coordinates
            const y = Math.round(padding.top + (height * dbNormalized));

            console.log(`Point ${index}:`, { 
                x, y, 
                frequency: result.frequency, 
                dB: result.dB,
                xPos,
                dbNormalized
            });

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();

        // Draw points and labels
        earResults.forEach(result => {
            const freqIndex = frequencies.indexOf(result.frequency);
            if (freqIndex === -1) return;

            // Use same coordinate calculations as above
            const xPos = freqIndex / (frequencies.length - 1);
            const x = Math.round(padding.left + (width * xPos));
            const dbNormalized = (result.dB - minDB) / dbRange;
            const y = Math.round(padding.top + (height * dbNormalized));

            // Draw point
            this.ctx.beginPath();
            this.ctx.fillStyle = color;
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Add dB value label
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${result.dB}`, x, y - 10);
        });
    }

    drawLegend(padding) {
        const legendY = padding.top - 20;
        
        // Left ear legend
        this.ctx.fillStyle = '#4169E1';
        this.ctx.beginPath();
        this.ctx.arc(padding.left + 10, legendY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Left Ear', padding.left + 20, legendY + 4);
        
        // Right ear legend
        this.ctx.fillStyle = '#E14169';
        this.ctx.beginPath();
        this.ctx.arc(padding.left + 100, legendY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText('Right Ear', padding.left + 110, legendY + 4);
    }

    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            results: {
                left: this.results.left.map(result => ({
                    frequency: result.frequency,
                    dB: result.dB,
                    status: this.getHearingStatus(result.dB)
                })),
                right: this.results.right.map(result => ({
                    frequency: result.frequency,
                    dB: result.dB,
                    status: this.getHearingStatus(result.dB)
                }))
            }
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

    downloadResults() {
        const report = this.generateReport();
        console.log('Downloading results:', report);
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `hearing-test-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
} 