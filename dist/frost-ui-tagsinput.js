/**
 * FrostUI-TagsInput v1.0
 * https://github.com/elusivecodes/FrostUI-TagsInput
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-TagsInput requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-TagsInput requires FrostUI.');
    }

    const Core = window.Core;
    const DOM = window.DOM;
    const dom = window.dom;
    const UI = window.UI;
    const document = window.document;

    /**
     * TagsInput Class
     * @class
     */
    class TagsInput extends UI.BaseComponent {

        /**
         * New TagsInput constructor.
         * @param {HTMLElement} node The input node.
         * @param {object} [settings] The options to create the TagsInput with.
         * @returns {TagsInput} A new TagsInput object.
         */
        constructor(node, settings) {
            super(node, settings);

            if (!dom.is(this._node, 'select')) {
                throw new Error('TagsInput must be created on a select element');
            }

            this._placeholderText = this._settings.placeholder;
            this._maxSelections = this._settings.maxSelections;

            this._data = [];
            this._value = null;

            this._getData = null;
            this._getResults = null;

            let data;
            if (Core.isFunction(this._settings.getResults)) {
                this._getResultsCallbackInit();
                this._getResultsInit();
            } else if (Core.isArray(this._settings.data)) {
                data = this._settings.data;
            }

            if (data) {
                this._data = this.constructor._parseData(data);
                this._getDataInit();
            }

            const values = [...this._node.selectedOptions].map(option => dom.getValue(option));

            this._render();
            this._setValue(values);
            this._events();
        }

        /**
         * Disable the TagsInput.
         * @returns {TagsInput} The TagsInput.
         */
        disable() {
            dom.setAttribute(this._node, 'disabled', true);
            this._refreshDisabled();

            return this;
        }

        /**
         * Dispose the TagsInput.
         */
        dispose() {
            if (this._popper) {
                this._popper.dispose();
                this._popper = null;
            }

            dom.removeAttribute(this._node, 'tabindex');
            dom.removeEvent(this._node, 'focus.ui.tagsinput');
            dom.removeClass(this._node, this.constructor.classes.hide);
            dom.remove(this._menuNode);
            dom.remove(this._toggle);

            this._toggle = null;
            this._clear = null;
            this._input = null;
            this._placeholder = null;
            this._menuNode = null;
            this._itemsList = null;
            this._data = null;
            this._value = null;
            this._request = null;
            this._popperOptions = null;

            super.dispose();
        }

        /**
         * Enable the TagsInput.
         * @returns {TagsInput} The TagsInput.
         */
        enable() {
            dom.removeAttribute(this._node, 'disabled');
            this._refreshDisabled();

            return this;
        }

        /**
         * Hide the TagsInput.
         * @returns {TagsInput} The TagsInput.
         */
        hide() {
            if (
                this._animating ||
                !dom.isConnected(this._menuNode) ||
                !dom.triggerOne(this._node, 'hide.ui.tagsinput')
            ) {
                return this;
            }

            this._animating = true;
            this._refreshPlaceholder();

            dom.fadeOut(this._menuNode, {
                duration: this._settings.duration
            }).then(_ => {
                this._popper.dispose();
                this._popper = null;

                dom.empty(this._itemsList);
                dom.detach(this._menuNode);
                dom.setAttribute(this._toggle, 'aria-expanded', false);
                dom.triggerEvent(this._node, 'hidden.ui.tagsinput');
            }).catch(_ => { }).finally(_ => {
                this._animating = false;
            });

            return this;
        }

        /**
         * Show the TagsInput.
         * @returns {TagsInput} The TagsInput.
         */
        show() {
            if (
                dom.is(this._node, ':disabled') ||
                dom.hasAttribute(this._node, 'readonly') ||
                !this._getData ||
                this._animating ||
                dom.isConnected(this._menuNode) ||
                !dom.triggerOne(this._node, 'show.ui.tagsinput')
            ) {
                return this;
            }

            this._getData({});

            this._animating = true;

            if (this._settings.appendTo) {
                dom.append(this._settings.appendTo, this._menuNode);
            } else {
                dom.after(this._toggle, this._menuNode);
            }

            this._popper = new UI.Popper(this._menuNode, this._popperOptions);

            dom.fadeIn(this._menuNode, {
                duration: this._settings.duration
            }).then(_ => {
                dom.setAttribute(this._toggle, 'aria-expanded', true);
                dom.triggerEvent(this._node, 'shown.ui.tagsinput');
            }).catch(_ => { }).finally(_ => {
                this._animating = false;
            });

            return this;
        }

        /**
         * Toggle the TagsInput.
         * @returns {TagsInput} The TagsInput.
         */
        toggle() {
            return dom.isConnected(this._menuNode) ?
                this.hide() :
                this.show();
        }

        /**
         * Update the TagsInput position.
         * @returns {TagsInput} The TagsInput.
         */
        update() {
            if (this._popper) {
                this._popper.update();
            }

            return this;
        }

    }


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


    /**
     * TagsInput Events
     */

    Object.assign(TagsInput.prototype, {

        /**
         * Attach events for the TagsInput.
         */
        _events() {
            dom.addEvent(this._menuNode, 'mousedown.ui.tagsinput', e => {
                if (dom.isSame(this._input, e.target)) {
                    return;
                }

                // prevent search input from triggering blur event
                e.preventDefault();
            });

            dom.addEvent(this._menuNode, 'click.ui.tagsinput', e => {
                // prevent menu node from closing modal
                e.stopPropagation();
            });

            dom.addEventDelegate(this._menuNode, 'contextmenu.ui.tagsinput', '[data-ui-action="select"]', e => {
                // prevent menu node from showing right click menu
                e.preventDefault();
            });

            dom.addEventDelegate(this._itemsList, 'mouseup.ui.tagsinput', '[data-ui-action="select"]', e => {
                e.preventDefault();

                dom.setValue(this._input, '');
                const value = dom.getDataset(e.currentTarget, 'uiValue');
                this._selectValue(value);
            });

            dom.addEventDelegate(this._itemsList, 'mouseover.ui.tagsinput', '[data-ui-action="select"]', DOM.debounce(e => {
                const focusedNode = dom.find('[data-ui-focus]', this._itemsList);
                dom.removeClass(focusedNode, this.constructor.classes.focus);
                dom.removeDataset(focusedNode, 'uiFocus');
                dom.addClass(e.currentTarget, this.constructor.classes.focus);
                dom.setDataset(e.currentTarget, 'uiFocus', true);
            }));

            dom.addEvent(this._input, 'keydown.ui.tagsinput', e => {
                if (this._settings.confirmKeys.includes(e.key)) {
                    e.preventDefault();

                    const value = dom.getValue(this._input);
                    this.add(value);
                    dom.focus(this._input);
                    return;
                }

                if (!['ArrowDown', 'ArrowUp', 'Backspace', 'Enter'].includes(e.code)) {
                    return;
                }

                if (e.code === 'Backspace') {
                    if (this._value.length && !dom.getValue(this._input)) {
                        e.preventDefault();

                        // remove the last selected item
                        this._value.pop();

                        this._refresh();
                        dom.setValue(this._input, '');
                        dom.focus(this._input);
                        this._updateSearchWidth();

                        // trigger input
                        dom.triggerEvent(this._input, 'input.ui.tagsinput');
                    }

                    return;
                }

                if (!dom.isConnected(this._menuNode) && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.code)) {
                    return this.show();
                }

                const focusedNode = dom.findOne('[data-ui-focus]', this._itemsList);

                if (e.code === 'Enter') {
                    let value;
                    if (focusedNode) {
                        // select the focused item
                        value = dom.getDataset(focusedNode, 'uiValue');
                    } else {
                        value = dom.getValue(this._input);
                    }

                    this.add(value);

                    return;
                }

                // focus the previous/next item

                let focusNode;
                if (!focusedNode) {
                    focusNode = dom.findOne('[data-ui-action="select"]', this._itemsList);
                } else {
                    switch (e.code) {
                        case 'ArrowDown':
                            focusNode = dom.nextAll(focusedNode, '[data-ui-action="select"]').shift();
                            break;
                        case 'ArrowUp':
                            focusNode = dom.prevAll(focusedNode, '[data-ui-action="select"]').pop();
                            break;
                    }
                }

                if (!focusNode) {
                    return;
                }

                dom.removeClass(focusedNode, this.constructor.classes.focus);
                dom.removeDataset(focusedNode, 'uiFocus');
                dom.addClass(focusNode, this.constructor.classes.focus);
                dom.setDataset(focusNode, 'uiFocus', true);

                const itemsScrollY = dom.getScrollY(this._itemsList);
                const itemsRect = dom.rect(this._itemsList, true);
                const nodeRect = dom.rect(focusNode, true);

                if (nodeRect.top < itemsRect.top) {
                    dom.setScrollY(this._itemsList, itemsScrollY + nodeRect.top - itemsRect.top);
                } else if (nodeRect.bottom > itemsRect.bottom) {
                    dom.setScrollY(this._itemsList, itemsScrollY + nodeRect.bottom - itemsRect.bottom);
                }
            });

            dom.addEvent(this._input, 'keyup.ui.tagsinput', e => {
                if (e.code !== 'Escape' || !dom.isConnected(this._menuNode)) {
                    return;
                }

                e.stopPropagation();

                // close the menu
                this.hide();

                dom.blur(this._input);
                dom.focus(this._input);
            });

            // debounced input event
            const getDataDebounced = Core.debounce(term => {
                this._getData({ term });
            }, this._settings.debounceInput);

            dom.addEvent(this._input, 'input.ui.tagsinput', DOM.debounce(_ => {
                this._updateSearchWidth();

                if (!this._getData) {
                    return;
                }

                this.show();

                const term = dom.getValue(this._input);
                getDataDebounced(term);
            }));

            if (this._settings.getResults) {
                // infinite scrolling event
                dom.addEvent(this._itemsList, 'scroll.ui.tagsinput', Core.throttle(_ => {
                    if (this._request || !this._showMore) {
                        return;
                    }

                    const height = dom.height(this._itemsList);
                    const scrollHeight = dom.height(this._itemsList, DOM.SCROLL_BOX);
                    const scrollTop = dom.getScrollY(this._itemsList);

                    if (scrollTop >= scrollHeight - height - (height / 4)) {
                        const term = dom.getValue(this._input);
                        const offset = this._data.length;

                        this._getData({ term, offset });
                    }
                }, 250, false));
            }

            dom.addEvent(this._node, 'focus.ui.tagsinput', _ => {
                if (!dom.isSame(this._node, document.activeElement)) {
                    return;
                }

                dom.focus(this._input);
            });

            let keepFocus = false;
            dom.addEvent(this._toggle, 'mousedown.ui.tagsinput', e => {
                if (dom.is(e.target, '[data-ui-action="clear"]')) {
                    e.preventDefault();
                    return;
                }

                if (dom.hasClass(this._toggle, 'focus')) {
                    // maintain focus when toggle element is already focused
                    keepFocus = true;
                } else {
                    dom.hide(this._placeholder);
                    dom.addClass(this._toggle, 'focus');
                }

                if (!e.button) {
                    this.show();
                }

                dom.focus(this._input);
                dom.addEventOnce(window, 'mouseup.ui.tagsinput', _ => {
                    keepFocus = false;
                    dom.focus(this._input);
                });
            });

            dom.addEventDelegate(this._toggle, 'click.ui.tagsinput', '[data-ui-action="clear"]', e => {
                if (e.button) {
                    return;
                }

                // remove selection
                const element = dom.parent(e.currentTarget);
                const index = dom.index(element);
                const value = this._value.slice();
                value.splice(index, 1)
                this._setValue(value, true);
                dom.focus(this._input);
            });

            dom.addEvent(this._input, 'focus.ui.tagsinput', _ => {
                if (!dom.isSame(this._input, document.activeElement)) {
                    return;
                }

                dom.hide(this._placeholder);
                dom.detach(this._placeholder);
                dom.addClass(this._toggle, 'focus');
            });

            dom.addEvent(this._input, 'blur.ui.tagsinput', _ => {
                if (dom.isSame(this._input, document.activeElement)) {
                    return;
                }

                if (keepFocus) {
                    // prevent losing focus when toggle element is focused
                    return;
                }

                const value = dom.getValue(this._input);

                if (value) {
                    if (this._settings.confirmOnBlur) {
                        this.add(value);
                    }

                    if (this._settings.confirmOnBlur || this._settings.clearOnBlur) {
                        dom.setValue(this._input, '');
                    }
                }

                dom.removeClass(this._toggle, 'focus');
                if (dom.isConnected(this._menuNode)) {
                    this.hide();
                } else {
                    this._refreshPlaceholder();
                }
            });
        }

    });


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


    /**
     * TagsInput Init
     */

    Object.assign(TagsInput.prototype, {

        /**
         * Initialize preloaded get data.
         */
        _getDataInit() {
            this._getData = ({ term = null }) => {
                dom.empty(this._itemsList);

                // check for minimum search length
                if (this._settings.minSearch && (!term || term.length < this._settings.minSearch)) {
                    return this.update();
                }

                // check for max selections
                if (this._maxSelections && this._value.length >= this._maxSelections) {
                    return this._renderInfo(this._settings.lang.maxSelections);
                }

                let results = this._data;

                if (term) {
                    // filter results
                    results = this._settings.sortResults(results, term)
                        .filter(item => this._settings.isMatch(item.value, term));
                }

                this._renderResults(results);
                this.update();
            };
        },

        /**
         * Initialize get data from callback.
         */
        _getResultsInit() {
            this._getData = ({ offset = 0, term = null }) => {

                // cancel last request
                if (this._request && this._request.cancel) {
                    this._request.cancel();
                    this._request = null;
                }

                if (!offset) {
                    dom.empty(this._itemsList);
                }

                // check for minimum search length
                if (this._settings.minSearch && (!term || term.length < this._settings.minSearch)) {
                    return this.update();
                }

                // check for max selections
                if (this._maxSelections && this._value.length >= this._maxSelections) {
                    return this._renderInfo(this._settings.lang.maxSelections);
                }

                const loading = this._renderInfo(this._settings.lang.loading);
                const request = this._getResults({ offset, term });

                request.then(response => {
                    this._renderResults(response.results);
                }).catch(_ => {
                    // error
                }).finally(_ => {
                    dom.remove(loading);
                    this.update();

                    if (this._request === request) {
                        this._request = null;
                    }
                });
            };
        },

        /**
         * Initialize get data callback.
         */
        _getResultsCallbackInit() {
            this._getResults = options => {
                // reset data for starting offset
                if (!options.offset) {
                    this._data = [];
                }

                const request = this._settings.getResults(options);
                this._request = Promise.resolve(request);

                this._request.then(response => {
                    const newData = this.constructor._parseData(response.results);
                    this._data.push(...newData);
                    this._showMore = response.showMore;

                    response.results = response.results.map(value => ({ value }));

                    return response;
                });

                return this._request;
            };
        }

    });


    /**
     * TagsInput Render
     */

    Object.assign(TagsInput.prototype, {

        /**
         * Render the toggle element.
         */
        _render() {
            this._renderToggle();
            this._renderPlaceholder();
            this._renderMenu();

            // hide the input node
            dom.addClass(this._node, this.constructor.classes.hide);
            dom.setAttribute(this._node, 'tabindex', '-1');

            dom.after(this._node, this._toggle);
        },

        /**
         * Render an information item.
         * @param {string} text The text to render.
         * @returns {HTMLElement} The information element.
         */
        _renderInfo(text) {
            const element = dom.create('button', {
                html: this._settings.sanitize(text),
                class: this.constructor.classes.info,
                attributes: {
                    type: 'button'
                }
            });
            dom.append(this._itemsList, element);
            this.update();
            return element;
        },

        /**
         * Render an item.
         * @param {object} item The item to render.
         * @returns {HTMLElement} The item element.
         */
        _renderItem(item) {
            const active = this._value.includes(item.value);

            const element = dom.create('div', {
                html: this._settings.sanitize(
                    this._settings.renderResult(item.value, active)
                ),
                class: this.constructor.classes.item
            });

            if (active) {
                dom.addClass(element, this.constructor.classes.active);
                dom.setDataset(element, 'uiActive', true);
            }

            if (item.disabled) {
                dom.addClass(element, this.constructor.classes.disabledItem);
            } else {
                dom.addClass(element, this.constructor.classes.action)
                dom.setDataset(element, {
                    uiAction: 'select',
                    uiValue: item.value
                });
            }

            return element;
        },

        /**
         * Render the menu.
         */
        _renderMenu() {
            this._menuNode = dom.create('div', {
                class: this.constructor.classes.menu
            });

            this._itemsList = dom.create('div', {
                class: this.constructor.classes.items
            });
            dom.append(this._menuNode, this._itemsList);

            this._popperOptions = {
                reference: this._toggle,
                placement: this._settings.placement,
                position: this._settings.position,
                fixed: this._settings.fixed,
                spacing: this._settings.spacing,
                minContact: this._settings.minContact
            };

            if (this._settings.fullWidth) {
                this._popperOptions.afterUpdate = (node, reference) => {
                    const width = dom.width(reference, DOM.BORDER_BOX);
                    dom.setStyle(node, 'width', width);
                };

                this._popperOptions.beforeUpdate = node => {
                    dom.setStyle(node, 'width', '');
                };
            }
        },

        /**
         * Render the placeholder.
         */
        _renderPlaceholder() {
            this._placeholder = dom.create('span', {
                html: this._placeholderText ?
                    this._settings.sanitize(this._placeholderText) :
                    '&nbsp;',
                class: this.constructor.classes.placeholder
            });
        },

        /**
         * Render results.
         * @param {array} results The results to render.
         */
        _renderResults(results) {
            if (!results.length) {
                return this._renderInfo(this._settings.lang.noResults);
            }

            for (const item of results) {
                const element = this._renderItem(item);
                dom.append(this._itemsList, element);
            }

            const focusedNode = dom.findOne('[data-ui-focus]', this._itemsList);

            if (focusedNode) {
                return;
            }

            let focusNode = dom.findOne('[data-ui-active]', this._itemsList);

            if (!focusNode) {
                focusNode = dom.findOne('[data-ui-action="select"]', this._itemsList);
            }

            if (focusNode) {
                dom.addClass(focusNode, this.constructor.classes.focus);
                dom.setDataset(focusNode, 'uiFocus', true);
            }
        },

        /**
         * Render a selection item.
         * @param {object} item The item to render.
         * @returns {HTMLElement} The selection element.
         */
        _renderSelection(item) {
            const group = dom.create('div', {
                class: this.constructor.classes.tagGroup
            });

            const content = this._settings.renderSelection(item.value);
            const tag = dom.create('div', {
                html: this._settings.sanitize(content),
                class: this.constructor.classes.tagItem
            });
            dom.append(group, tag);

            if (this._settings.showClear) {
                const close = dom.create('div', {
                    html: `<span class="${this.constructor.classes.tagClearIcon}"></span>`,
                    class: this.constructor.classes.tagClear,
                    dataset: {
                        uiAction: 'clear'
                    }
                });
                dom.append(group, close);
            }

            return group;
        },

        /**
         * Render the toggle element.
         */
        _renderToggle() {
            this._toggle = dom.create('div', {
                class: [
                    dom.getAttribute(this._node, 'class') || '',
                    this.constructor.classes.tagToggle
                ]
            });

            this._input = dom.create('input', {
                class: this.constructor.classes.tagInput,
                attributes: {
                    autocomplete: 'off'
                }
            });
        }

    });


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


    // TagsInput default options
    TagsInput.defaults = {
        placeholder: '',
        lang: {
            loading: 'Loading..',
            maxSelections: 'Selection limit reached.',
            noResults: 'No results'
        },
        data: null,
        getResults: null,
        isMatch: (value, term) => {
            const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const escapedTerm = Core.escapeRegExp(term);
            const regExp = new RegExp(escapedTerm, 'i');

            return regExp.test(value) || regExp.test(normalized);
        },
        renderResult: value => value,
        renderSelection: value => value,
        sanitize: input => dom.sanitize(input),
        sortResults: (results, term) => results.sort((a, b) => {
            const aLower = a.value.toLowerCase();
            const bLower = b.value.toLowerCase();

            if (term) {
                const diff = aLower.indexOf(term) - bLower.indexOf(term);

                if (diff) {
                    return diff;
                }
            }

            return aLower.localeCompare(bLower);
        }),
        validTag: value => !!value,
        maxSelections: 0,
        minSearch: 1,
        confirmKeys: [',', ' '],
        confirmOnBlur: true,
        clearOnBlur: true,
        showClear: true,
        closeOnSelect: true,
        debounceInput: 250,
        duration: 100,
        appendTo: null,
        fullWidth: false,
        placement: 'bottom',
        position: 'start',
        fixed: false,
        spacing: 0,
        minContact: false
    };

    // Default classes
    TagsInput.classes = {
        action: 'tagsinput-action',
        active: 'tagsinput-active',
        disabled: 'disabled',
        disabledItem: 'tagsinput-disabled',
        focus: 'tagsinput-focus',
        hide: 'visually-hidden',
        info: 'tagsinput-item text-secondary',
        item: 'tagsinput-item',
        items: 'tagsinput-items',
        menu: 'tagsinput-menu shadow-sm',
        placeholder: 'tagsinput-placeholder',
        tagClear: 'btn btn-sm btn-info',
        tagClearIcon: 'btn-close btn-close-white pe-none',
        tagGroup: 'btn-group',
        tagInput: 'tagsinput-input',
        tagItem: 'btn btn-sm btn-info',
        tagToggle: 'tagsinput d-flex flex-wrap position-relative text-start',
        readonly: 'readonly'
    };

    UI.initComponent('tagsinput', TagsInput);

    UI.TagsInput = TagsInput;

});