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
