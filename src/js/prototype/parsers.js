import $ from '@fr0st/query';

/**
 * Build an option element for a value.
 * @param {string} value The value to use.
 * @return {HTMLElement} The option element.
 */
export function _buildOption(value) {
    if (!(value in this._optionLookup)) {
        this._optionLookup[value] = $.create('option', {
            text: value,
            value: value,
            properties: {
                selected: true,
            },
        });
    }

    return this._optionLookup[value];
};

/**
 * Build a data array from a DOM element.
 * @param {HTMLElement} element The element to parse.
 * @return {array} The parsed data.
 */
export function _getDataFromDOM(element) {
    return $.children(element).map((child) => $.getValue(child));
};
