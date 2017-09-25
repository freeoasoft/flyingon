flyingon.validator = (function () {



    var tooltip;

    var all = flyingon.create(null);

    var i18n = flyingon.i18ntext;



    (flyingon.validate = function (control, show) {

        var errors = [],
            fn;

        if (control && (fn = control.__validate))
        {
            fn.call(control, errors, show);
        }

        return errors;

    }).all = all;


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

    var all = validate.all;
    
    var i18n = flyingon.i18ntext;



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
                    if (item = value[i])
                    {
                        list.push(item.split(':'));
                    }
                }
            }

            this.__validator = list.length > 0 ? list : null;
        }
    });



    //内部校验方法
    this.__validate = function (errors, show) {
        
        var required = this.__required,
            validator = this.__validator;

        if (required || validator)
        {
            var text = (this.value || this.text).call(this),
                items,
                any;
            
            if (required && !text.length)
            {
                any = create_error(this, 'required', i18n('validator.required'));

                show !== false && set_error(this, any);
                errors.push(any);
                return;
            }

            if (validator)
            {
                for (var i = 0, l = validator.length; i < l; i++)
                {
                    items = validator[i++];

                    if (any = all[items[0]])
                    {
                        items = items.slice(0);
                        items[0] = text;

                        if ((any = any.apply(this, items)) && (any = i18n(any, null)))
                        {
                            any = create_error(this, '', any, items);

                            show !== false && set_error(this, any);
                            errors.push(any);
                            return;
                        }
                    }
                }
            }
        }
   
        //清空错误信息
        show !== false && set_error(this);
    };


    function create_error(control, name, text, items) {

        var error = {

            control: control, 
            name: name || (name = items[0]), 
            text: text.replace(/\{([^{}]*)\}/g, function (text, key) {

                switch (key)
                {
                    case 'name':
                        return name;

                    case 'title':
                        return (key = control.parent) ? key.__error_title() : text;
                }

                return items && items[key] || text;
            })
        };

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