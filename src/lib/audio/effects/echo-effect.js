class EchoEffect {
    constructor (audioContext, delayTime) {
        this.audioContext = audioContext;
        this.delayTime = delayTime;

        this.input = this.audioContext.createGain();

        this.delay = this.audioContext.createDelay(1);
        this.delay.delayTime.value = delayTime;
        this.decay = this.audioContext.createGain(); // @todo chain
        this.decay.gain.value = 0.5;
        this.output = this.audioContext.createGain();

        this.input.connect(this.delay);
        if (delayTime !== 0) {
            this.delay.connect(this.output);
        }
        this.input.connect(this.output);
        this.delay.connect(this.decay);
        this.decay.connect(this.delay);
    }

    dispose () {
        // @todo dispose properly?
    }
}

module.exports = EchoEffect;
