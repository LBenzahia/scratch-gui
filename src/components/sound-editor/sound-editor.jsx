const PropTypes = require('prop-types');
const React = require('react');
const classNames = require('classnames');
const Box = require('../box/box.jsx');
const Waveform = require('../waveform/waveform.jsx');
const BufferedInput = require('../buffered-input/buffered-input.jsx');
const EffectButton = require('./effect-button.jsx');
const AudioTrimmer = require('../../containers/audio-trimmer.jsx');
const styles = require('./sound-editor.css');
const formStyles = require('../../css/forms.css');

const playIcon = require('../record-modal/icon--play.svg');
const stopIcon = require('../record-modal/icon--stop-playback.svg');
const trimIcon = require('./icon--trim.svg');
const undoIcon = require('./icon--undo.svg');
const redoIcon = require('./icon--redo.svg');

const SoundEditor = props => (
    <Box className={styles.editorContainer}>
        <Box className={styles.row}>
            <Box className={styles.inputGroup}>
                {props.playhead ? (
                    <button
                        className={classNames(styles.button, styles.stopButtonn)}
                        onClick={props.onStop}
                    >
                        <img src={stopIcon} />
                    </button>
                ) : (
                    <button
                        className={classNames(styles.button, styles.playButton)}
                        onClick={props.onPlay}
                    >
                        <img src={playIcon} />
                    </button>
                )}
            </Box>
            <Box className={styles.inputGroup}>
                <span className={formStyles.inputLabel}>Sound</span>
                <BufferedInput
                    className={classNames(formStyles.inputForm, styles.soundName)}
                    tabIndex="1"
                    type="text"
                    value={props.name}
                    onSubmit={props.onChangeName}
                />
            </Box>
            <Box className={styles.inputGroupRight}>
                <button
                    className={classNames(styles.button, styles.trimButton, {
                        [styles.trimButtonActive]: props.trimStart !== null
                    })}
                    onClick={props.onActiveTrim}
                >
                    <img src={trimIcon} />
                    {props.trimStart === null ? 'Trim' : 'Save'}
                </button>
                <Box className={styles.inputGroup}>
                    <Box className={styles.buttonGroup}>
                        <button
                            className={styles.button}
                            disabled={!props.canUndo()}
                            onClick={props.onUndo}
                        >
                            <img src={undoIcon} />
                        </button>
                        <button
                            className={styles.button}
                            disabled={!props.canRedo()}
                            onClick={props.onRedo}

                        >
                            <img src={redoIcon} />
                        </button>
                    </Box>
                </Box>
            </Box>
        </Box>
        <Box className={styles.row}>
            <Box className={styles.waveformContainer}>
                <Waveform
                    data={props.chunkLevels}
                    height={180}
                    width={600}
                />
                <AudioTrimmer
                    playhead={props.playhead}
                    trimEnd={props.trimEnd}
                    trimStart={props.trimStart}
                    onSetTrimEnd={props.onSetTrimEnd}
                    onSetTrimStart={props.onSetTrimStart}
                />
            </Box>
        </Box>
        <Box className={styles.row}>
            {props.effects.map((effectProps, index) => (
                <EffectButton
                    key={index}
                    {...effectProps}
                />
            ))}
        </Box>
    </Box>
);

SoundEditor.propTypes = {
    canRedo: PropTypes.func,
    canUndo: PropTypes.func,
    chunkLevels: PropTypes.arrayOf(PropTypes.number).isRequired,
    effects: PropTypes.arrayOf(PropTypes.shape(EffectButton.propTypes)),
    name: PropTypes.string.isRequired,
    onActiveTrim: PropTypes.func,
    onChangeName: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    onRedo: PropTypes.func,
    onSetTrimEnd: PropTypes.func,
    onSetTrimStart: PropTypes.func,
    onStop: PropTypes.func.isRequired,
    onUndo: PropTypes.func,
    playhead: PropTypes.number,
    trimEnd: PropTypes.number,
    trimStart: PropTypes.number
};

module.exports = SoundEditor;
