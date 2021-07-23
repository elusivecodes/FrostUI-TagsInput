/**
 * TagsInput Helpers
 */

Object.assign(TagsInput.prototype, {

    /**
     * Retrieve data for a value.
     * @param {string|number} value The value to retrieve data for.
     * @returns {object} The data.
     */
    _findValue(value) {
        if (!value) {
            return null;
        }

        for (const item of this._data) {
            if (item.value === value) {
                return item;
            }
        }

        return {
            value,
            element: this.constructor._buildOption(value)
        };
    },

    /**
     * Refresh the selected value(s).
     */
    _refresh() {
        if (!this._value) {
            this._value = [];
        }

        // check max selections
        if (this._maxSelections && this._value.length > this._maxSelections) {
            this._value = this._value.slice(0, this._maxSelections);
        }

        this._value = Core.unique(this._value);

        // prevent events from being removed
        dom.detach(this._input);

        dom.empty(this._node);
        dom.empty(this._toggle);

        this._refreshDisabled();
        this._refreshPlaceholder();

        // add values
        if (this._value.length) {
            for (const value of this._value) {
                const item = this._findValue(value);
                dom.append(this._node, item.element);

                const group = this._renderSelection(item);
                dom.append(this._toggle, group);
            }
        }

        dom.append(this._toggle, this._input);
    },

    /**
     * Refresh the toggle disabled class.
     */
    _refreshDisabled() {
        const element = this._input;

        if (dom.is(this._node, ':disabled')) {
            dom.addClass(this._toggle, this.constructor.classes.disabled);
            dom.setAttribute(element, 'tabindex', '-1');
        } else {
            dom.removeClass(this._toggle, this.constructor.classes.disabled);
            dom.removeAttribute(element, 'tabindex');
        }

        if (dom.hasAttribute(this._node, 'readonly')) {
            dom.addClass(this._toggle, this.constructor.classes.readonly);
        }
    },

    /**
     * Refresh the placeholder.
     */
    _refreshPlaceholder() {
        if (this._value.length) {
            dom.hide(this._placeholder);
        } else {
            dom.show(this._placeholder);
            dom.prepend(this._toggle, this._placeholder);
        }
    },

    /**
     * Select a value (from DOM event).
     * @param {string|number} value The value to select.
     */
    _selectValue(value) {
        // check item has been loaded
        const item = this._findValue(value);

        if (!item) {
            return this._refresh();
        }

        // get actual value from item
        value = item.value;
        value = this._value.concat([value]);

        this._setValue(value, true);

        if (this._settings.closeOnSelect) {
            this.hide();
        } else if (this._getData) {
            this._getData({});
        }

        this._refreshPlaceholder();
        dom.setValue(this._input, '');
        dom.focus(this._input);
    },

    /**
     * Select the selected value(s).
     * @param {string|number} value The value to select.
     * @param {Boolean} [triggerEvent] Whether to trigger the change event.
     */
    _setValue(value, triggerEvent = false) {
        value = value.filter(this._settings.validTag);

        if (this._value && value.length === this._value.length && value.every((val, index) => val === this._value[index])) {
            return;
        }

        this._value = value;
        this._refresh();

        if (triggerEvent) {
            dom.triggerEvent(this._node, 'change.ui.tagsinput');
        }
    },

    /**
     * Update the search input width.
     */
    _updateSearchWidth() {
        const span = dom.create('span', {
            text: dom.getValue(this._input),
            style: {
                display: 'inline-block',
                fontSize: dom.css(this._input, 'fontSize'),
                whiteSpace: 'pre-wrap'
            }
        });
        dom.append(document.body, span);

        const width = dom.width(span);
        dom.setStyle(this._input, 'width', width + 2);
        dom.remove(span);
    }

});
