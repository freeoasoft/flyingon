flyingon.fragment('f-tree-renderer', function (base) {


    this.unmount = function (control) {

        this.__unmount_children(control);

        control.view_content = null;
        base.unmount.call(this, control);
    };


    this.__children_patch = function (control, patch) {

        var view = control.view_content || control.view,
            last = view.lastChild;

        base.__children_patch.apply(this, arguments);

        //最后一个节点发生变化且是线条风格则需处理
        if (last !== view.lastChild && (last = last.firstChild) && 
            last.className.indexOf(' f-tree-node-last') >= 0)
        {
            remove_line(last, control.isTreeNode ? control.level() + 1 : 0);
        }
    };


    //移除节点线条
    function remove_line(node, level) {

        node.className = node.className.replace(' f-tree-node-last', '');

        node = node.nextSibling;
        node.className = node.className.replace(' f-tree-list-last', '');

        if (node = node.firstChild)
        {
            remove_background(node, level);
        }
    };


    //移除子节点线条背景
    function remove_background(node, level) {

        var dom;

        while (node)
        {
            if (dom = node.firstChild)
            {
                dom.children[level].style.background = '';

                if (dom = node.lastChild.firstChild)
                {
                    remove_background(dom, level);
                }
            }

            node = node.nextSibling;
        }
    };


});



flyingon.renderer('Tree', function (base) {



    this.__scroll_html = '';



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            length = control.length;
        
        writer.push('<div');
        
        this.renderDefault(writer, control, 
            (className || '') + 'f-tree-theme-' + storage.theme + 
                (!storage.checked ? ' f-tree-no-check' : '') + 
                (!storage.icon ? ' f-tree-no-icon' : ''));
        
        writer.push(' onclick="flyingon.Tree.onclick.call(this, event)">');

        if (length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, control, 0, length);
        }

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push('</div>');
    };



    this.__render_children = function (writer, control, items, start, end) {

        var line = (control.__storage || control.__defaults).theme === 'line',
            format = control.format,
            last = control[control.length - 1],
            item;

        while (start < end)
        {
            if (item = items[start++])
            {
                item.view || item.renderer.render(writer, item, format, 0, item === last, line);
            }
        }
    };



    flyingon.Tree.onclick = function (e) {

        var target = e.target || e.srcElement,
            node;

        while (target && target.getAttribute)
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
                    flyingon.findControl(this).trigger('node-click', 'node', node);
                    return;

                case 'tree':
                    return;

                default:
                    target = target.parentNode;
                    break;
            }
        }
    };


    
    flyingon.fragment('f-tree-renderer', this, base);


    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, control, 0, control.length, view.firstChild);
        }
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



    this.render = function (writer, node, format, level, last, line, space) {

        var encode = flyingon.html_encode,
            storage = node.__storage || node.__defaults,
            icon,
            text,
            any;

        node.rendered = true;

        writer.push('<div class="', encode(node.fullClassName), '">',
            '<div class="f-tree-node', last && line ? ' f-tree-node-last' : '',
            (any = storage.className) ? ' class="' + encode(any) + '"' : '',  
            (any = storage.id) ? '" id="' + encode(any) + '"' : '', '" tag="node">');

        if (space)
        {
            writer.push(space);
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
            text = format(node, text);
        }

        writer.push('<span class="f-tree-check f-tree-', storage.checked ? 'checked' : 'unchecked', '" tag="check"></span>',
            '<span class="f-tree-icon ', storage.icon || icon, '" tag="icon"></span>',
            '<span class="f-tree-text" tag="text">', text, '</span></div>',
            '<div class="f-tree-list', last && line ? ' f-tree-list-last' : '', '">');

        if (!storage.collapsed && node.length > 0)
        {
            this.__render_children(writer, node, node, 0, node.length, format, ++level, last, line);
        }

        writer.push('</div></div>');
    };


    //渲染子项
    this.__render_children = function (writer, node, items, start, end, format, level, last, line) {

        var item, space, any;

        node.__content_render = true;

        //如果未传入渲染参数则初始化渲染参数
        if (format === void 0 && (item = node.parent))
        {
            level = 1;
            last = item[item.length - 1] === node;
            
            do
            {
                if (item.isTreeNode)
                {
                    level++;
                }
                else
                {
                    format = item.format || null;
                    line = (item.__storage || item.__defaults).theme === 'line';
                    break;
                }
            }
            while (item = item.parent);
        }

        space = last && line ? ' style="background:none;"' : '';
        space = '<span class="f-tree-space"' + space + '></span>';

        if (level > 1)
        {
            space = new Array(level + 1).join(space);
        }

        any = items.length;
            
        while (start < end)
        {
            if (item = items[start++])
            {
                if (item.view)
                {
                    item.renderer.unmount(item);
                }

                item.renderer.render(writer, item, format, level, start === any, line, space);
            }
        }
    };

        
    
    flyingon.fragment('f-tree-renderer', this, base);


    this.mount = function (control, view) {

        var dom = control.view_content = view.lastChild;

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, control, 0, control.length, dom.firstChild);
        }
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
            this.__render_children(any = [], node, node, 0, node.length);

            view.innerHTML = any.join('');

            this.__mount_children(node, view, node, 0, node.length, view.lastChild);
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