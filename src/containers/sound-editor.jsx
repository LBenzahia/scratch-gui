const bindAll = require('lodash.bindall');
const PropTypes = require('prop-types');
const React = require('react');
const debounce = require('lodash.debounce');
const {connect} = require('react-redux');

const {computeRMS} = require('../lib/audio/audio-util.js');

const SoundEditorComponent = require('../components/sound-editor/sound-editor.jsx');
const AudioBufferPlayer = require('../lib/audio/audio-buffer-player.js');
const AudioEffects = require('../lib/audio/audio-effects.js');

const chipmunkIcon = require('../components/sound-editor/icon--chipmunk.svg');
const monsterIcon = require('../components/sound-editor/icon--monster.svg');
const echoIcon = require('../components/sound-editor/icon--echo.svg');
const reverseIcon = require('../components/sound-editor/icon--reverse.svg');
const robotIcon = require('../components/sound-editor/icon--robot.svg');
const trimIcon = require('../components/sound-editor/icon--trim.svg');

const getChunkLevels = (samples, chunkSize = 1024) => {
    const sampleCount = samples.length;
    const chunkLevels = [];
    for (let i = 0; i < sampleCount; i += chunkSize) {
        const maxIndex = Math.min(sampleCount - 1, i + chunkSize);
        chunkLevels.push(computeRMS(samples.slice(i, maxIndex), true));
    }
    return chunkLevels;
};

import SharedAudioContext from '../lib/audio/shared-audio-context.js';

const audioCtx = new SharedAudioContext();

