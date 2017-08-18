flyingon.renderer('Tab', function (base) {




    this.__scroll_html = '';




    this.render = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            any;

        control.__content_render = true;

        writer.push('<div');
        
        this.renderDefault(writer, control, 'f-tab-direction-' + storage.direction);
        
        writer.push('><div class="f-tab-head f-tab-theme-', storage.theme, '" tag="head">',
                    '<div class="f-tab-line"></div>',
                    '<div class="f-tab-content"></div>',
                    '<div class="f-tab-forward" tag="forward"><span class="f-tab-scroll" tag="forward"></span></div>',
                    '<div class="f-tab-back" tag="back"><span class="f-tab-scroll" tag="back"></span></div>',
                '</div>',
            '<div class="f-tab-body">');

        if (any = control.selectedPage())
        {
            any.renderer.render(writer, any, false); 
        }

        writer.push('</div></div>');
    };


    this.mount = function (control, view) {

        var page = control.selectedPage();

        base.mount.call(this, control, view);
        
        this.__insert_patch(control, view);

        if (page)
        {
            page.renderer.mount(page, view.lastChild.firstChild);
        }

        control.on('click', on_click);
    };


    this.unmount = function (control) {

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };


    function on_click(event) {

        var node = event.original_event.target;

        switch (node.getAttribute('tag'))
        {
            case 'forward':
                if ((this.__scroll_header -= 100) < 0)
                {
                    this.__scroll_header = 0;
                }

                update_header(this);
                break;

            case 'back':
                this.__scroll_header += 100;

                update_header(this);
                break;
        }
    };


    this.selected = function (control, view, page) {

        //移动到当前位置
        var storage = control.__storage || control.__defaults,
            size = storage.size,
            space = storage.space;

        if (!page.view)
        {
            view.lastChild.appendChild(page.renderer.createView(page, false));
            page.renderer.update(page, false);
        }
        
        if (size > 0)
        {
            size = control.indexOf(page) * (size + space);
        }
        else if ('left,right'.indexOf(storage.direction) >= 0)
        {
            size = page.view_head.offsetTop - space;
        }
        else
        {
            size = page.view_head.offsetLeft - space;
        }

        control.__scroll_header = size;
        control.__update_dirty && update_header(control);
    };


    //页签风格变更处理
    this.theme = function (control, view, value) {

        view.className = view.className.replace(/f-tab-type-\w+/, 'f-tab-type-' + value);
    };

    

    this.__insert_patch = function (control, view) {

        var item, node, tag;

        view = view.firstChild.firstChild.nextSibling;
            
        //处理插入带view的节点
        for (var i = control.length - 1; i >= 0; i--)
        {
            if (item = control[i])
            {
                if (node = item.view_head)
                {
                    if (node.parentNode === view)
                    {
                        tag = node;
                        continue;
                    }
                }
                else
                {
                    item.renderer.__render_header(item);
                    node = item.view_head;
                }

                if (tag)
                {
                    view.insertBefore(node, tag);
                }
                else
                {
                    view.appendChild(node);
                }

                tag = node;
            }
        }
    };


    this.__remove_patch = function (control, patch) {

        var view = control.view.firstChild.firstChild.nextSibling,
            index = 0, 
            item,
            any;

        while (item = patch[index++])
        {
            //移除节点且还未移除视图
            if (item.parent !== control && (any = item.view_head) && (any.parentNode === view))
            {
                view.removeChild(any);
            }
        }
        
        base.__remove_patch.apply(this, arguments);
    };



    this.update = function (control) {

        var page = control.selectedPage();

        base.update.call(this, control);
        
        if (control.__reset_header)
        {
            control.__reset_header = false;
            reset_header(control);
        }

        if (control.length > 0)
        {
            if (control.header() > 0)
            {
                update_header(control);
            }

            this.__arrange(control);
        }

        if (page)
        {
            if (!page.view)
            {
                control.view.lastChild.appendChild(page.renderer.createView(page, false));
            }

            page.renderer.update(page, false);
        }

        control.__arrange_dirty = 0;
    };


    
    function update_header(control) {

        var view = control.view.firstChild.firstChild.nextSibling,
            node = view.firstChild,
            length = control.length,
            name = flyingon.rtl ? 'right' : 'left',
            storage = control.__storage || control.__defaults,
            vertical = 'left,right'.indexOf(storage.direction) >= 0,
            space = storage.space,
            style, //默认样式
            total, //容器空间
            size,
            any;

        any = storage.header - storage.offset;

        if (vertical)
        {
            style = 'margin-top:' + space + 'px;width:' + any + 'px;line-height:' + (storage.size - 2) + 'px;';
            total = control.offsetHeight - control.borderTop - control.borderBottom - storage.start;
        }
        else
        {
            style = 'margin-' + name + ':' + space + 'px;height:' + any + 'px;line-height:' + (any - 2) + 'px;';
            total = control.offsetWidth - control.borderLeft - control.borderRight - storage.start;
        }

        //充满可用空间
        if (storage.fill)
        {
            //计算可用大小
            total -= space * (length + 1) + storage.end;

            any = style + (vertical ? 'height:' : 'width:');

            while (node)
            {
                size = total / length | 0;
                node.style.cssText = any + size + 'px;';

                node = node.nextSibling;

                length--;
                total -= size;
            }
            
            length = 0;
        }
        else
        {
            any = (size = storage.size) > 0 ? size + 'px;' : 'auto;';

            if (vertical)
            {
                style += 'height:' + any + 'margin-top:' + space + 'px;';
            }
            else
            {
                style += 'width:' + any + 'margin-' + name + ':' + space + 'px;';
            }

            while (node)
            {
                node.style.cssText = style;
                node = node.nextSibling;
            }

            if (size > 0)
            {
                length = (size + space) * length + space;
            }
            else
            {
                length = (vertical ? view.offsetHeight : view.offsetWidth) + space;
            }
        }

        //有滚动条
        if ((any = length - total) > 0)
        {
            any += storage.scroll - 1;

            if (control.__scroll_header > any)
            {
                control.__scroll_header = size = any;
            }
            else
            {
                size = control.__scroll_header - storage.scroll + 1;
            }
        }
        else
        {
            control.__scroll_header = size = any = 0;
        }

        view.style[vertical ? 'top' : name] = -(storage.start + size) + 'px';

        node = view.nextSibling;
        node.style.display = node.nextSibling.style.display = any > 0 ? '' : 'none';
    };


    //重算页头
    function reset_header(control) {

        var view = control.view,
            storage = control.__storage || control.__defaults,
            style1 = view.firstChild.style, //head
            style2 = view.lastChild.style, //body
            direction = storage.direction,
            header = storage.header,
            text = ':' + header + 'px',
            any;

        view.className = view.className.replace(/f-tab-direction-\w+/, 'f-tab-direction-' + direction);
        
        switch (direction)
        {
            case 'left':
                style1.cssText = 'right:auto;width' + text;
                style2.cssText = direction + text;
                text = 'height';
                break;

            case 'right':
                style1.cssText = 'left:auto;width' + text;
                style2.cssText = direction + text;
                text = 'height';
                break;

            case 'bottom':
                style1.cssText = 'top:auto;height' + text;
                style2.cssText = direction + text;
                text = 'width';
                break;

            default:
                style1.cssText = 'bottom:auto;height' + text;
                style2.cssText = direction + text;
                text = 'width';
                break;
        }

        if (header > 0)
        {
            view = view.firstChild.firstChild;

            if (view = view.nextSibling)
            {
                view.style.cssText = any = direction + ':' + storage.offset + 'px';
                text = text + ':' + storage.scroll + 'px;display:none;' + any;
                
                while (view = view.nextSibling)
                {
                    view.style.cssText = text;
                }
            }

            style1.display = '';
        }
        else
        {
            style1.display ='none';
        }
    };


    this.__arrange = function (control) {
        
        var storage = control.__storage || control.__defaults,
            header = storage.header,
            width = control.offsetWidth - control.borderLeft - control.borderRight - control.paddingLeft - control.paddingRight,
            height = control.offsetHeight - control.borderTop - control.borderBottom - control.paddingTop - control.paddingBottom;

        if (header > 0)
        {
            if ('left,right'.indexOf(storage.direction) >= 0)
            {
                width -= header;
            }
            else
            {
                height -= header;
            }
        }

        for (var i = control.length - 1; i >= 0; i--)
        {
            var item = control[i];

            item.measure(width, height, width, height, 3);
            item.locate(0, 0);
        }
    };



});



