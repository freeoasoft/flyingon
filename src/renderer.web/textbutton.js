flyingon.renderer('TextButton', 'TextBox', function (base) {

    
    
    this.lineHeight = 1;
    


    this.render = function (writer, control, render) {

        var type = control.__type;

        writer.push('<span');
        
        render.call(this, writer, control);

        writer.push(' onmouseover="flyingon.TextButton.onmouseover.call(this)"',
            ' onmouseout="flyingon.TextButton.onmouseout.call(this)"',
            ' onkeydown="return flyingon.TextButton.onkeydown.call(this, event)">',
                '<input type="text" class="f-textbox-text f-border-box" style="',
                    flyingon.rtl ? 'padding-left:22px;' : 'padding-right:22px;',
                    (control.__storage || control.__defaults).inputable ? '' : ' readonly="readonly"',
                    '" onchange="flyingon.TextButton.onchange.call(this)"/>',
                '<span class="f-textbox-button" style="width:20px;" onclick="flyingon.TextButton.onclick.call(this, event)">');

        if (type === 'up-down')
        {
            writer.push('<span class="f-textbox-up"></span>',
                '<span class="f-textbox-down"></span>');
        }
        else
        {
            writer.push('<span class="f-textbox-icon ', type, '"></span>');
        }
                    
        writer.push('</span></span>');
    };


    flyingon.TextButton.onmouseover = function () {

        var control = flyingon.findControl(this);
        
        if (control.__button === 'hover')
        {
            control.renderer.button(control, control.view, 1);
        }
    };


    flyingon.TextButton.onmouseout = function () {

        var control = flyingon.findControl(this);

        if (control.__button === 'hover')
        {
            control.renderer.button(control, control.view);
        }
    };


    flyingon.TextButton.onkeydown = function (event) {

        switch (event.keyCode)
        {
            case 13: //回车
            case 40: //向下箭头
                flyingon.dom_stop(event);
                flyingon.TextButton.onclick.call(this);
                return false;
        }
    };


    flyingon.TextButton.onchange = function () {

        var control = flyingon.findControl(this),
            value = control.__to_value(this.value);

        if (control.value() !== value)
        {
            control.value(value);
            control.trigger('change', 'value', control.value());
        }
        else
        {
            control.renderer.value(control, control.view);
        }
    };

    
    flyingon.TextButton.onclick = function (e) {

        var control = flyingon.findControl(this),
            any = control.__storage || control.__defaults;

        if (!any.disabled && !any.readonly)
        {
            if (control.__type === 'up-down')
            {
                if ((any = e.target) && any.parentNode === this)
                {
                    control.__on_click(any.className.indexOf('-up') >= 0); //参数表示是升还是降
                }
            }
            else
            {
                control.__on_click();
            }
        }
    };



    this.inputable = function (control, view, value) {

        if (value)
        {
            view.firstChild.removeAttribute('readonly');
        }
        else
        {
            view.firstChild.setAttribute('readonly', 'readonly');
        }
    };


    this.icon = function (control, view, value) {

        view.lastChild.firstChild.className = 'f-textbox-icon ' + value;
    };


    this.button = function (control, view, focus) {

        var storage = control.__storage || control.__defaults,
            size = storage.buttonSize;

        switch (control.__button = storage.button)
        {
            case 'hover':
                focus || (size = 0);
                break;

            case 'none':
                size = 0;
                break;
        }

        view.firstChild.style[flyingon.rtl ? 'paddingLeft' : 'paddingRight'] = size + 2 + 'px';
        view.lastChild.style.width = size + 'px';
    };



});