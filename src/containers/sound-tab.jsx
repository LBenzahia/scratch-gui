import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {defineMessages} from 'react-intl';
import VM from 'scratch-vm';

import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import soundIcon from '../components/asset-panel/icon--sound.svg';
import addSoundFromLibraryIcon from '../components/asset-panel/icon--add-sound-lib.svg';
import addSoundFromRecordingIcon from '../components/asset-panel/icon--add-sound-record.svg';
import RecordModal from './record-modal.jsx';
import SoundEditor from './sound-editor.jsx';

import {connect} from 'react-redux';

const {
    openSoundLibrary,
    openSoundRecorder
} = require('../reducers/modals');

class SoundTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSelectSound',
            'handleDeleteSound'
        ]);

        const {
            editingTarget,
            sprites,
            stage
        } = props;

        const target = editingTarget && sprites[editingTarget] ? sprites[editingTarget] : stage;

        this.state = {
            soundsCount: target && target.sounds ? target.sounds.length : 0,
            selectedSoundIndex: 0
        };
    }

    componentWillReceiveProps (nextProps) {
        const {
            editingTarget,
            sprites,
            stage
        } = nextProps;

        const target = editingTarget && sprites[editingTarget] ? sprites[editingTarget] : stage;

        if (target && target.sounds) {
            const nextSoundsCount = target.sounds.length;
            if (this.state.selectedSoundIndex > target.sounds.length - 1) {
                this.setState({selectedSoundIndex: Math.max(0, target.sounds.length - 1)});
            }
            if (nextSoundsCount > this.state.soundsCount) {
                this.setState({selectedSoundIndex: Math.max(0, nextSoundsCount - 1)});
            }

            if (target.sounds.length !== this.state.soundsCount) {
                this.setState({soundsCount: target.sounds.length});
            }
        }
    }

    handleSelectSound (soundIndex) {
        this.setState({selectedSoundIndex: soundIndex});
    }

    handleDeleteSound (soundIndex) {
        this.props.vm.deleteSound(soundIndex);
    }

    render () {
        const {
            editingTarget,
            isVisible,
            sprites,
            stage,
            onNewSoundFromLibraryClick,
            onNewSoundFromRecordingClick
        } = this.props;

        const target = editingTarget && sprites[editingTarget] ? sprites[editingTarget] : stage;

        if (!target) {
            return null;
        }

        const sounds = target.sounds ? target.sounds.map(sound => (
            {
                url: soundIcon,
                name: sound.name
            }
        )) : [];

        const messages = defineMessages({
            recordSound: {
                id: 'action.recordSound',
                defaultMessage: 'Record Sound',
                description: 'Button to record a sound in the editor tab'
            },
            addSound: {
                id: 'action.addSound',
                defaultMessage: 'Add Sound',
                description: 'Button to add a sound in the editor tab'
            }
        });

        return (
            <AssetPanel
                buttons={[{
                    message: messages.recordSound,
                    img: addSoundFromRecordingIcon,
                    onClick: onNewSoundFromRecordingClick
                }, {
                    message: messages.addSound,
                    img: addSoundFromLibraryIcon,
                    onClick: onNewSoundFromLibraryClick
                }]}
                items={sounds.map(sound => ({
                    url: soundIcon,
                    ...sound
                }))}
                selectedItemIndex={this.state.selectedSoundIndex}
                onDeleteClick={this.handleDeleteSound}
                onItemClick={this.handleSelectSound}
            >
                {target.sounds && target.sounds.length > 0 && isVisible ? (
                    <SoundEditor soundIndex={this.state.selectedSoundIndex} />
                ) : null}
                {this.props.soundRecorderVisible ? (
                    <RecordModal />
                ) : null}
            </AssetPanel>
        );
    }
}

SoundTab.propTypes = {
    editingTarget: PropTypes.string,
    isVisible: PropTypes.bool.isRequired,
    onNewSoundFromLibraryClick: PropTypes.func.isRequired,
    onNewSoundFromRecordingClick: PropTypes.func.isRequired,
    soundRecorderVisible: PropTypes.bool,
    sprites: PropTypes.shape({
        id: PropTypes.shape({
            sounds: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string.isRequired
            }))
        })
    }),
    stage: PropTypes.shape({
        sounds: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired
        }))
    }),
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    editingTarget: state.targets.editingTarget,
    sprites: state.targets.sprites,
    stage: state.targets.stage,
    soundRecorderVisible: state.modals.soundRecorder
});

const mapDispatchToProps = dispatch => ({
    onNewSoundFromLibraryClick: e => {
        e.preventDefault();
        dispatch(openSoundLibrary());
    },
    onNewSoundFromRecordingClick: () => {
        dispatch(openSoundRecorder());
    }
});

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(SoundTab);
