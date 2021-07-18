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
