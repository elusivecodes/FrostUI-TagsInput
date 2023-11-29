import $ from '@fr0st/query';
import { initComponent } from '@fr0st/ui';
import TagsInput from './tags-input.js';
import { add, getMaxSelections, getPlaceholder, getValue, remove, removeAll, setMaxSelections, setPlaceholder, setValue } from './prototype/api.js';
import { _getDataInit, _getResultsInit } from './prototype/data.js';
import { _events } from './prototype/events.js';
import { _refresh, _refreshDisabled, _refreshPlaceholder, _selectValue, _setValue, _updateSearchWidth } from './prototype/helpers.js';
import { _buildOption, _getDataFromDOM } from './prototype/parsers.js';
import { _render, _renderInfo, _renderItem, _renderMenu, _renderPlaceholder, _renderResults, _renderSelection, _renderToggle } from './prototype/render.js';

// TagsInput default options
TagsInput.defaults = {
    placeholder: '',
    lang: {
        clear: 'Remove selection',
        error: 'Error loading data.',
        loading: 'Loading..',
        maxSelections: 'Selection limit reached.',
        search: 'Search',
    },
    data: null,
    getResults: null,
    renderResult: (value) => value,
    renderSelection: (value) => value,
    sanitize: (input) => $.sanitize(input),
    isMatch(value, term) {
        const escapedTerm = $._escapeRegExp(term);
        const regExp = new RegExp(escapedTerm, 'i');

        if (regExp.test(value)) {
            return true;
        }

        const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        return regExp.test(normalized);
    },
    sortResults(a, b, term) {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();

        if (term) {
            const diff = aLower.indexOf(term) - bLower.indexOf(term);

            if (diff) {
                return diff;
            }
        }

        return aLower.localeCompare(bLower);
    },
    validTag: (value) => !!value,
    maxSelections: 0,
    minSearch: 1,
    confirmKeys: [',', ' '],
    confirmOnBlur: true,
    clearOnBlur: true,
    showClear: true,
    closeOnSelect: true,
    debounce: 250,
    duration: 100,
    maxHeight: '250px',
    appendTo: null,
    fullWidth: false,
    placement: 'bottom',
    position: 'start',
    fixed: false,
    spacing: 0,
    minContact: false,
};

// TagsInput classes
TagsInput.classes = {
    active: 'active',
    disabled: 'disabled',
    disabledItem: 'disabled',
    focus: 'focus',
    hide: 'visually-hidden',
    info: 'tagsinput-item text-body-secondary',
    item: 'tagsinput-item',
    menu: 'tagsinput-menu list-unstyled',
    menuSmall: 'tagsinput-menu-sm',
    menuLarge: 'tagsinput-menu-lg',
    placeholder: 'tagsinput-placeholder',
    tagClear: 'btn d-flex',
    tagClearIcon: 'btn-close p-0 my-auto pe-none',
    tagGroup: 'btn-group my-n1',
    tagInput: 'tagsinput-input',
    tagItem: 'btn',
    tagToggle: 'tagsinput d-flex flex-wrap position-relative text-start',
};

// TagsInput prototype
const proto = TagsInput.prototype;

proto.add = add;
proto.getMaxSelections = getMaxSelections;
proto.getPlaceholder = getPlaceholder;
proto.getValue = getValue;
proto.remove = remove;
proto.removeAll = removeAll;
proto.setMaxSelections = setMaxSelections;
proto.setPlaceholder = setPlaceholder;
proto.setValue = setValue;
proto._events = _events;
proto._buildOption = _buildOption;
proto._getDataFromDOM = _getDataFromDOM;
proto._getDataInit = _getDataInit;
proto._getResultsInit = _getResultsInit;
proto._refresh = _refresh;
proto._refreshDisabled = _refreshDisabled;
proto._refreshPlaceholder = _refreshPlaceholder;
proto._render = _render;
proto._renderInfo = _renderInfo;
proto._renderItem = _renderItem;
proto._renderMenu = _renderMenu;
proto._renderPlaceholder = _renderPlaceholder;
proto._renderResults = _renderResults;
proto._renderSelection = _renderSelection;
proto._renderToggle = _renderToggle;
proto._selectValue = _selectValue;
proto._setValue = _setValue;
proto._updateSearchWidth = _updateSearchWidth;

// TagsInput init
initComponent('tagsinput', TagsInput);

export default TagsInput;
