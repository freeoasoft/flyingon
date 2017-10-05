flyingon.renderer('TextBox', function (base) {



    this.lineHeight = 1;



    //注: onchange, onpropertychange在IE8下不冒泡
    this.render = function (writer, control, render) {

        writer.push('<span');
        
        render.call(this, writer, control);

        writer.push('><input type="', control.__type || 'text', 
            '" class="f-textbox-text f-border-box" onchange="flyingon.TextBox.onchange.call(this)"/></span>');
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this);

        if (control.value() !== this.value)
        {
            control.value(this.value);
            control.trigger('change', 'value', control.value());
        }
        else
        {       
            this.value = control.text();
        }
    };


    this.disabled = function (control, view, value) {

        if (value)
        {
            view.firstChild.setAttribute('disabled', 'disabled');
        }
        else
        {
            view.firstChild.removeAttribute('disabled');
        }
    };

    
    this.readonly = function (control, view, value) {

        if (value)
        {
            view.firstChild.setAttribute('readonly', 'readonly');
        }
        else
        {
            view.firstChild.removeAttribute('readonly');
        }
    };

    
    this.padding = function (control, view, value) {

        view.firstChild.style.padding = value;
    };


    this.color = function (control, view, value) {

        view.firstChild.style.color = value;
    };


    this.lineHeight = function (control, view, value) {

        view.firstChild.style.lineHeight = value;
    };


    this.textAlign = function (control, view, value) {

        view.firstChild.style.textAlign = value;
    };



    function placeholder(control, view, value) {

        if (view = view.firstChild)
        {
            if (value)
            {
                view.value = value;

                if (!control.__placeholder)
                {
                    control.__placeholder = 1;
                    view.className += ' f-placeholder';
                }
            }
            else if (control.__placeholder)
            {
                view.value = control.__placeholder = '';
                view.className = view.className.replace(' f-placeholder', '');
            }
        }
    };


    this.value = function (control, view) {

        var storage = control.__storage,
            any;

        if ((any = control.__storage) && !any.value && (any = any.placeholder))
        {
            placeholder(control, view, any);
        }
        else
        {
            if (control.__placeholder)
            {
                placeholder(control, view, '');
                control.__placeholder = 0;
            }

            view.firstChild.value = control.text();
        }
    };



    this.__do_focus = function (control) {

        if (control.__placeholder)
        {
            placeholder(control, control.view, '');
        }
    };


    this.__do_blur = function (control) {

        this.value(control, control.view);
    };


    this.selectionStart = function (control, value) {
        
        var view = control.view.firstChild;

        if (value === void 0)
        {
            return view.selectionStart;
        }

        view.selectionStart = value | 0;
        return control;
    };


    this.selectionEnd = function (control, value) {

        var view = control.view.firstChild;

        if (value === void 0)
        {
            return view.selectionEnd;
        }

        view.selectionEnd = value | 0;
        return control;
    };


    this.select = function (control) {

        control.view.firstChild.select();
    };


});