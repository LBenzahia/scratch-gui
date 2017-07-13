const PropTypes = require('prop-types');
const React = require('react');
const classNames = require('classnames');
const Box = require('../box/box.jsx');
const styles = require('./effect-button.css');
const bindAll = require('lodash.bindall');

class EffectButton extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'bindClickOutside',
            'unbindClickOutside',
            'handleDocumentClick'
        ]);
    }

    componentDidUpdate (prevProps) {
        if (prevProps.active === false && this.props.active === true) {
            this.bindClickOutside();
        } else if (prevProps.active === true && this.props.active === false) {
            this.unbindClickOutside();
        }
    }
    componentWillUnmount () {
        this.unbindClickOutside();
    }
    bindClickOutside () {
        window.addEventListener('click', this.handleDocumentClick);
    }
    unbindClickOutside () {
        window.removeEventListener('click', this.handleDocumentClick);
    }
    handleDocumentClick (e) {
        if (this.area) {
            if (!this.area.contains(e.target)) {
                this.props.onSubmit();
            }
        }
        e.preventDefault();
        e.stopPropagation();
    }
    render () {
        return (
            <div
                className={styles.effectContainer}
                ref={r => (this.area = r)}
            >
                <Box
                    className={classNames(styles.effectButton, {
                        [styles.isActive]: this.props.active
                    })}
                    onClick={this.props.active ? this.props.onSubmit : this.props.onActivate}
                >
                    <img
                        className={styles.effectButtonIcon}
                        src={this.props.icon}
                    />
                    <Box className={styles.effectButtonLabel}>{this.props.name}</Box>
                </Box>
                {this.props.active ? (
                    <Box
                        className={styles.effectPopover}
                    >
                        {this.props.value !== null && this.props.isAdjustable ? (
                            <input
                                className={styles.effectInput}
                                max={this.props.max}
                                min={this.props.min}
                                step={this.props.step}
                                type="range"
                                value={this.props.value}
                                onChange={this.props.onChange}
                            />
                        ) : null}
                        {/* <button
                            className={styles.submitButton}
                            onClick={this.props.onSubmit}
                        >
                            ✅
                        </button> */}
                        <button
                            className={styles.cancelButton}
                            onClick={this.props.onCancel}
                        >
                            ❌
                        </button>
                    </Box>
                ) : null}
            </div>
        );
    }
}

EffectButton.propTypes = {
    active: PropTypes.bool.isRequired,
    icon: PropTypes.string.isRequired,
    isAdjustable: PropTypes.bool,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string.isRequired,
    onActivate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    step: PropTypes.number,
    value: PropTypes.number
};

EffectButton.defaultProps = {
    isAdjustable: true,
    min: 0,
    max: 1,
    step: 0.0001
};

module.exports = EffectButton;
