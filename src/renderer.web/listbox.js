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
                change(flyingon.findControl(this), this, 0, index | 0, true);
                return;
            }

            dom = dom.parentNode;
        }
    };


    function change(control, view, oldIndex, newIndex, change) {

        var type = control.__list_type,
            any;

        if (change)
        {
            oldIndex = control.__selectedIndex;
        }

        //多选
        if (type === 'checkbox')
        {
            if (change) //通过界面操作变更
            {
                if (oldIndex && (any = oldIndex.indexOf(newIndex)) >= 0)
                {
                    oldIndex.splice(any, 1);
                    change_selected(view, newIndex, false, type);
                }
                else
                {
                    change_selected(view, newIndex, true, type);

                    if (oldIndex)
                    {
                        oldIndex.push(newIndex);
                    }
                    else
                    {
                        oldIndex = [newIndex];
                    }
                }

                newIndex = oldIndex;
            }
            else //批量修改
            {
                if (oldIndex) //清除原来选中
                {
                    for (var i = oldIndex.length - 1; i >= 0; i--)
                    {
                        if (!newIndex || newIndex.indexOf(oldIndex[i]) < 0)
                        {
                            change_selected(view, oldIndex[i], false, type);
                        }
                    }
                }

                if (newIndex) //增加新选中
                {
                    for (var i = newIndex.length - 1; i >= 0; i--)
                    {
                        if (!oldIndex || oldIndex.indexOf(newIndex[i]) < 0)
                        {
                            change_selected(view, newIndex[i], true, type);
                        }
                    }
                }
            }
        }
        else //单选
        {
            if (newIndex === oldIndex)
            {
                return;
            }

            if (oldIndex >= 0) //清除原选中
            {
                change_selected(view, oldIndex, false, type);
            }

            if (newIndex >= 0)
            {
                change_selected(view, newIndex, true, type);
            }
        }

        if (change)
        {
            control.__use_index = true;
            control.__selectedIndex = newIndex;

            control.trigger('change', 'value', control.selectedValue());
        }
    };


    function change_selected(view, index, selected, type) {

        if (view = view.children[index])
        {
            var name = ' f-listbox-selected',
                index = view.className.indexOf(name);

            if (selected)
            {
                if (index < 0)
                {
                    view.className += name;

                    if (type && (view = view.firstChild))
                    {
                        view.checked = true;
                    }
                }
            }
            else if (index >= 0)
            {
                view.className = view.className.replace(name, '');

                if (type && (view = view.firstChild))
                {
                    view.checked = false;
                }
            }
        }
    };


    this.locate = function (control) {

        base.locate.call(this, control);
        this.content(control);
    };


    this.content = function (control) {

        var storage = control.__storage || control.__defaults,
            items = storage.items;
            
        if (!items)
        {
            return '';
        }

        var writer = [],
            encode = flyingon.html_encode,
            template = control.__template,
            type = control.__list_type,
            selected = control.selectedIndex(),
            clear = !type && storage.clear ? 1 : 0,
            columns = storage.columns,
            itemHeight = storage.itemHeight,
            display = storage.displayField,
            style = ' style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;',
            left = flyingon.rtl ? 'right:' : 'left:',
            top = 0,
            index = 0,
            length = items.length,
            width,
            checked,
            item,
            x,
            y,
            any;

        if (columns <= 0)
        {
            columns = items.length;
        }

        if (columns > 1)
        {
            any = control.offsetWidth - control.borderLeft - control.borderRight - control.paddingLeft - control.paddingRight;

            if (control.offsetHeight - control.borderTop - control.borderBottom - control.paddingTop - control.paddingBottom <
                Math.ceil(items.length / columns) * itemHeight)
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

        switch (type)
        {
            case 'radio':
                break;

            case 'checkbox':
                checked = selected.length > 0 && selected.pair();
                break;

            default:
                type = null;
                break;
        }

        if (!template && (template = storage.template))
        {
            if (typeof template === 'string')
            {
                template = new flyingon.view.Template(template).parse(true);
            }

            control.__template = template = template instanceof Array ? template : [template];
        }

        if (template)
        {
            length = template.length;
        }

        while (index < length)
        {
            item = items[index];
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

            any = checked ? checked[index] : selected === index;

            writer.push('<div class="f-listbox-item', any ? ' f-listbox-selected"' : '"', 
                style, 'top:', y, 'px;', left, x, 'px;" index="', index++, '">');

            if (type)
            {
                writer.push('<input type="', type, '"', any ? ' checked="checked"' : '', '/>');
            }

            if (template)
            {
                for (var j = 0, l = template.length; j < l; j++)
                {
                    render_template(writer, item, index, template[j], display, encode);
                }
            }
            else
            {
                any = item;

                if (display)
                {
                    any = any && any[display] || '';
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


    function render_template(writer, item, index, template, display, encode) {

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

                            if (any === 'index')
                            {
                                any = index;
                            }
                            else if (display)
                            {
                                any = item ? item[display] : '';
                            }
                            else if (any === 'item')
                            {
                                any = item;
                            }
                            else
                            {
                                any = '';
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
                    render_item(writer, item, any[i]);
                }
            }
            else
            {
                render_item(writer, item, any);
            }
        }

        writer.push('</', tag, '>');
    };



});