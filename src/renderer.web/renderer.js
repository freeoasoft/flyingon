//控件渲染器
(function () {
    
    

    //是否右向顺序
    flyingon.rtl = false;



    var self = this;

    //注册的渲染器集合
    var registry_list = flyingon.create(null);

    //唯一id
    var uniqueId = flyingon.__uniqueId;

    //创建html的dom节点(给createView用)
    var dom_html = document.createElement('div');

    //margin border padding css样式缓存
    var sides_cache = flyingon.create(null);

    //css名称映射
    var css_map = flyingon.css_map(true);

    //style名称映射
    var style_map = flyingon.css_map();

    //定位属性映射
    var location_map = {

        32: ['minWidth', 'min-width'],
        64: ['maxWidth', 'max-width'],
        128: ['minHeight', 'min-height'],
        256: ['maxHeight', 'max-height']
    };




    //滚动条位置控制
    this.__scroll_html = '<div class="f-scroll" style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;width:1px;height:1px;"></div>';

       
    //设置text属性名
    this.__text_name = 'textContent' in document.head ? 'textContent' : 'innerText';

    
    //是否支持auto尺寸
    this.__auto_size = 1;


    //是否设置padding
    this.padding = 1;
    



    function css_sides(value) {

        var any = +value;

        if (any === any)
        {
            return sides_cache[value] = (any | 0) + 'px';
        }

        return sides_cache[value] = value ? value.replace(/(\d+)(\s+|$)/g, '$1px$2') : '';
    };



    //创建控件视图
    this.createView = function (control, position) {

        var host = dom_html,
            view,
            any;

        this.render(any = [], control);

        host.innerHTML = any.join('');

        view = host.firstChild;
        host.removeChild(view); //需先从父节点移除,否则在IE下会被销毁

        host.innerHTML = '';

        if (position !== false && !(any = view.style).position)
        {
            any.position = 'relative';
        }

        this.mount(control, view);

        return view;
    };


    //渲染html
    this.render = function (writer, control, className, cssText) {

        writer.push('<div');

        this.renderDefault(writer, control, className, cssText);

        writer.push('></div>');
    };


    //渲染控件默认样式及属性
    this.renderDefault = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            encode = flyingon.html_encode,
            html = control.__as_html,
            any;

        control.rendered = true;
        
        if (any = control.__id || storage.id)
        {
            writer.push(' id="', encode(any), '"');
        }

        writer.push(' class="', encode(control.fullClassName), 
            html ? ' f-html' : ' f-absolute', 
            className ? ' ' + className : '',
            '" style="');

        if (cssText)
        {
            writer.push(cssText);
        }

        if (any = control.__style)
        {
            this.__render_style(writer, control, any, encode);
        }

        if (any = control.__location_dirty)
        {
            control.__location_dirty = 0;

            if (html)
            {
                this.__render_location(writer, control, any);
            }
        }

        if (any = storage.border)
        {
            writer.push('border-width:', sides_cache[any] || css_sides(any), ';');
        }
        
        if ((any = storage.padding) && this.padding)
        {
            writer.push('padding:', sides_cache[any] || css_sides(any), ';');
        }

        if (!storage.visible)
        {
            writer.push('display:none;');
        }

        writer.push('"');
    };


    this.__render_style = function (writer, control, values, encode) {

        var map = css_map,
            value, 
            any;

        for (var name in values)
        {
            if (name === 'cssText' || (value = values[name]) === '')
            {
                continue;
            }

            switch (any = this[name])
            {
                case 1: //直接设置样式
                    writer.push(name, ':', encode(value), ';');
                    break;

                case 2: //需要检测前缀
                    writer.push(map[name], ':', encode(value), ';');
                    break;

                case 9: //特殊样式
                    (control.__style_patch || (control.__style_patch = {}))[name] = value;
                    break;

                default:
                    if (typeof any !== 'function')
                    {
                        if (any = map[name])
                        {
                            writer.push(any, ':', encode(value), ';');
                            self[name] = any === name ? 1 : 2; //直接设置样式标记为1,需要加前缀标记为2
                            break;
                        }

                        self[name] = 9; //标记为特殊样式
                    }
                    
                    if (!(any = control.__style_patch))
                    {
                        any = control.__view_patch || (control.__view_patch = {});
                        any = any.__style_patch = controls.__style_patch = {};
                    }

                    any[name] = value;
                    break;
            }
        }
    };


    this.__render_location = function (writer, control, dirty) {

        var values = control.__storage || control.__defaults,
            flag = 1,
            name,
            value,
            any;

        while (dirty >= flag)
        {
            if (dirty & flag)
            {
                switch (flag)
                {
                    case 1:
                    case 2:
                        if (value = values[name = flag === 1 ? 'width' : 'height'])
                        {
                            if (value === 'default' || value === 'auto')
                            {
                                writer.push(name, ':auto;');
                            }
                            else
                            {
                                writer.push(name, ':', value >= 0 ? value + 'px' : value, ';');
                            }
                        }
                        break;

                    case 4:
                        if (value = values.margin)
                        {
                            writer.push('margin:', sides_cache[value] || css_sides(value), ';');
                        }
                        break;

                    case 8:
                        if (value = values.border)
                        {
                            writer.push('border-width:', sides_cache[value] || css_sides(value), ';');
                        }
                        break;

                    case 16:
                        if (this.padding && (value = values.padding))
                        {
                            writer.push('padding:', sides_cache[value] || css_sides(value), ';');
                        }
                        break;

                    case 32:
                    case 64:
                    case 128:
                    case 256:
                        any = location_map[flag];

                        if (value = values[any[0]])
                        {
                            writer.push(any[1], ':', value > 0 ? value + 'px' : value, ';');
                        }
                        break;

                    case 512:
                    case 1024:
                        if (value = values[name = flag < 1000 ? 'left' : 'top'])
                        {
                            writer.push(name, ':', (any = +value) === any ? value + 'px' : value, ';');
                        }
                        break;
                }
            }

            flag <<= 1;
        }
    };




    //挂载视图
    this.mount = function (control, view) {

        var any;
        
        control.view = view;

        if (!(any = control.__uniqueId))
        {
            any = uniqueId;
            any[any = any.id++] = control;
        }

        view.flyingon_id = any;

        //应用补丁
        if (any = control.__view_patch)
        {
            control.__view_patch = null;
            this.__apply_patch(control, view, any);
        }

        //触发控件挂载过程
        if (any = control.onmount)
        {
            any.call(control, view);
        }
    };


    //取消视图挂载
    this.unmount = function (control, remove) {

        var view = control.view,
            any;

        if (view)
        {
            //触发注销控件挂载过程
            if (any = control.onunmount)
            {
                any.call(control, view);
            }

            control.view = null;

            if (remove !== false && (any = view.parentNode))
            {
                any.removeChild(view);
            }
        }
    };



    //更新顶级控件
    this.__update_top = function (control, width, height) {

        var view = control.view,
            index = view.className.indexOf(' f-rtl');

        control.__location_values = null;
        control.left = control.top = 0;

        control.measure(width, height, width, height, height ? 3 : 1);

        if (flyingon.rtl)
        {
            if (index < 0)
            {
                view.className += ' f-rtl';
            }
        }
        else if (index >= 0)
        {
            view.className = view.className.replace(' f-rtl', '');
        }
        
        if (control.__update_dirty || control.__arrange_dirty)
        {
            this.update(control);
        }
    };


    //更新视图
    this.update = function (control) {

        if (control.__as_html)
        {
            this.locate_html(control);
        }
        else
        {
            this.locate(control);
        }
    };


    //按照html方式定位
    this.locate_html = function (control) {

        var dirty = control.__location_dirty;
        
        if (dirty)
        {
            this.__locate_html(control);
        }

        control.__update_dirty = false;
    };


    //按照html方式定位控件
    this.__locate_html = function (control) {

        var style = control.view.style,
            values = control.__storage || control.__defaults,
            dirty = control.__location_dirty,
            flag = 1,
            name,
            value,
            any;

        control.__location_dirty = 0;

        while (dirty >= flag)
        {
            if (dirty & flag)
            {
                switch (flag)
                {
                    case 1:
                    case 2:
                        if (value = values[name = flag === 1 ? 'width' : 'height'])
                        {
                            if (value === 'default' || value === 'auto')
                            {
                                style[name] = 'auto';
                            }
                            else
                            {
                                style[name] = value >= 0 ? value + 'px' : value;
                            }
                        }
                        break;

                    case 4:
                    case 16:
                        value = values[name = flag === 4 ? 'margin' : 'padding'];
                        style[name] = sides_cache[value] || css_sides(value);
                        break;

                    case 8:
                        value = values.border;
                        style.borderWidth = sides_cache[value] || css_sides(value);
                        break;

                    case 32:
                    case 64:
                    case 128:
                    case 256:
                        any = location_map[flag];
                        value = values[name = any[0]];
                        style[name] = value > 0 ? value + 'px' : value;
                        break;

                    case 512:
                    case 1024:
                        value = values[name = flag < 1000 ? 'left' : 'top'];
                        style[name] = (any = +value) === any ? value + 'px' : value;
                        break;
                }
            }

            flag <<= 1;
        }
    };


    //定位控件
    this.locate = function (control) {

        var style = control.view.style,
            cache = control.__style_cache,
            value = this.__auto_size && control.__auto_size,
            left = control.offsetLeft,
            top = control.offsetTop,
            width = (value & 1) ? 'auto' : control.offsetWidth,
            height = (value & 2) ? 'auto' : control.offsetHeight,
            any;

        control.__update_dirty = false;

        if (any = !cache)
        {
            cache = control.__style_cache = {};
        }

        if (any || left !== cache.left)
        {
            //右向顺序设置right,否则设置left
            style[flyingon.rtl ? 'right' : 'left'] = (cache.left = left) + 'px';
        }

        if (any || top !== cache.top)
        {
            style.top = (cache.top = top) + 'px';
        }

        if (any || width !== cache.width)
        {
            cache.width = width;
            style.width = (value & 1) ? width : width + 'px';
        }

        if (any || height !== cache.height)
        {
            cache.height = height;
            style.height = (value & 2) ? height : height + 'px';
        }

        if (any = control.__location_dirty)
        {
            control.__location_dirty = 0;

            if (any & 8)
            {
                value = control.border();
                style.borderWidth = sides_cache[value] || css_sides(value);
            }

            if ((any & 16) && this.padding)
            {
                value = control.padding();
                style.padding = sides_cache[value] || css_sides(value);
            }
        }

        return cache;
    };



    //需要处理视图补丁的控件集合
    var controls = [];

    //子项变更补丁集合
    var children = [];

    //延迟更新队列
    var update_list = [];
    
    //更新定时器
    var update_delay;
    
        
    //立即更新所有控件
    flyingon.update = function () {
        
        var list = update_list,
            index = 0,
            item,
            node;

        if (update_delay)
        {
            clearTimeout(update_delay);
        }

        flyingon.__update_patch();
        
        while (item = list[index++])
        {
            if (item.__update_dirty)
            {
                if ((node = item.view) && (node = node.parentNode))
                {
                    item.renderer.__update_top(item, node.clientWidth, node.clientHeight);
                }
            }
            else           
            {
                switch (item.__arrange_dirty)
                {
                    case 2:
                        item.renderer.update(item);
                        break;

                    case 1:
                        update_children(item);
                        break;
                }
            }
        }
        
        list.length = update_delay = 0;
    };


    //递归更新子控件
    function update_children(control) {

        control.__arrange_dirty = 0;

        for (var i = 0, l = control.length; i < l; i++)
        {
            var item = control[i];

            switch (item.__arrange_dirty)
            {
                case 2:
                    item.renderer.update(item);
                    break;

                case 1:
                    update_children(item);
                    break;
            }
        }
    };
    

    //延时更新
    flyingon.__update_delay = function (control) {
      
        if (update_list.indexOf(control) < 0)
        {
            update_list.push(control);
            update_delay || (update_delay = setTimeout(flyingon.update, 0)); //定时刷新
        }
    };


    //更新所有挂起的dom补丁(在调用控件update前需要先更新补丁)
    flyingon.__update_patch = function () {

        var list = children,
            index = 0,
            item,
            view,
            any;

        //先处理子项变更
        while (item = list[index++])
        {
            if (any = item.__children_patch)
            {
                item.__children_patch = null;
                item.renderer.__children_patch(item, any);
            }
        }

        //再处理视图变更
        list = controls;
        index = 0;

        while (item = list[index++])
        {
            if ((any = item.__view_patch) && (view = item.view))
            {
                item.__view_patch = null;
                item.renderer.__apply_patch(item, view, any);
            }
        }

        children.length = controls.length = 0;
    };



    //设置属性值
    this.set = function (control, name, value) {

        var any = control.__view_patch;

        if (any)
        {
            any[name] = value;
        }
        else
        {
            (control.__view_patch = {})[name] = value;
            
            if (control.view)
            {
                controls.push(control);
                update_delay || (update_delay = setTimeout(flyingon.update, 0)); //定时刷新
            }
        }
    };


    //应用dom补丁
    this.__apply_patch = function (control, view, patch) {

        var fn, value;

        for (var name in patch)
        {
            //已处理过则不再处理
            if ((value = patch[name]) === null)
            {
                continue;
            }

            if (fn = this[name])
            {
                if (typeof fn === 'function')
                {
                    fn.call(this, control, view, value);
                }
            }
            else //作为属性处理
            {
                if (value || value === 0)
                {
                    view.setAttribute(name, value);
                }
                else
                {
                    view.removeAttribute(name);
                }
            }
        }
    };


    //样式补丁
    this.__style_patch = function (control, view, value) {

        var map = style_map,
            style = view.style,
            any;

        control.__style_patch = null;

        for (var name in value)
        {
            switch (any = this[name])
            {
                case 0: //不处理
                    break;

                case 1: //直接设置样式
                    style[name] = value[name];
                    break;

                case 2: //需要检测前缀
                    style[map[name]] = value[name];
                    break;

                case 9: //特殊样式
                    flyingon.css_value(view, name, value[name]);
                    break;

                default:
                    if (typeof any !== 'function')
                    {
                        if (any = map[name])
                        {
                            style[any] = value[name];
                            self[name] = any === name ? 1 : 2; //直接设置样式标记为1,需要加前缀标记为2
                        }
                        else
                        {
                            flyingon.css_value(view, name, value[name]);
                            self[name] = 9; //标记为特殊样式
                        }
                    }
                    else
                    {
                        any.call(this, control, view, value[name]);
                    }
                    break;
            }
        }
    };



    this.visible = function (control, view, value) {

        view.style.display = value ? '' : 'none';
    };


    this.focus = function (control) {

        control.view.focus();
    };


    this.blur = function (control) {

        control.view.blur();
    };



    //渲染子项
    this.__render_children = function (writer, control, items, start, end) {

        var item;

        while (start < end)
        {
            if (item = items[start++])
            {
                item.view || item.renderer.render(writer, item);
            }
        }
    };


    //挂载子控件
    this.__mount_children = function (control, view, items, start, end, node) {

        var item, any;

        while (start < end)
        {
            if (item = items[start++])
            {
                //如果子控件已经包含view
                if (any = item.view)
                {
                    view.insertBefore(any, node);
                }
                else //子控件不包含view则分配新渲染的子视图
                {
                    item.renderer.mount(item, node);
                    node = node.nextSibling;
                }
            }
        }
    };


    //取消挂载子控件
    this.__unmount_children = function (control) {

        for (var i = control.length - 1; i >= 0; i--)
        {
            var item = control[i];

            if (item && item.view && !item.parent)
            {
                item.renderer.unmount(item, false);
            }
        }
    };


    //排列
    this.__arrange = function (control) {

        var list = [],
            style = control.__style,
            auto = control.__auto_size,
            hscroll, 
            vscroll,
            any;

        if (auto & 1)
        {
            control.__hscroll = false;
        }
        else
        {
            //处理自动滚动
            switch (style && (style['overflow-x'] || style.overflow)) //有些浏览器读不到overflowX的值
            {
                case 'scroll':
                    control.__hscroll = true;
                    break;

                case 'hidden':
                    control.__hscroll = false;
                    break;
                    
                default:
                    hscroll = true;
                    break;
            }
        }

        if (auto & 2)
        {
            control.__vscroll = false;
        }
        else
        {
            switch (style && (style['overflow-y'] || style.overflow))
            {
                case 'scroll':
                    control.__vscroll = true;
                    break;

                case 'hidden':
                    control.__vscroll = false;
                    break;

                default:
                    vscroll = true;
                    break;
            }
        }

        //筛选出非隐藏控件
        for (var i = 0, l = control.length; i < l; i++)
        {
            if ((any = control[i]) && (any.__storage || any.__defaults).visible)
            {
                list.push(any);
            }
        }

        //排列
        flyingon.arrange(control, list, hscroll, vscroll);

        this.__sync_scroll(control);

        control.__arrange_dirty = 0;
    };


    //同步滚动条状态
    //overflow:auto在某些情况下可能会不准确,通过直接设置scroll或hidden解决些问题
    this.__sync_scroll = function (control) {

        var style = (control.view_content || control.view).style;

        style.overflowX = control.__hscroll ? 'scroll' : 'hidden';
        style.overflowY = control.__vscroll ? 'scroll' : 'hidden';
    };



    //注册子项变更补丁
    this.__children_dirty = function (control) {

        children.push(control);
        update_delay || (update_delay = setTimeout(flyingon.update, 0)); //定时刷新
    };


    //子项补丁
    this.__children_patch = function (control, patch) {

        for (var i = 0, l = patch.length; i < l; i++)
        {
            switch (patch[i++])
            {
                case 1: //增加子项
                    this.__insert_patch(control, patch[i++], patch[i]);
                    break;

                case 2: //删除子项
                    this.__remove_patch(control, patch[++i]);
                    break;
            }
        }
    };
    

    //插入子项
    this.__insert_patch = function (control, index, items) {

        var view = control.view_content || control.view;
        this.__unmount_html(control, view, items, 0, items.length, view.children[index] || null);
    };


    //插入未挂载的html片段
    this.__unmount_html = function (control, view, items, start, end, tag) {

        var writer = [],
            node = tag && tag.previousSibling,
            item;

        this.__render_children(writer, control, items, start, end);
        
        writer[0] && flyingon.dom_html(view, writer.join(''), tag);

        node = node && node.nextSibling || view.firstChild;

        this.__mount_children(control, view, items, start, end, node);
    };


    //移除子项
    this.__remove_patch = function (control, items) {

        var item, node;
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if (item = items[i])
            {
                //允许自动销毁且没有父控件则销毁控件
                if (item.autoDispose && !item.parent)
                {
                    item.dispose();
                }
                else if ((node = item.view) && (item = node.parentNode)) //否则从dom树移除
                {
                    item.removeChild(node);
                }
            }
        }
    };



    //控件顺序发生变化的补丁
    this.__view_order = function (control, view) {

        var item, last, node, tag;

        view = control.view_content || view;

        if ((last = view.lastChild) && last.className === 'f-scroll')
        {
            tag = last;
            last = last.previousSibling;
        }

        for (var i = control.length - 1; i >= 0; i--)
        {
            if ((item = control[i]) && (node = item.view))
            {
                if (node !== last)
                {
                    view.insertBefore(node, tag || null);
                }

                last = (tag = node).previousSibling;
            }
        }
    };

 

    //销毁视图
    this.dispose = function (control) {

        var view = control.view,
            any;

        if (view)
        {
            if (any = view.parentNode)
            {
                any.removeChild(view);
            }

            this.unmount(control);

            view.innerHTML = '';
        }
    };




    //创建渲染器或给渲染器取别名
    flyingon.renderer = function (name, parent, fn) {

        if (!name)
        {
            throw 'renderer name not allow empty!'
        }

        if (typeof parent === 'function')
        {
            fn = parent;
            parent = '';
        }
        else if (typeof fn !== 'function') //给指定的类型绑定渲染器
        {
            return;
        }
        
        if (parent && (parent = registry_list[parent]))
        {
            fn.__parent = parent;
        }

        registry_list[fn.__name = name] = fn;
    };


    //绑定渲染器至目标对象
    flyingon.renderer.bind = function (target, name) {

        var renderer = registry_list[name];

        if (renderer && typeof renderer === 'function')
        {
            renderer = init_renderer(renderer);
        }

        if (renderer)
        {
            target.renderer = renderer;
        }
        else if (!target.renderer)
        {
            target.renderer = self;
        }
    };


    //初始化渲染器
    function init_renderer(fn) {

        var parent = fn.__parent,
            target,
            name;

        parent = parent && init_renderer(parent) || self;

        if (name = fn.__name)
        {
            target = flyingon.create(parent);
            fn.call(target, parent);

            return registry_list[name] = target;
        }
    };



}).call(flyingon.create(null));