import $ from '@fr0st/query';
import { BaseComponent, Popper } from '@fr0st/ui';

/**
 * TagsInput Class
 * @class
 */
export default class TagsInput extends BaseComponent {
    /**
     * New TagsInput constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [settings] The options to create the TagsInput with.
     */
    constructor(node, settings) {
        super(node, settings);

        if (!$.is(this._node, 'select')) {
            throw new Error('TagsInput must be created on a select element');
        }

        this._placeholderText = this._options.placeholder;
        this._maxSelections = this._options.maxSelections;

        this._data = [];
        this._optionLookup = {};
        this._activeItems = [];

        this._getData = null;

        let data;
        if ($._isFunction(this._options.getResults)) {
            this._getResultsInit();
        } else if ($._isArray(this._options.data)) {
            data = this._options.data;
        } else {
            data = this._getDataFromDOM(this._node);
        }

        if (data) {
            this._data = data;
            this._getDataInit();
        }

        const value = [...this._node.selectedOptions].map((option) => $.getValue(option));

        this._render();
        this._setValue(value);
        this._events();
    }

    /**
     * Disable the TagsInput.
     */
    disable() {
        $.setAttribute(this._node, { disabled: true });
        this._refreshDisabled();
    }

    /**
     * Dispose the TagsInput.
     */
    dispose() {
        if (this._popper) {
            this._popper.dispose();
            this._popper = null;
        }

        $.removeAttribute(this._node, 'tabindex');
        $.removeEvent(this._node, 'focus.ui.tagsinput');
        $.removeClass(this._node, this.constructor.classes.hide);
        $.remove(this._menuNode);
        $.remove(this._toggle);

        this._toggle = null;
        this._clear = null;
        this._searchInput = null;
        this._placeholder = null;
        this._menuNode = null;
        this._data = null;
        this._optionLookup = null;
        this._activeItems = null;
        this._value = null;
        this._request = null;
        this._popperOptions = null;
        this._getData = null;

        super.dispose();
    }

    /**
     * Enable the TagsInput.
     */
    enable() {
        $.removeAttribute(this._node, 'disabled');
        this._refreshDisabled();
    }

    /**
     * Hide the TagsInput.
     */
    hide() {
        if (
            !$.isConnected(this._menuNode) ||
            $.getDataset(this._menuNode, 'uiAnimating') ||
            !$.triggerOne(this._node, 'hide.ui.tagsinput')
        ) {
            return;
        }

        $.setDataset(this._menuNode, { uiAnimating: 'out' });

        this._refreshPlaceholder();

        $.fadeOut(this._menuNode, {
            duration: this._options.duration,
        }).then((_) => {
            this._popper.dispose();
            this._popper = null;

            $.empty(this._menuNode);
            $.detach(this._menuNode);
            $.removeDataset(this._menuNode, 'uiAnimating');
            $.setAttribute(this._toggle, {
                'aria-expanded': false,
                'aria-activedescendent': '',
            });
            $.triggerEvent(this._node, 'hidden.ui.tagsinput');
        }).catch((_) => {
            if ($.getDataset(this._menuNode, 'uiAnimating') === 'out') {
                $.removeDataset(this._menuNode, 'uiAnimating');
            }
        });
    }

    /**
     * Show the TagsInput.
     */
    show() {
        if (
            !this._getData ||
            $.is(this._node, ':disabled') ||
            $.isConnected(this._menuNode) ||
            $.getDataset(this._menuNode, 'uiAnimating') ||
            !$.triggerOne(this._node, 'show.ui.tagsinput')
        ) {
            return;
        }

        const term = $.getValue(this._searchInput);
        this._getData({ term });

        $.setDataset(this._menuNode, { uiAnimating: 'in' });

        if (this._options.appendTo) {
            $.append(this._options.appendTo, this._menuNode);
        } else {
            $.after(this._toggle, this._menuNode);
        }

        this._popper = new Popper(this._menuNode, this._popperOptions);

        $.fadeIn(this._menuNode, {
            duration: this._options.duration,
        }).then((_) => {
            $.removeDataset(this._menuNode, 'uiAnimating');
            $.setAttribute(this._toggle, { 'aria-expanded': true });
            $.triggerEvent(this._node, 'shown.ui.tagsinput');
        }).catch((_) => {
            if ($.getDataset(this._menuNode, 'uiAnimating') === 'in') {
                $.removeDataset(this._menuNode, 'uiAnimating');
            }
        });
    }

    /**
     * Toggle the TagsInput.
     */
    toggle() {
        if ($.isConnected(this._menuNode)) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Update the TagsInput position.
     */
    update() {
        if (this._popper) {
            this._popper.update();
        }
    }
}
