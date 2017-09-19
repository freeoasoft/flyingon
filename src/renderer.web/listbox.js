flyingon.renderer('ListBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);

        writer.push(' onclick="flyingon.ListBox.onclick.call(this, event)"></div>');
    };



    flyingon.ListBox.onclick = function (e) {

        var dom = e.target || e.srcElement;

        while (dom !== this)
        {
            var index = dom.getAttribute('index');

            if (index)
            {
                change(flyingon.findControl(this), this, index | 0);
                return;
            }

            dom = dom.parentNode;
        }
    };


    function change(control, view, index) {

        var storage = control.storage(),
            checked = storage.checked,
            selected = control.__selected,
            value = index >= 0 ? (value = control.__list).value(value[index]) : '',
            any;

        //多选
        if (checked === 'checkbox')
        {
            if (selected && (any = selected.indexOf(index)) >= 0)
            {
                selected.splice(any, 1);
                change_selected(view, index, false, checked);

                any = storage.value.split(storage.separator);
                any.splice(any.indexOf(value), 1);

                storage.value = any.join(storage.separator);
            }
            else
            {
                change_selected(view, index, true, checked);

                if (selected)
                {
                    selected.push(index);
                }
                else
                {
                    selected = [index];
                }

                storage.value = (any = storage.value) ? any + storage.separator + value : value;
            }

            index = selected;
        }
        else if (index === selected)
        {
            return;
        }
        else
        {
            if (selected >= 0) //清除原选中
            {
                change_selected(view, selected, false, checked);
            }

            if (index >= 0)
            {
                change_selected(view, index, true, checked);
            }

            storage.value = value;
        }

        control.__selected = index;
        control.trigger('change', 'value', storage.value);
    };


    function change_selected(view, index, selected, checked) {

        if (view = view.children[index])
        {
            var name = ' f-listbox-selected',
                index = view.className.indexOf(name);

            if (selected)
            {
                if (index < 0)
                {
                    view.className += name;
                }
            }
            else if (index >= 0)
            {
                view.className = view.className.replace(name, '');
            }
            else
            {
                return;
            }

            if (checked !== 'none' && (view = view.firstChild))
            {
                view.checked = selected;
            }
        }
    };


    this.locate = function (control) {

        base.locate.call(this, control);
        control.__list && this.content(control);
    };


    this.content = function (control) {

        var writer = [],
            list = control.__list,
            valueField = list.valueField,
            displayField = list.displayField,
            template = control.__template,
            encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            value = storage.value,
            checked = storage.checked,
            checkbox = checked === 'checkbox',
            selected = checkbox ? (control.__selected = []) : 0,
            clear = !checkbox && storage.clear ? 1 : 0,
            columns = storage.columns,
            itemHeight = storage.itemHeight,
            style = ' style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;',
            left = flyingon.rtl ? 'right:' : 'left:',
            top = 0,
            index = 0,
            length = list.length,
            width,
            item,
            key,
            x,
            y,
            any;

        if (checkbox)
        {
            value = value.split(storage.separator || ',').pair();
        }

        if (columns <= 0)
        {
            columns = length;
        }

        if (columns > 1)
        {
            any = control.offsetWidth - control.borderLeft - control.borderRight - control.paddingLeft - control.paddingRight;

            if (control.offsetHeight - control.borderTop - control.borderBottom - control.paddingTop - control.paddingBottom <
                Math.ceil(length / columns) * itemHeight)
            {
                any -= flyingon.vscroll_width;
            }

            width = any / columns | 0;
            style += 'width:' + (width - 10) + 'px;';
        }
        else
        {
            width = 0;
            style += flyingon.rtl ? 'left:0;' : 'right:0;'; //单列时充满可用空间
        }

        if (!template && (template = storage.template))
        {
            if (typeof template === 'string')
            {
                template = new flyingon.view.Template(template).parse(true);
            }

            control.__template = template = template instanceof Array ? template : [template];
        }

        while (index < length)
        {
            item = list[index];
            any = index + clear;

            if (columns > 1)
            {
                x = (any % columns) * width;
                y = (any / columns | 0) * itemHeight;
            }
            else
            {
                x = 0;
                y = any * itemHeight;
            }

            key = valueField ? (item ? item[valueField] : '') : item;

            if (checkbox)
            {
                if (any = value[key])
                {
                    selected.push(index);
                }
            }
            else if (any = value === key)
            {
                control.__selected = index;
            }
            
            writer.push('<div class="f-listbox-item', any ? ' f-listbox-selected"' : '"', 
                style, 'top:', y, 'px;', left, x, 'px;" index="', index++, '">');

            if (checked !== 'none')
            {
                writer.push('<input type="', checked, '"', any ? ' checked="checked"' : '', '/>');
            }

            if (template)
            {
                any = template.length;

                for (var j = 0; j < any; j++)
                {
                    render_template(writer, item, index, template[j], encode);
                }
            }
            else
            {
                any = item;

                if (displayField)
                {
                    any = any && any[displayField] || '';
                }

                if (any && typeof any === 'string')
                {
                    any = encode(any);
                }

                writer.push(any);
            }

            writer.push('</div>');
        }

        //生成清除项
        if (clear)
        {
            writer.push('<div class="f-listbox-item f-listbox-clear"', style, 'top:0;', left, '0;" index="-1"><span>', 
                flyingon.i18ntext('listbox.clear'), '</span></div>');
        }

        control.view.innerHTML = writer.join('');
    };


    function render_template(writer, item, index, template, encode) {

        var tag = template.Class || 'div',
            text,
            any;

        writer.push('<', tag);

        for (var name in template)
        {
            switch (name)
            {
                case 'Class':
                case 'children':
                    break;

                default:
                    if ((any = template[name]) != null)
                    {
                        if (name.charAt(0) === ':')
                        {
                            name = name.substring(1);

                            if (any === '{{index}}')
                            {
                                any = index;
                            }
                            else if (any === '{{item}}')
                            {
                                any = item;
                            }
                            else
                            {
                                any = item ? item[any] : '';
                            }
                        }

                        if (any && typeof any === 'string')
                        {
                            any = encode(any);
                        }

                        if (name === 'text')
                        {
                            text = any;
                        }
                        else
                        {
                            writer.push(' ', name, '="', any, '"');
                        }
                    }
                    break;
            }
        }

        writer.push('>');

        if (text)
        {
            writer.push(text);
        }
        else if (any = template.children)
        {
            if (any instanceof Array)
            {
                for (var i = 0, l = any.length; i < l; i++)
                {
                    render_template(writer, item, index, any[i], encode);
                }
            }
            else
            {
                render_template(writer, item, index, any, encode);
            }
        }

        writer.push('</', tag, '>');
    };



});