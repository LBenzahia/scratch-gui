const PropTypes = require('prop-types');
const React = require('react');
const classNames = require('classnames');
const Box = require('../box/box.jsx');
const styles = require('./effect-button.css');

const EffectButton = props => (
    <Box className={styles.effectContainer}>
        <Box
            className={classNames(styles.effectButton, {
                [styles.isActive]: props.active
            })}
            onClick={props.onActivate}
        >
            <img
                className={styles.effectButtonIcon}
                src={props.icon}
            />
            <Box className={styles.effectButtonLabel}>{props.name}</Box>
        </Box>
        {props.active ? (
            <Box
                className={styles.effectPopover}
                tabIndex="0"
                onBlur={props.onCancel}
            >
                {props.value !== null && props.isAdjustable ? (
                    <input
                        className={styles.effectInput}
                        max={props.max}
                        min={props.min}
                        step={props.step}
                        type="range"
                        value={props.value}
                        onChange={props.onChange}
                    />
                ) : null}
                <button
                    className={styles.submitButton}
                    onClick={props.onSubmit}
                >
                    ✅
                </button>
                <button
                    className={styles.cancelButton}
                    onClick={props.onCancel}
                >
                    ❌
                </button>
            </Box>
        ) : null}
    </Box>
);

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
