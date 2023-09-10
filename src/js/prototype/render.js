import $ from '@fr0st/query';
import { generateId } from '@fr0st/ui';

/**
 * Render the toggle element.
 */
export function _render() {
    this._renderPlaceholder();
    this._renderMenu();
    this._renderToggle();

    if (this._options.getResults) {
        this._loader = this._renderInfo(this._options.lang.loading);
        this._error = this._renderInfo(this._options.lang.error);
    }

    this._popperOptions = {
        reference: this._toggle,
        placement: this._options.placement,
        position: this._options.position,
        fixed: this._options.fixed,
        spacing: this._options.spacing,
        minContact: this._options.minContact,
    };

    if (this._options.fullWidth) {
        this._popperOptions.afterUpdate = (node, reference) => {
            const width = $.width(reference, $.BORDER_BOX);
            $.setStyle(node, { width: `${width}px` });
        };

        this._popperOptions.beforeUpdate = (node) => {
            $.setStyle(node, { width: '' });
        };
    }

    // hide the input node
    $.addClass(this._node, this.constructor.classes.hide);
    $.setAttribute(this._node, { tabindex: -1 });

    $.after(this._node, this._toggle);
};

/**
 * Render an information item.
 * @param {string} text The text to render.
 * @return {HTMLElement} The information element.
 */
export function _renderInfo(text) {
    const element = $.create('li', {
        html: this._options.sanitize(text),
        class: this.constructor.classes.info,
    });

    return element;
};

/**
 * Render an item.
 * @param {string} value The value to render.
 * @return {HTMLElement} The item element.
 */
export function _renderItem(value) {
    const id = generateId('autocomplete-item');

    const active = this._value.some((otherValue) => otherValue == value);

    const element = $.create('li', {
        class: this.constructor.classes.item,
        attributes: {
            id,
            'role': 'option',
            'aria-label': value,
            'aria-selected': active,
        },
        dataset: {
            uiAction: 'select',
            uiValue: value,
        },
    });

    this._activeItems.push(element);

    if (active) {
        $.addClass(element, this.constructor.classes.active);
        $.setDataset(element, { uiActive: true });
    }

    const content = this._options.renderResult.bind(this)(value, element);

    if ($._isString(content)) {
        $.setHTML(element, this._options.sanitize(content));
    } else if ($._isElement(content) && !$.isSame(element, content)) {
        $.append(element, content);
    }

    return element;
};

/**
 * Render the menu.
 */
export function _renderMenu() {
    const id = generateId('selectmenu');

    this._menuNode = $.create('ul', {
        class: this.constructor.classes.menu,
        style: { maxHeight: this._options.maxHeight },
        attributes: {
            id,
            'role': 'listbox',
            'aria-multiselectable': true,
        },
    });

    if ($.is(this._node, '.input-sm')) {
        $.addClass(this._menuNode, this.constructor.classes.menuSmall);
    } else if ($.is(this._node, '.input-lg')) {
        $.addClass(this._menuNode, this.constructor.classes.menuLarge);
    }
};

/**
 * Render the placeholder.
 */
export function _renderPlaceholder() {
    this._placeholder = $.create('span', {
        html: this._placeholderText ?
            this._options.sanitize(this._placeholderText) :
            '&nbsp;',
        class: this.constructor.classes.placeholder,
    });
};

/**
 * Render results.
 * @param {array} results The results to render.
 */
export function _renderResults(results) {
    $.show(this._menuNode);

    for (const value of results) {
        const element = this._renderItem(value);
        $.append(this._menuNode, element);
    }

    if (!$.hasChildren(this._menuNode)) {
        $.hide(this._menuNode);
        return;
    }

    const focusedNode = $.findOne('[data-ui-focus]', this._menuNode);

    if (!focusedNode && this._activeItems.length) {
        const element = this._activeItems[0];

        $.addClass(element, this.constructor.classes.focus);
        $.setDataset(element, { uiFocus: true });

        const id = $.getAttribute(element, 'id');
        $.setAttribute(this._toggle, { 'aria-activedescendent': id });
        $.setAttribute(this._searchInput, { 'aria-activedescendent': id });
    }
};

/**
 * Render a selection item.
 * @param {object} value The value to render.
 * @return {HTMLElement} The selection element.
 */
export function _renderSelection(value) {
    const group = $.create('div', {
        class: this.constructor.classes.tagGroup,
    });

    const element = $.create('div', {
        class: this.constructor.classes.tagItem,
    });

    const content = this._options.renderSelection.bind(this)(value, element);

    if ($._isString(content)) {
        $.setHTML(element, this._options.sanitize(content));
    } else if ($._isElement(content) && !$.isSame(element, content)) {
        $.append(element, content);
    }

    if (this._options.showClear) {
        const closeBtn = $.create('div', {
            class: this.constructor.classes.tagClear,
            attributes: {
                'role': 'button',
                'aria-label': this._options.lang.clear,
            },
            dataset: {
                uiAction: 'clear',
            },
        });

        $.append(group, closeBtn);

        const closeIcon = $.create('small', {
            class: this.constructor.classes.tagClearIcon,
        });

        $.append(closeBtn, closeIcon);
    }

    $.append(group, element);

    return group;
};

/**
 * Render the toggle element.
 */
export function _renderToggle() {
    const id = $.getAttribute(this._menuNode, 'id');

    this._toggle = $.create('div', {
        class: [
            $.getAttribute(this._node, 'class') || '',
            this.constructor.classes.tagToggle,
        ],
        attributes: {
            'role': 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': false,
            'aria-disabled': false,
            'aria-controls': id,
            'aria-activedescendent': '',
        },
    });

    this._searchInput = $.create('input', {
        class: this.constructor.classes.tagInput,
        attributes: {
            'role': 'searchbox',
            'aria-autocomplete': 'list',
            'aria-label': this._options.lang.search,
            'aria-describedby': id,
            'aria-activedescendent': '',
            'autocomplete': 'off',
        },
    });
};
