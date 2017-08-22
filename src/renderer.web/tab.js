flyingon.renderer('Tab', function (base) {




    this.__scroll_html = '';




    this.render = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            any;

        control.__content_render = true;

        writer.push('<div');
        
        this.renderDefault(writer, control, 'f-tab-direction-' + storage.direction);
        
        writer.push('><div class="f-tab-head f-tab-theme-', storage.theme, '">',
                    '<div class="f-tab-line"></div>',
                    '<div class="f-tab-content"></div>',
                    '<div class="f-tab-move f-tab-forward" onclick="flyingon.Tab.forward.call(this)"><a class="f-tab-move-link"><span class="f-tab-move-icon"></span></a></div>',
                    '<div class="f-tab-move f-tab-back" onclick="flyingon.Tab.back.call(this)"><a class="f-tab-move-link"><span class="f-tab-move-icon"></span></a></div>',
                '</div>',
            '<div class="f-tab-body">');

        if (any = control.selectedPage())
        {
            any.renderer.render(writer, any, false); 
        }

        writer.push('</div></div>');
    };



    flyingon.Tab.forward = function () {

        var control = control = flyingon.findControl(this);

        if ((control.__scroll_header -= 100) < 0)
        {
            control.__scroll_header = 0;
        }

        update_header(control);
    };


    flyingon.Tab.back = function () {

        var control = control = flyingon.findControl(this);

        control.__scroll_header += 100;
        update_header(control);
    };



    this.mount = function (control, view) {

        var page = control.selectedPage();

        base.mount.call(this, control, view);
        
        this.__insert_head(control);

        if (page)
        {
            page.renderer.mount(page, view.lastChild.firstChild);
        }
    };


    this.unmount = function (control) {

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    this.selected = function (control, view, page) {

        //移动到当前位置
        var storage = control.__storage || control.__defaults,
            size = storage.size,
            space = storage.space,
            head,
            start;

        if (!page.view)
        {
            view.lastChild.appendChild(page.renderer.createView(page, false));
            page.renderer.locate(page);
        }

        head = page.view_head;

        if (size > 0)
        {
            start = control.indexOf(page) * (size + space);
        }
        else if ('left,right'.indexOf(storage.direction) >= 0)
        {
            size = head.offsetWidth;
            start = head.offsetTop - space;
        }
        else
        {
            size = head.offsetHeight;
            start = head.offsetLeft - space;
        }

        view = view.firstChild.firstChild.nextSibling;
        space = -view.offsetLeft;

        //如果起始位置在可见区或可见区的右边
        if (start > space)
        {
            //如果整个页头在可见区则不调整位置
            size = head.offsetLeft + size;
            start = view.parentNode.offsetWidth;

            if (size < space + start)
            {
                return;
            }

            start = size - start + 80; //后移一点方便点击后一节点
        }
        else if ((start -= 50) < 0) //前移一点方便点击前一节点
        {
            start = 0;
        }

        if (control.__scroll_header !== start)
        {
            control.__scroll_header = start;
            control.__update_dirty || update_header(control);
        }
    };


    //页签风格变更处理
    this.theme = function (control, view, value) {

        view.className = view.className.replace(/f-tab-type-\w+/, 'f-tab-type-' + value);
    };

    

    this.__insert_head = function (control) {

        var view = control.view.firstChild.firstChild.nextSibling,
            item, 
            node, 
            tag;        
            
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


    this.__insert_patch = function (control, index, items) {

        this.__insert_head(control);
    };


    this.__remove_patch = function (control, items, detach) {

        var view = control.view.firstChild.firstChild.nextSibling,
            index = 0, 
            item,
            any;

        while (item = items[index++])
        {
            //移除节点且还未移除视图
            if (item.parent !== control && (any = item.view_head) && (any.parentNode === view))
            {
                view.removeChild(any);
            }
        }

        base.__remove_patch.apply(this, arguments);
    };



    this.locate = function (control) {

        var page = control.selectedPage();

        base.locate.call(this, control);
        
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

            page.renderer.locate(page);
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
        node.onclick = onclick;
    };


    function onclick(e) {

        var page = this.page,
            target = (e || (e = window.event)).target || e.srcElement;

        while (target && target !== this)
        {
            switch (target.getAttribute('tag'))
            {
                case 'close':
                    page.remove();
                    return;

                case 'button':
                    this.trigger('button-click', 'page', page);
                    return;
            }

            target = target.parentNode;
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