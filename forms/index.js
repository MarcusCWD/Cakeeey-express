// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets


var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget. classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createCakeForm = (seasons, ingredients) => {
    console.log(ingredients)
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
        }),
        'waittime': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators':[validators.integer()]
        }),
        'description': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'season_id': fields.string({
            label:'Season',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: seasons
        }),
        'ingredients': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: ingredients
        }),
        
    })
};


module.exports = { createCakeForm, bootstrapField };