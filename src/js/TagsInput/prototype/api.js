/**
 * TagsInput API
 */

Object.assign(TagsInput.prototype, {

    /**
     * Add a value.
     * @param {string} value The value to add.
     * @returns {TagsInput} The TagsInput.
     */
    add(value) {
        if (this._settings.trimValue) {
            value = value.trim();
        }

        this._setValue(this._value.concat([value]), true);

        return this;
    },

    /**
     * Get the maximum selections.
     * @returns {number} The maximum selections.
     */
    getMaxSelections() {
        return this._maxSelections;
    },

    /**
     * Get the placeholder text.
     * @returns {string} The placeholder text.
     */
    getPlaceholder() {
        return this._placeholderText;
    },

    /**
     * Get the selected value(s).
     * @returns {string|number|array} The selected value(s).
     */
    getValue() {
        return this._value;
    },

    /**
     * Remove a value.
     * @param {string} value The value to remove.
     * @returns {TagsInput} The TagsInput.
     */
    remove(value) {
        this._setValue(this._value.filter(val => val !== value), true);

        return this;
    },

    /**
     * Remove all values.
     * @returns {TagsInput} The TagsInput.
     */
    remove() {
        this._setValue([], true);

        return this;
    },

    /**
     * Set the maximum selections.
     * @param {number} maxSelections The maximum selections.
     * @returns {TagsInput} The TagsInput.
     */
    setMaxSelections(maxSelections) {
        this._maxSelections = maxSelections;

        this.hide();
        this._refresh();

        return this;
    },

    /**
     * Set the placeholder text.
     * @param {string} placeholder The placeholder text.
     * @returns {TagsInput} The TagsInput.
     */
    setPlaceholder(placeholder) {
        this._placeholderText = placeholder;

        dom.remove(this._placeholder);
        this._renderPlaceholder();
        this._refresh();

        return this;
    },

    /**
     * Set the selected value(s).
     * @param {string|number|array} value The value to set.
     * @returns {TagsInput} The TagsInput.
     */
    setValue(value) {
        if (!dom.is(this._node, ':disabled')) {
            this._selectValue(value);
        }

        return this;
    }

});
