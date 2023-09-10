import $ from '@fr0st/query';

/**
 * Refresh the selected value(s).
 */
export function _refresh() {
    if (!this._value) {
        this._value = [];
    }

    // check max selections
    if (this._maxSelections && this._value.length > this._maxSelections) {
        this._value = this._value.slice(0, this._maxSelections);
    }

    this._value = $._unique(this._value);

    // prevent events from being removed
    $.detach(this._searchInput);

    $.empty(this._node);
    $.empty(this._toggle);

    this._refreshDisabled();
    this._refreshPlaceholder();

    // add values
    for (const value of this._value) {
        const element = this._buildOption(value);
        $.append(this._node, element);

        const group = this._renderSelection(value);
        $.append(this._toggle, group);
    }

    $.append(this._toggle, this._searchInput);
};

/**
 * Refresh the toggle disabled class.
 */
export function _refreshDisabled() {
    const disabled = $.is(this._node, ':disabled');

    if (disabled) {
        $.addClass(this._toggle, this.constructor.classes.disabled);
        $.setAttribute(this._searchInput, { tabindex: -1 });
    } else {
        $.removeClass(this._toggle, this.constructor.classes.disabled);
        $.removeAttribute(this._searchInput, 'tabindex');
    }

    $.setAttribute(this._toggle, { 'aria-disabled': disabled });
};

/**
 * Refresh the placeholder.
 */
export function _refreshPlaceholder() {
    if (this._value.length) {
        $.hide(this._placeholder);
    } else {
        $.show(this._placeholder);
        $.prepend(this._toggle, this._placeholder);
    }
};

/**
 * Select a value (from DOM event).
 * @param {string|number} value The value to select.
 * @param {object} [options] Options for selecting the value(s).
 * @param {Boolean} [options.focus] Whether to focus the search input.
 */
export function _selectValue(value, { focus = true } = {}) {
    if (this._options.trimValue) {
        value = value.trim();
    }

    if (!this._value.some((otherValue) => otherValue == value)) {
        const newValue = this._value.concat([value]);

        this._setValue(newValue, { triggerEvent: true });

        this._refreshPlaceholder();
    }

    $.setValue(this._searchInput, '');

    if (this._options.closeOnSelect) {
        this.hide();
    } else if (this._getData) {
        this._getData({});
    }

    if (focus) {
        $.focus(this._searchInput);
    }
};

/**
 * Select the selected value(s).
 * @param {string|number} value The value to select.
 * @param {object} [options] Options for setting the value(s).
 * @param {Boolean} [options.triggerEvent] Whether to trigger the change event.
 */
export function _setValue(value, { triggerEvent = false } = {}) {
    value = value.filter(this._options.validTag);

    const valueChanged =
        !this._value ||
        value.length !== this._value.length ||
        value.some((val, index) => val !== this._value[index]);

    if (!valueChanged) {
        return;
    }

    this._value = value;
    this._refresh();

    if (triggerEvent) {
        $.triggerEvent(this._node, 'change.ui.tagsinput');
    }
};

/**
 * Update the search input width.
 */
export function _updateSearchWidth() {
    const span = $.create('span', {
        text: $.getValue(this._searchInput),
        style: {
            display: 'inline-block',
            fontSize: $.css(this._searchInput, 'fontSize'),
            whiteSpace: 'pre-wrap',
        },
    });
    $.append(document.body, span);

    const width = $.width(span);
    $.setStyle(this._searchInput, { width: width + 2 });
    $.remove(span);
};
