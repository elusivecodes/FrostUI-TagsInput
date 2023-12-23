import $ from '@fr0st/query';

/**
 * Attach events for the TagsInput.
 */
export function _events() {
    $.addEventDelegate(this._menuNode, 'contextmenu.ui.tagsinput', '[data-ui-action="select"]', (e) => {
        // prevent menu node from showing right click menu
        e.preventDefault();
    });

    $.addEvent(this._menuNode, 'mousedown.ui.tagsinput', (e) => {
        if ($.isSame(this._searchInput, e.target)) {
            return;
        }

        // prevent search input from triggering blur event
        e.preventDefault();
    });

    $.addEvent(this._menuNode, 'click.ui.tagsinput', (e) => {
        // prevent menu node from closing modal
        e.stopPropagation();
    });

    $.addEvent(this._node, 'focus.ui.tagsinput', (_) => {
        if (!$.isSame(this._node, document.activeElement)) {
            return;
        }

        $.focus(this._searchInput);
    });

    $.addEventDelegate(this._menuNode, 'click.ui.tagsinput', '[data-ui-action="select"]', (e) => {
        e.preventDefault();

        $.setDataset(this._searchInput, { uiKeepFocus: true });

        const value = $.getDataset(e.currentTarget, 'uiValue');
        this._selectValue(value);

        $.removeDataset(this._searchInput, 'uiKeepFocus');
    });

    $.addEventDelegate(this._menuNode, 'mouseover.ui.tagsinput', '[data-ui-action="select"]', $.debounce((e) => {
        const focusedNode = $.findOne('[data-ui-focus]', this._menuNode);
        $.removeClass(focusedNode, this.constructor.classes.focus);
        $.removeDataset(focusedNode, 'uiFocus');

        $.addClass(e.currentTarget, this.constructor.classes.focus);
        $.setDataset(e.currentTarget, { uiFocus: true });

        const id = $.getAttribute(e.currentTarget, 'id');
        $.setAttribute(this._toggle, { 'aria-activedescendent': id });
        $.setAttribute(this._searchInput, { 'aria-activedescendent': id });
    }));

    $.addEvent(this._searchInput, 'input.ui.tagsinput', $.debounce((_) => {
        this._updateSearchWidth();

        if (!this._getData) {
            return;
        }

        if (!$.isConnected(this._menuNode)) {
            this.show();
        } else {
            const term = $.getValue(this._searchInput);
            this._getData({ term });
        }
    }));

    $.addEvent(this._searchInput, 'keydown.ui.tagsinput', (e) => {
        if (this._options.confirmKeys.includes(e.key)) {
            e.preventDefault();

            $.setDataset(this._searchInput, { uiKeepFocus: true });

            const value = $.getValue(this._searchInput);
            this._selectValue(value);

            $.removeDataset(this._searchInput, 'uiKeepFocus');

            return;
        }

        if (e.code === 'Backspace') {
            if (this._value.length && !$.getValue(this._searchInput)) {
                e.preventDefault();

                // remove the last selected item
                this._value.pop();

                $.setDataset(this._searchInput, { uiKeepFocus: true });

                this._refresh();
                $.setValue(this._searchInput, '');
                $.focus(this._searchInput);
                this._updateSearchWidth();

                // trigger input
                $.triggerEvent(this._searchInput, 'input.ui.tagsinput');

                $.removeDataset(this._searchInput, 'uiKeepFocus');
            }

            return;
        }


        if (e.code === 'Escape' && $.isConnected(this._menuNode)) {
            e.stopPropagation();

            // close the menu
            this.hide();

            $.triggerEvent(this._searchInput, 'focus.ui.tagsinput');

            return;
        }

        if (!['ArrowDown', 'ArrowUp', 'Enter', 'NumpadEnter'].includes(e.code)) {
            return;
        }

        if (!$.isConnected(this._menuNode)) {
            this.show();
            return;
        }

        const focusedNode = $.findOne('[data-ui-focus]', this._menuNode);

        switch (e.code) {
            case 'Enter':
            case 'NumpadEnter':
                let value;
                if (focusedNode) {
                    // select the focused item
                    value = $.getDataset(focusedNode, 'uiValue');
                    $.setValue(this._searchInput, '');
                } else {
                    value = $.getValue(this._searchInput);
                }

                $.setDataset(this._searchInput, { uiKeepFocus: true });

                this._selectValue(value);

                $.removeDataset(this._searchInput, 'uiKeepFocus');

                return;
        }

        // focus the previous/next item

        let focusNode;
        if (!focusedNode) {
            focusNode = this._activeItems[0];
        } else {
            let focusIndex = this._activeItems.indexOf(focusedNode);

            switch (e.code) {
                case 'ArrowDown':
                    focusIndex++;
                    break;
                case 'ArrowUp':
                    focusIndex--;
                    break;
            }

            focusNode = this._activeItems[focusIndex];
        }

        if (!focusNode) {
            return;
        }

        $.removeClass(focusedNode, this.constructor.classes.focus);
        $.removeDataset(focusedNode, 'uiFocus');
        $.addClass(focusNode, this.constructor.classes.focus);
        $.setDataset(focusNode, { uiFocus: true });

        const id = $.getAttribute(focusNode, 'id');
        $.setAttribute(this._toggle, { 'aria-activedescendent': id });
        $.setAttribute(this._searchInput, { 'aria-activedescendent': id });

        const itemsScrollY = $.getScrollY(this._menuNode);
        const itemsRect = $.rect(this._menuNode, { offset: true });
        const nodeRect = $.rect(focusNode, { offset: true });

        if (nodeRect.top < itemsRect.top) {
            $.setScrollY(this._menuNode, itemsScrollY + nodeRect.top - itemsRect.top);
        } else if (nodeRect.bottom > itemsRect.bottom) {
            $.setScrollY(this._menuNode, itemsScrollY + nodeRect.bottom - itemsRect.bottom);
        }
    });

    if (this._options.getResults) {
        // infinite scrolling event
        $.addEvent(this._menuNode, 'scroll.ui.tagsinput', $._throttle((_) => {
            if (this._request || !this._showMore) {
                return;
            }

            const height = $.height(this._menuNode);
            const scrollHeight = $.height(this._menuNode, { boxSize: $.SCROLL_BOX });
            const scrollTop = $.getScrollY(this._menuNode);

            if (scrollTop >= scrollHeight - height - (height / 4)) {
                const term = $.getValue(this._searchInput);
                const offset = this._data.length;

                this._loadingScroll = true;
                this._getData({ term, offset });
            }
        }, 250, { leading: false }));
    }

    $.addEvent(this._searchInput, 'focus.ui.tagsinput', (_) => {
        if (!$.isSame(this._searchInput, document.activeElement)) {
            return;
        }

        $.hide(this._placeholder);
        $.detach(this._placeholder);
        $.addClass(this._toggle, 'focus');
    });

    $.addEvent(this._searchInput, 'blur.ui.tagsinput', (_) => {
        if ($.isSame(this._searchInput, document.activeElement)) {
            return;
        }

        if ($.getDataset(this._searchInput, 'uiKeepFocus')) {
            // prevent losing focus when toggle element is focused
            return;
        }

        const value = $.getValue(this._searchInput);

        if (value) {
            if (this._options.confirmOnBlur) {
                this._selectValue(value, { focus: false });
            } else if (this._options.clearOnBlur) {
                $.setValue(this._searchInput, '');
            }
        }

        $.removeClass(this._toggle, 'focus');

        if (!$.isConnected(this._menuNode)) {
            this._refreshPlaceholder();
            return;
        }

        if ($.getDataset(this._menuNode, 'uiAnimating') === 'out') {
            return;
        }

        $.stop(this._menuNode);
        $.removeDataset(this._menuNode, 'uiAnimating');

        this.hide();
    });

    $.addEvent(this._toggle, 'mousedown.ui.tagsinput', (e) => {
        if ($.is(e.target, '[data-ui-action="clear"]')) {
            e.preventDefault();
            return;
        }

        if ($.hasClass(this._toggle, 'focus')) {
            // maintain focus when toggle element is already focused
            $.setDataset(this._searchInput, { uiKeepFocus: true });
        } else {
            $.hide(this._placeholder);
            $.addClass(this._toggle, 'focus');
        }

        $.addEventOnce(window, 'mouseup.ui.tagsinput', (_) => {
            $.removeDataset(this._searchInput, 'uiKeepFocus');
            $.focus(this._searchInput);

            if (!e.button) {
                this.show();
            }
        });
    });

    $.addEventDelegate(this._toggle, 'click.ui.tagsinput', '[data-ui-action="clear"]', (e) => {
        if (e.button) {
            return;
        }

        e.stopPropagation();

        // remove selection
        const element = $.parent(e.currentTarget);
        const index = $.index(element);
        const value = this._value.slice();
        value.splice(index, 1);
        this._setValue(value, { triggerEvent: true });
        $.focus(this._searchInput);
    });
};
