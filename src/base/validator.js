flyingon.validator = (function () {


    var all = flyingon.create(null);


    all.required = function (text) {

        return text.length > 0;
    };


    all.min = function (text, length) {

        return text >= length;
    };


    all.max = function (text, length) {

        return text <= length;
    };


    all.minLength = function (text, length) {

        return text.length >= length;
    };


    all.maxLength = function (text, length) {

        return text.length <= length;
    };


    all.length = function (text, min, max) {

        return text.length >= min && text.length <= max;
    };


    all.email = function (text) {

        return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(text);
    };


    all.url = function (text) {

        return /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(text);
    };


    all.date = function (text) {

        return /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(text);
    };


    all.int = function(text) {

        text = +text;
        return (text | 0) === text;
    };


    all.number = function (text) {

        text = +text;
        return text === text;
    };



    function validate(control, errors) {

        var validator = control.__validator,
            length;

        if (validator && (length = validator.length))
        {
            validate_control(control, validator, length, errors);
        }
        
        if ((length = control.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                validate(control[i], errors);
            }
        }
    };


    function validate_control(control, validator, length, errors) {

        var text, args, any;

        if (any = control.__errors)
        {
            for (var i = any.length - 1; i >= 0; i--)
            {
                any[i].visible(false);
            }

            any.length = 0;
        }

        for (var i = 0; i < length; i++)
        {
            if (text = control.value || control.text)
            {
                text = text.call(control);

                for (var j = 0, l = validator.length; j < l; j++)
                {
                    if (!(any = all[validator[j++]]) || 
                        !any.apply(control, (args = validator[j].slice(0), args[0] = text, args)))
                    {
                        any = validator[j].slice(0);
                        any.control = control;

                        errors.push(any);
                        return;
                    }
                }
            }
        }
    };


    function show_errors(errors) {

        var controls = flyingon.validator.errors;

        for (var i = 0, l = errors.length; i < l; i++)
        {
            var error = errors[i],
                control = error.control,
                index = 0,
                list,
                any;

            if ((any = control.id()) && (list = controls[any]))
            {
                while (control = list[index++])
                {
                    if (!(any = control.__storage) || !(any = any.validator) || any.indexOf(error[0]) >= 0)
                    {
                        control.show(error);
                    }
                }
            }
        }
    };


    flyingon.validate = function (control) {

        var errors = [];

        validate(control, errors);

        errors[0] && show_errors(errors);

        return errors;
    };

    
    return function (key, fn) {

        all[key] = fn;
    };


})();



flyingon.fragment('f-validate', function () {


    this.defineProperty('validator', '', {
        
        set: function (value) {

            var list = [],
                item;

            if (value)
            {
                value = value.split('|');

                for (var i = 0, l = value.length; i < l; i++)
                {
                    if ((item = value[i]) && (item = item.split(':'))[0])
                    {
                        list.push(item[0], item);
                    }
                }
            }

            this.__validator = list.length > 0 ? list : null;
        }
    });



});