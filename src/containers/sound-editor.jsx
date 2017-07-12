const bindAll = require('lodash.bindall');
const PropTypes = require('prop-types');
const React = require('react');
const debounce = require('lodash.debounce');
const {connect} = require('react-redux');

const {computeRMS} = require('../lib/audio/audio-util.js');

const SoundEditorComponent = require('../components/sound-editor/sound-editor.jsx');
const AudioBufferPlayer = require('../lib/audio/audio-buffer-player.js');

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
            'playWithEffects',
            'handleActivateTrim',
            'handleUpdateTrimEnd',
            'handleUpdateTrimStart'
        ]);
        this.state = {
            playhead: null, // null is not playing, [0 -> 1] is playing percent
            chunkLevels: getChunkLevels(this.props.samples),
            chipmunk: null,
            monster: null,
            echo: null,
            reverse: null,
            robot: null,
            trim: null
        };
        this.playWithEffects = debounce(this.playWithEffects, 200);
    }
    componentDidMount () {
        this.audioBufferPlayer = new AudioBufferPlayer(this.props.samples, this.props.sampleRate);
    }
    componentWillReceiveProps (newProps) {
        if (newProps.soundIndex !== this.props.soundIndex) {
            this.audioBufferPlayer.stop();
            this.audioBufferPlayer = new AudioBufferPlayer(newProps.samples, newProps.sampleRate);
            this.setState({chunkLevels: getChunkLevels(newProps.samples)});
        }
    }
    componentWillUnmount () {
        this.audioBufferPlayer.stop();
    }
    handlePlay () {
        this.audioBufferPlayer.play(
            0,
            1,
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
        // apply effects
        this.handleCancelEffect();
    }
    handleCancelEffect () {
        this.setState({
            chipmunk: null,
            monster: null,
            echo: null,
            reverse: null,
            robot: null,
            trim: null
        });
    }
    handleActivateEffect (effect) {
        this.handleCancelEffect();
        this.setState({[effect]: this.state[effect] === null ? 0 : null});
    }
    handleUpdateEffect (effect) {
        // Preview sound with effect?
        this.setState(effect);
        this.playWithEffects();
    }
    playWithEffects () {
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
                        name: 'Reverse',
                        value: this.state.reverse,
                        active: this.state.reverse !== null,
                        icon: reverseIcon,
                        isAdjustable: false,
                        onActivate: () => this.handleActivateEffect('reverse'),
                        onChange: e => this.handleUpdateEffect({reverse: Number(e.target.value)}),
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
                        name: 'Trim',
                        value: this.state.trim,
                        active: this.state.trim !== null,
                        icon: trimIcon,
                        isAdjustable: false,
                        onActivate: () => this.handleActivateEffect('trim'),
                        onChange: e => this.handleUpdateEffect({trim: Number(e.target.value)}),
                        onSubmit: this.handleSubmitEffect,
                        onCancel: this.handleCancelEffect
                    }
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
                onTrim={this.handleActivateTrim}
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
        onRenameSound: state.vm.renameSound.bind(state.vm)
    };
};

module.exports = connect(
    mapStateToProps
)(SoundEditor);
