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