class SoundEditor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleStoppedPlaying',
            'handleChangeName',
            'handlePlay',
            'handleStopPlaying',
            'handleUpdatePlayhead',
            'handleCancelEffect',
            'handleSubmitEffect',
            'handleUpdateEffect',
            'handleActivateEffect',
            'handleActivateTrim',
            'handleUpdateTrimEnd',
            'handleUpdateTrimStart',
            'handleReverse',
            'handleApplyEffect',
            'resetEffects'
        ]);
        this.state = {
            playhead: null, // null is not playing, [0 -> 1] is playing percent
            chunkLevels: getChunkLevels(this.props.samples),
            chipmunk: null,
            monster: null,
            echo: null,
            reverse: null,
            robot: null,
            trim: null,
            trimStart: null,
            trimEnd: null
        };
        this.handlePlay = debounce(this.handlePlay, 200);
        this.handleApplyEffect = debounce(this.handleApplyEffect, 200);
    }
    componentDidMount () {
        this.audioBufferPlayer = new AudioBufferPlayer(this.props.samples, this.props.sampleRate);
    }
    componentWillReceiveProps (newProps) {
        if (newProps.soundIndex !== this.props.soundIndex || newProps.samples !== this.props.samples) {
            this.audioBufferPlayer.stop();
            this.audioBufferPlayer = new AudioBufferPlayer(newProps.samples, newProps.sampleRate);
            this.setState({chunkLevels: getChunkLevels(newProps.samples)});
        }
    }
    componentWillUnmount () {
        this.audioBufferPlayer.stop();
    }
    resetEffects () {
        this.setState({
            chipmunk: null,
            monster: null,
            echo: null,
            reverse: null,
            robot: null,
            trim: null,
            trimStart: null,
            trimEnd: null
        });
    }
    handlePlay () {
        this.audioBufferPlayer.play(
            this.state.trimStart || 0,
            this.state.trimEnd || 1,
            this.handleUpdatePlayhead,
            this.handleStoppedPlaying);
    }
    handleStopPlaying () {
        this.audioBufferPlayer.stop();
        this.handleStoppedPlaying();
    }
    handleStoppedPlaying () {
        this.setState({playhead: null});
    }
    handleUpdatePlayhead (playhead) {
        this.setState({playhead});
    }
    handleChangeName (name) {
        this.props.onRenameSound(this.props.soundIndex, name);
    }
    handleSubmitEffect () {
        this.handleStopPlaying();

        const vm = this.props.vm;
        const sound = vm.editingTarget.sprite.sounds[this.props.soundIndex];
        const buffer = vm.runtime.audioEngine.audioBuffers[sound.md5];
        const samples = buffer.getChannelData(0);

        const pitch = this.state.monster ? 0.5 * (1 - this.state.monster) + 0.5 : (this.state.chipmunk ? this.state.chipmunk * 0.5 + 1 : 1);
        const echo = this.state.echo ? 0.5 * this.state.echo : 0;
        const audioEffects = new AudioEffects(samples, buffer.sampleRate, pitch, echo);
        audioEffects.apply().then(buffer => {
            const samples = buffer.getChannelData(0);
            vm.runtime.audioEngine.audioBuffers[sound.md5] = buffer;
            this.audioBufferPlayer = new AudioBufferPlayer(samples, buffer.sampleRate);
            this.setState({chunkLevels: getChunkLevels(samples)});
            // this.handlePlay();
            this.resetEffects();
        });
    }
    handleCancelEffect () {
        this.handleStopPlaying();
        this.setState({chunkLevels: getChunkLevels(this.props.samples)});
        this.resetEffects();
    }
    handleActivateEffect (effect) {
        this.resetEffects();
        this.setState({[effect]: this.state[effect] === null ? 0.25 : null});
        this.handleApplyEffect();
    }
    handleUpdateEffect (effect) {
        // Preview sound with effect?
        // vm.runtime.requestTargetsUpdate(vm.editingTarget);
        this.setState(effect);
        this.handleApplyEffect()
    }
    handleApplyEffect () {
        this.handleStopPlaying();

        const vm = this.props.vm;
        const sound = vm.editingTarget.sprite.sounds[this.props.soundIndex];
        const buffer = vm.runtime.audioEngine.audioBuffers[sound.md5];
        const samples = buffer.getChannelData(0);

        const pitch = this.state.monster ? 0.5 * (1 - this.state.monster) + 0.5 : (this.state.chipmunk ? this.state.chipmunk * 0.5 + 1 : 1);
        const echo = this.state.echo ? 0.5 * this.state.echo : 0;
        const audioEffects = new AudioEffects(samples, buffer.sampleRate, pitch, echo);
        audioEffects.apply().then(buffer => {
            const samples = buffer.getChannelData(0);
            // vm.runtime.audioEngine.audioBuffers[sound.md5] = buffer;
            this.audioBufferPlayer = new AudioBufferPlayer(samples, buffer.sampleRate);
            this.setState({chunkLevels: getChunkLevels(samples)});
            this.handlePlay();
        });
    }
    handleActivateTrim () {
        if (this.state.trimStart === null && this.state.trimEnd === null) {
            this.resetEffects();
            this.setState({trimEnd: 0.9, trimStart: 0.1, trim: true});
        } else {
            const vm = this.props.vm;
            const sound = vm.editingTarget.sprite.sounds[this.props.soundIndex];
            const buffer = vm.runtime.audioEngine.audioBuffers[sound.md5];
            const samples = buffer.getChannelData(0);
            const sampleCount = samples.length;
            const startIndex = Math.floor(this.state.trimStart * sampleCount);
            const endIndex = Math.floor(this.state.trimEnd * sampleCount);
            const clippedSamples = samples.slice(startIndex, endIndex);
            const newBuffer = audioCtx.createBuffer(1, clippedSamples.length, this.props.sampleRate);
            newBuffer.getChannelData(0).set(clippedSamples);
            vm.runtime.audioEngine.audioBuffers[sound.md5] = newBuffer;
            vm.runtime.requestTargetsUpdate(vm.editingTarget);
            this.resetEffects();
        }
    }
    handleUpdateTrimEnd (trimEnd) {
        this.setState({trimEnd});
    }
    handleUpdateTrimStart (trimStart) {
        this.setState({trimStart});
    }
    handleReverse () {
        this.handleStopPlaying();
        const vm = this.props.vm;
        const sound = vm.editingTarget.sprite.sounds[this.props.soundIndex];
        const buffer = vm.runtime.audioEngine.audioBuffers[sound.md5];
        const samples = buffer.getChannelData(0);
        const sampleCount = samples.length;
        const clippedSamples = samples.reverse()
        const newBuffer = audioCtx.createBuffer(1, clippedSamples.length, this.props.sampleRate);
        newBuffer.getChannelData(0).set(clippedSamples);
        vm.runtime.audioEngine.audioBuffers[sound.md5] = newBuffer;
        vm.runtime.requestTargetsUpdate(vm.editingTarget);
        this.resetEffects();
        this.handlePlay();

    }
    render () {
        return (
            <SoundEditorComponent
                chunkLevels={this.state.chunkLevels}
                effects={[
                    {
                        name: 'Chipmunk',
                        value: this.state.chipmunk,
                        active: this.state.chipmunk !== null,
                        icon: chipmunkIcon,
                        onActivate: () => this.handleActivateEffect('chipmunk'),
                        onChange: e => this.handleUpdateEffect({chipmunk: Number(e.target.value)}),
                        onSubmit: this.handleSubmitEffect,
                        onCancel: this.handleCancelEffect
                    },
                    {
                        name: 'Monster',
                        value: this.state.monster,
                        active: this.state.monster !== null,
                        icon: monsterIcon,
                        onActivate: () => this.handleActivateEffect('monster'),
                        onChange: e => this.handleUpdateEffect({monster: Number(e.target.value)}),
                        onSubmit: this.handleSubmitEffect,
                        onCancel: this.handleCancelEffect
                    },
                    {
                        name: 'Echo',
                        value: this.state.echo,
                        active: this.state.echo !== null,
                        icon: echoIcon,
                        onActivate: () => this.handleActivateEffect('echo'),
                        onChange: e => this.handleUpdateEffect({echo: Number(e.target.value)}),
                        onSubmit: this.handleSubmitEffect,
                        onCancel: this.handleCancelEffect
                    },
                    {
                        name: 'Robot',
                        value: this.state.robot,
                        active: this.state.robot !== null,
                        icon: robotIcon,
                        onActivate: () => this.handleActivateEffect('robot'),
                        onChange: e => this.handleUpdateEffect({robot: Number(e.target.value)}),
                        onSubmit: this.handleSubmitEffect,
                        onCancel: this.handleCancelEffect
                    },
                    {
                        name: 'Reverse',
                        value: this.state.reverse,
                        active: this.state.reverse !== null,
                        icon: reverseIcon,
                        isAdjustable: false,
                        onActivate: this.handleReverse,
                        onChange: e => this.handleUpdateEffect({reverse: Number(e.target.value)}),
                        onSubmit: this.handleSubmitEffect,
                        onCancel: this.handleCancelEffect
                    },
                    // {
                    //     name: 'Trim',
                    //     value: this.state.trim,
                    //     active: this.state.trim !== null,
                    //     icon: trimIcon,
                    //     isAdjustable: false,
                    //     onActivate: this.handleActivateTrim,
                    //     onChange: e => this.handleUpdateEffect({trim: Number(e.target.value)}),
                    //     onSubmit: this.handleActivateTrim,
                    //     onCancel: this.handleCancelEffect
                    // }
                ]}
                name={this.props.name}
                playhead={this.state.playhead}
                trimEnd={this.state.trimEnd}
                trimStart={this.state.trimStart}
                onChangeName={this.handleChangeName}
                onPlay={this.handlePlay}
                onSetTrimEnd={this.handleUpdateTrimEnd}
                onSetTrimStart={this.handleUpdateTrimStart}
                onStop={this.handleStopPlaying}
                onSetTrimStart={this.handleUpdateTrimStart}
                onSetTrimEnd={this.handleUpdateTrimEnd}
                onActiveTrim={this.handleActivateTrim}
            />
        );
    }
}

SoundEditor.propTypes = {
    name: PropTypes.string.isRequired,
    onRenameSound: PropTypes.func.isRequired,
    sampleRate: PropTypes.number,
    samples: PropTypes.instanceOf(Float32Array),
    soundIndex: PropTypes.number
};

const mapStateToProps = (state, {soundIndex}) => {
    const sound = state.vm.editingTarget.sprite.sounds[soundIndex];
    const audioBuffer = state.vm.runtime.audioEngine.audioBuffers[sound.md5];
    return {
        sampleRate: audioBuffer.sampleRate,
        samples: audioBuffer.getChannelData(0),
        name: sound.name,
        vm: state.vm,
        onRenameSound: state.vm.renameSound.bind(state.vm)
    };
};

module.exports = connect(
    mapStateToProps
)(SoundEditor);
