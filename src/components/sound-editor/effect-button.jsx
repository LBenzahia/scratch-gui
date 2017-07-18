const PropTypes = require('prop-types');
const React = require('react');
const Box = require('../box/box.jsx');
const styles = require('./effect-button.css');

const EffectButton = props => (
    <div
        className={styles.effectContainer}
    >
        <Box
            className={styles.effectButton}
            onClick={props.onActivate}
        >
            <img
                className={styles.effectButtonIcon}
                src={props.icon}
            />
            <Box className={styles.effectButtonLabel}>{props.name}</Box>
        </Box>
    </div>
);

EffectButton.propTypes = {
    icon: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onActivate: PropTypes.func.isRequired
};

module.exports = EffectButton;
