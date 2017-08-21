flyingon.renderer('Tree', function (base) {



    this.__scroll_html = '';



    this.render = function (writer, control) {

        var any = control.__storage || control.__defaults;
        
        writer.push('<div');
        
        this.renderDefault(writer, control, 
            'f-tree-theme-' + any.theme + 
                (!any.checked ? ' f-tree-no-check' : '') + 
                (!any.icon ? ' f-tree-no-icon' : ''), 
            'overflow:auto;padding:2px;');
        
        writer.push(' onclick="flyingon.Tree.onclick.call(this, event)">');

        if ((any = control.length) > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, 0, any);
        }

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push('</div>');
    };



    this.__render_children = function (writer, control, start, end) {

        var format = control.format,
            last = control.length,
            item;

        while (start < end)
        {
            if (item = control[start++])
            {
                item.view || item.renderer.render(writer, item, start === last, format, 0);
            }
        }
    };



    flyingon.Tree.onclick = function (e) {

        var target = e.target || e.srcElement,
            node;

        while (target)
        {
            switch (target.getAttribute('tag'))
            {
                case 'folder':
                    node = flyingon.findControl(target);
                    node.collapsed(!node.collapsed());
                    return;

                case 'check':
                    node = flyingon.findControl(target);
                    node.checked(!node.checked());
                    return;

                case 'node':
                    node = flyingon.findControl(target);
                    target = flyingon.findControl(this);

                    target.trigger('node-click', 'node', node);
                    return;

                case 'tree':
                    return;

                default:
                    target = target.parentNode;
                    break;
            }
        }
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, 0, view.firstChild);
        }
    };
    

    this.unmount = function (control) {

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    this.theme = function (control, view, value) {

        view.className = view.className.replace(/f-tree-theme-\w+/, 'f-tree-theme-' + value);
    };


    this.checked = function (control, view, value) {

        var name = view.className;

        if (value)
        {
            name = name.replace(' f-tree-no-check', '');
        }
        else
        {
            name += ' f-tree-no-check';
        }

        view.className = name;
    };


    this.icon = function (control, view, value) {

        var name = view.className;

        if (value)
        {
            name = name.replace(' f-tree-no-icon', '');
        }
        else
        {
            name += ' f-tree-no-icon';
        }

        view.className = name;
    };


});



flyingon.renderer('TreeNode', function (base) {



    //空格html缓存
    var space_cache = [];



    this.render = function (writer, node, last, format, level) {

        var encode = flyingon.html_encode,
            storage = node.__storage || node.__defaults,
            icon,
            text,
            any;

        node.rendered = true;

        writer.push('<div class="', encode(node.fullClassName), '">',
            '<div class="f-tree-node', last ? ' f-tree-node-last' : '',
            (any = storage.className) ? ' class="' + encode(any) + '"' : '',  
            (any = storage.id) ? '" id="' + encode(any) + '"' : '', '" tag="node">');

        if (level > 0)
        {
            writer.push(space_cache[level] || (space_cache[level] = new Array(level + 1).join('<span class="f-tree-space"></span>')));
        }

        if (any = storage.delay)
        {
            storage.delay = false;
        }
        
        if (any || node.length > 0)
        {
            if (any || storage.collapsed)
            {
                icon = 'f-tree-icon-close';
                writer.push('<span class="f-tree-folder f-tree-close" tag="folder"></span>');
            }
            else
            {
                icon = 'f-tree-icon-open';
                writer.push('<span class="f-tree-folder f-tree-open" tag="folder"></span>');
            }
        }
        else
        {
            icon = 'f-tree-icon-file';
            writer.push('<span class="f-tree-file"></span>');
        }

        text = (text = storage.text) ? encode(text) : '';

        if (format)
        {
            text = format(text);
        }

        writer.push('<span class="f-tree-check f-tree-', storage.checked ? 'checked' : 'unchecked', '" tag="check"></span>',
            '<span class="f-tree-icon ', storage.icon || icon, '" tag="icon"></span>',
            '<span class="f-tree-text" tag="text">', text, '</span></div>',
            '<div class="f-tree-list', last ? ' f-tree-list-last' : '', '">');

        if (!storage.collapsed && node.length > 0)
        {
            this.__render_children(writer, node, 0, node.length, format, ++level);
        }

        writer.push('</div></div>');
    };


    //渲染子项
    this.__render_children = function (writer, node, start, end, format, level) {

        var item, any;

        node.__content_render = true;

        //如果未传入渲染参数则初始化渲染参数
        if (format === void 0)
        {
            item = node;
            level = 0;
            
            while ((any = item.parent) && any.isTreeNode)
            {
                item = any;
                level++;
            }

            format = item.format || null;
        }

        any = node.length;
            
        while (start < end)
        {
            if (item = node[start++])
            {
                //相同级别的视图可以复用
                if (item.view)
                {
                    if (item.__level === level)
                    {
                        continue;
                    }

                    item.renderer.unmount(item);
                }

                item.renderer.render(writer, item, start === any, format, item.__level = level);
            }
        }
    };

        
    this.mount = function (node, view) {

        base.mount.call(this, node, view);

        if (node.__content_render)
        {
            this.__mount_children(node, view, 0, view.lastChild.firstChild);
        }
    };
    

    this.unmount = function (node) {

        this.__unmount_children(node);
        base.unmount.call(this, node);
    };



    this.checked = function (node, view, value) {

        value = value ? 'checked' : (node.checkedChildren ? 'checked2' : 'unchecked');
        find_dom(view, 'check', 'f-tree-check f-tree-' + value);
    };


    this.icon = function (node, view, value) {

        find_dom(view, 'icon', 'f-tree-icon ' + value);
    };


    this.text = function (node, view, value) {

        var any;

        if (view = find_dom(view, 'text'))
        {
            while ((any = node.parent) && any.isTreeNode)
            {
                node = any;
            }

            if (any = node && node.format)
            {
                view.innerHTML = format(flyingon.html_encode(value));
            }
            else
            {
                view[this.__text_name] = value;
            }
        }
    };


    this.expand = function (node) {

        var view = node.view,
            any;

        find_dom(view, 'folder', 'f-tree-folder f-tree-open');

        if (any = find_dom(view, 'icon'))
        {
            any.className = any.className.replace('f-tree-icon-close', 'f-tree-icon-open');
        }

        view = view.lastChild;

        if (!node.__content_render)
        {
            this.__render_children(any = [], node, 0, node.length);

            view.innerHTML = any.join('');

            this.__mount_children(node, view, 0, view.firstChild);
        }
        
        view.style.display = '';
    };


    this.collapse = function (node) {

        var view = node.view;

        view.lastChild.style.display = 'none';

        find_dom(view, 'folder', 'f-tree-folder f-tree-close');
        
        if (view = find_dom(view, 'icon'))
        {
            view.className = view.className.replace('f-tree-icon-open', 'f-tree-icon-close');
        }
    };


    function find_dom(view, tag, className) {

        var node = view.firstChild.lastChild;

        while (node)
        {
            if (node.getAttribute('tag') === tag)
            {
                if (className)
                {
                    node.className = className;
                }

                return node;
            }

            node = node.previousSibling;
        }
    };



});