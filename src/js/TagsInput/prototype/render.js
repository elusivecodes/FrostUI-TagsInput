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