flyingon.renderer('TabPage', 'Panel', function (base) {



    this.__render_header = function (control) {

        var node = control.view_head = document.createElement('span'),
            writer = [],
            encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            any;

        node.className = 'f-tab-item' + (control.selected() ? ' f-tab-selected' : '');

        writer.push('<a class="f-tab-link">',
            '<span class="f-tab-icon ', (any = storage.icon) ? encode(any) : 'f-tab-icon-none', '"></span>',
            '<span class="f-tab-text">', (any = storage.text) ? encode(any) : '', '</span>');

        if ((any = storage.buttons) && (any = encode(any).replace(/(\w+)\W*/g, '<span class="f-tab-button $1" tag="button"></span>')))
        {
            writer.push(any);
        }

        writer.push('<span class="f-tab-close"', storage.closable ? '' : ' style="display:none"', ' tag="close"></span>',
            '</a>');

        node.innerHTML = writer.join('');
        
        node.page = control;
        node.onclick = on_click;
    };


    function on_click(event) {

        var page = this.page,
            node;

        event = event || window.event;
        node = event.target || event.srcElement;

        while (node && node !== this)
        {
            switch (node.getAttribute('tag'))
            {
                case 'close':
                    page.remove();
                    return;

                case 'button':
                    this.trigger('button-click', 'page', page);
                    return;
            }

            node = node.parentNode;
        }

        page.parent.selectedPage(page);
    };


    this.unmount = function (control) {

        var view = control.view_head;

        control.view_head = view.control = view.onclick = null;

        base.unmount.call(this, control);
    };



    this.icon = function (control, value) {

        control.view_head.firstChild.firstChild.className = 'f-tab-icon ' + (value || 'f-tab-icon-none');
    };


    this.text = function (control, value) {

        control.view_head.firstChild.firstChild.nextSibling[this.__text_name] = value;
    };


    this.buttons = function (control, value) {

        var last = (view = control.view_head).firstChild.lastChild,
            node = last.previousSibling;

        while (node && node.getAttribute('tag') === 'button')
        {
            node = node.previousSibling;
            view.removeChild(node.nextSibling);
        }

        if (value)
        {
            value = flyingon.html_encode(any).replace(/(\w+)\W*/g, '<span class="f-tab-button $1" tag="button"></span>');
            flyingon.dom_html(view, value, last);
        }
    };


    this.closable = function (control, value) {

        control.view_head.firstChild.lastChild.style.display = value ? '' : 'none';
    };


    this.selected = function (control, value) {

        if (control.view)
        {
            control.view.style.display = value ? '' : 'none';
        }

        control.view_head.className = 'f-tab-item' + (value ? ' f-tab-selected' : '');
    };


});