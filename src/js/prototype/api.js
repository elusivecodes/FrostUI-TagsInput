import $ from '@fr0st/query';

/**
 * Add a value.
 * @param {string} value The value to add.
 */
export function add(value) {
    const newValues = this._value.concat([value]);
    this._setValue(newValues, { triggerEvent: true });
};

/**
 * Get the maximum selections.
 * @return {number} The maximum selections.
 */
export function getMaxSelections() {
    return this._maxSelections;
};

/**
 * Get the placeholder text.
 * @return {string} The placeholder text.
 */
export function getPlaceholder() {
    return this._placeholderText;
};

/**
 * Get the selected value(s).
 * @return {string|number|array} The selected value(s).
 */
export function getValue() {
    return this._value;
};

/**
 * Remove a value.
 * @param {string} value The value to remove.
 */
export function remove(value) {
    const newValues = this._value.filter((val) => val != value);
    this._setValue(newValues, { triggerEvent: true });
};

/**
 * Remove all values.
 */
export function removeAll() {
    this._setValue([], { triggerEvent: true });
};

/**
 * Set the maximum selections.
 * @param {number} maxSelections The maximum selections.
 */
export function setMaxSelections(maxSelections) {
    this._maxSelections = maxSelections;

    this.hide();
    this._refresh();
};

/**
 * Set the placeholder text.
 * @param {string} placeholder The placeholder text.
 */
export function setPlaceholder(placeholder) {
    this._placeholderText = placeholder;

    $.remove(this._placeholder);
    this._renderPlaceholder();
    this._refresh();
};

/**
 * Set the selected value(s).
 * @param {string|number|array} value The value to set.
 */
export function setValue(value) {
    this._setValue(value, { triggerEvent: true });
};
