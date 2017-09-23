flyingon.validator = (function () {



    var tooltip;

    var all = flyingon.create(null);

    var i18n = flyingon.i18ntext;



    function validate(control, errors) {

        var any = control.__validator;
         
        if ((length = any && any.length) || control.__required)
        {
            validate_control(control, any, length, errors);
        }
        
        if ((any = control.length) > 0)
        {
            for (var i = 0; i < any; i++)
            {
                validate(control[i], errors);
            }
        }
    };


    function validate_control(control, validator, length, errors) {

        var text, args, any;

        if (text = control.value || control.text)
        {
            text = text.call(control);

            if (control.__required)
            {
                if (!text.length)
                {
                    any = create_error(control, 'required', i18n('validator.required'));
                    errors.push(any);
                    return;
                }
            }

            for (var i = 0; i < length; i++)
            {
                if ((any = all[validator[i++]]) && 
                    (any = any.apply(control, (args = validator[i].slice(0), args[0] = text, args))) &&
                    (any = i18n(any, null)))
                {
                    any = create_error(control, '', any, validator[i]);
                    errors.push(any);
                    return;
                }
            }
        }

        //清空错误信息
        set_error(control);
    };


    function create_error(control, name, text, args) {

        var error = {

            control: control, 
            name: name || (name = args[0]), 
            text: text.replace(/\{\{([^{}]*)\}\}/g, function (text, key) {

                switch (key)
                {
                    case 'name':
                        return name;

                    case 'title':
                        return (key = control.parent) ? key.__error_title() : text;
                }

                return args && args[key] || text;
            })
        };

        set_error(control, error);

        return error;
    };


    function set_error(control, error) {

        var parent = control.parent;

        if (parent && parent.__validate_box)
        {
            parent.__set_validate(error, control);
        }
        else
        {
            control.__set_validate(error);
        }
    };



    flyingon.validate = function (control) {

        var errors = [];

        validate(control, errors);

        return errors;
    };


    flyingon.validate.mouseover = function (e) {

        var tip = tooltip || (tooltip = new flyingon.ToolTip().addClass('f-validate-tip'));

        tip.html(true).text(this.__validate_text).show(this);
    };


    flyingon.validate.mouseout = function () {

        tooltip && tooltip.close();
    };



    all.required = function (text) {

        if (!text.length)
        {
            return i18n('validator.required');
        }
    };


    all.min = function (text, value) {

        if (text < value)
        {
            return i18n('validator.min');
        }
    };


    all.max = function (text, value) {

        if (text > value)
        {
            return i18n('validator.max');
        }
    };


    all.minLength = function (text, length) {

        if (text.length < length)
        {
            return i18n('validator.minLength');
        }
    };


    all.maxLength = function (text, length) {

        if (text.length > length)
        {
            return i18n('validator.maxLength');
        }
    };


    all.length = function (text, min, max) {

        if (text.length < min || text.length > max)
        {
            return i18n('validator.length');
        }
    };


    all.email = function (text) {

        if (!/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(text))
        {
            return i18n('validator.email');
        }
    };


    all.url = function (text) {

        if (!/(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(text))
        {
            return i18n('validator.url');
        }
    };


    all.date = function (text) {

        if (!/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(text))
        {
            return i18n('validator.date');
        }
    };


    all.int = function(text) {

        if (((text = +text) | 0) !== text)
        {
            return i18n('validator.int');
        }
    };


    all.number = function (text) {

        if ((text = +text) === text)
        {
            return i18n('validator.number');
        }
    };

    
    return function (key, fn) {

        all[key] = fn;
    };


})();



flyingon.fragment('f-validate', function () {



    var validate = flyingon.validate;



    //是否必填
    this.defineProperty('required', false, {

        set: function (value) {

            var any = this.parent;

            this.__required = value;

            if (any && any.__validate_box && any.rendered && (any = any.__find_title()))
            {
                any.renderer.set(any, 'required', value);
            }
        }
    });


    //校验器
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



    //设置或清除检验信息
    this.__set_validate = function (error) {

        if (this.__validate_text = error && error.text)
        {
            this.addClass('f-validate-error');

            if (!this.__validate_event)
            {
                this.__validate_event = true;
                this.on('mouseover', validate.mouseover);
                this.on('mouseout', validate.mouseout);
            }
        }
        else if (this.__validate_event)
        {
            this.removeClass('f-validate-error');

            this.off('mouseover', validate.mouseover);
            this.off('mouseout', validate.mouseout);
        }
    };


});