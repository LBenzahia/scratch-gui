class EchoEffect {
    constructor (audioContext, delayTime) {
        this.audioContext = audioContext;
        this.delayTime = delayTime;

        this.input = this.audioContext.createGain();

        this.delay = this.audioContext.createDelay(1);
        this.delay.delayTime.value = delayTime;
        this.decay = this.audioContext.createGain(); // @todo chain
        this.decay.gain.value = 0.5;

        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -50;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;

        this.output = this.audioContext.createGain();

        this.input.connect(this.delay);
        if (delayTime !== 0) {
            this.delay.connect(this.compressor);
        }
        this.input.connect(this.compressor);
        this.delay.connect(this.decay);
        this.decay.connect(this.delay);
        this.compressor.connect(this.output);
    }

    dispose () {
        // @todo dispose properly?
    }
}

module.exports = EchoEffect;
