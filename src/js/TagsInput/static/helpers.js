/**
 * TagsInput (Static) Helpers
 */

Object.assign(TagsInput, {

    /**
     * Build an option element for a value.
     * @param {string} value The value to use.
     * @returns {HTMLElement} The option element.
     */
    _buildOption(value) {
        return dom.create('option', {
            value,
            properties: {
                selected: true
            }
        });
    },

    /**
     * Add option elements to data.
     * @param {array} data The data to parse.
     * @returns {array} The parsed data.
     */
    _parseData(data) {
        return data.map(value => ({
            value,
            element: this._buildOption(value)
        }))
    }

});
