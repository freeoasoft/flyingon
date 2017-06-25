//控件渲染器
flyingon.Renderer = flyingon.defineClass(function () {
    
    

    var self = this;

    
    //margin border padding css样式缓存
    var sides_cache = flyingon.create(null);

    //css名称映射
    var css_map = flyingon.css_map(true);

    //style名称映射
    var style_map = flyingon.css_map();



    //设置text属性名
    this.__text_name = 'textContent' in document.head ? 'textContent' : 'innerText';

    
    //盒子模型是否不包含边框
    //this.__no_border = true;

    //盒子模型是否不包含内边距
    this.__no_padding = true;
    
    
    //默认边框宽度
    //this.__border_width = 0;
    
    //默认边框高度
    //this.__border_height = 0;
    
    //默认内边距宽度
    //this.__padding_width = 0;
    
    //默认内边距高度
    //this.__padding_height = 0;


        
    //绑定渲染器
    this.bind = function (control) {
    
        var target;

        for (var i = arguments.length - 1; i >= 0; i--)
        {
            if (target = arguments[i])
            {
                (target.prototype || target).renderer = this;
            }
        }
    };
    


    //检测盒子模型
    this.checkBoxModel = function (dom) {
            
        var style = dom.style,
            pixel = flyingon.pixel;

        style.width = style.height = '100px';
        style.padding = '2px';
        style.overflow = 'scroll'; //IE9下当box-sizing值为border-box且有滚动条时会缩小

        //宽和高是否不包含边框
        if (this.__no_border = dom.offsetWidth !== 100)
        {
            style.padding = '';
            style = dom.currentStyle || window.getComputedStyle(dom);

            //计算默认边框大小
            this.__border_width = pixel(style.borderLeftWidth) + pixel(style.borderRightWidth);
            this.__border_height = pixel(style.borderTopWidth) + pixel(style.borderBottomWidth);

            //计算默认内边距大小
            this.__padding_width = pixel(style.paddingLeft) + pixel(style.paddingRight);
            this.__padding_height = pixel(style.paddingTop) + pixel(style.paddingBottom);
        }
        else
        {
            this.__border_width = this.__border_height = this.__padding_width = this.__padding_height = 0;
            return true;
        }
    };


    //检测盒模型
    flyingon.dom_test(function (div) {
        
 
        div.innerHTML = '<div class="flyingon-control"><div>';

        this.checkBoxModel(div.children[0]);


    }, this);




    function css_sides(value) {

        return sides_cache[value] = value ? value.replace(/(\d+)(\s+|$)/g, '$1px$2') : '';
    };




    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div'),

        this.renderDefault(writer, control, css);

        writer.push('></div>');
    };



    //渲染控件默认样式及属性
    this.renderDefault = function (writer, control, cssLayout, className, cssText) {

        var encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            any;

        if (any = storage.id)
        {
            writer.push(' id="', encode(any), '"');
        }

        writer.push(' class="', control.fullClassName, 
            cssLayout ? ' flyingon-html' : ' flyingon-absolute',
            className ? ' ' + className : '',
            '" style="');

        if (cssText)
        {
            writer.push(cssText);
        }

        if (any = control.__style_list)
        {
            this.__render_style(writer, control, any, encode);
        }

        if (cssLayout)
        {
            this.__render_locate(writer, control);
        }

        if (!storage.visible)
        {
            writer.push('display:none;');
        }

        writer.push('"');

        if (any = control.__attribute_patch)
        {
            control.__attribute_patch = null;
            this.__render_attribute(writer, control, any, encode);
        }
    };



    this.__render_style = function (writer, control, values, encode) {

        var map = css_map,
            name,
            value, 
            any;

        for (var i = 0, l = values.length; i < l; i++)
        {
            name = values[i++];
            value = values[++i];
            i++;

            if (value === '')
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
                    
                    if (!(any = contro.__style_patch))
                    {
                        any = control.__view_patch || (control.__view_patch = {});
                        any = any.__style_patch = contro.__style_patch = {};
                    }

                    any[name] = value;
                    break;
            }
        }
    };


    var locate_keys = ('left,1,left,top,1,top,'
        + 'minWidth,1,min-width,maxWidth,1,max-width,minHeight,1,min-height,maxHeight,1,max-height,'
        + 'margin,2,margin,border,2,border-width,padding,2,padding,'
        + 'width,3,width,height,3,height').split(',');

    this.__render_locate = function (writer, control) {

        var keys = locate_keys,
            values = control.__storage || control.__defaults,
            value,
            any;
        
        for (var i = 0; i < 33; i++)
        {
            if (value = values[keys[i++]])
            {
                switch (keys[i++])
                {
                    case '1':
                        writer.push(keys[i], ':', (any = +value) === any ? value + 'px' : value, ';');
                        break;

                    case '2':
                        writer.push(keys[i], ':', sides_cache[value] || css_sides(value), ';');
                        break;

                    case '3':
                        if (value === 'default' || value === 'auto')
                        {
                            writer.push(keys[i], ':auto;');
                        }
                        else
                        {
                            writer.push(keys[i], ':', value >= 0 ? value + 'px' : value, ';');
                        }
                        break;
                }
            }
            else
            {
                i++;
            }
        }
    };

    
    this.__render_attribute = function (writer, control, keys, encode) {

        var value, any;

        for (var name in keys)
        {
            //没有设置自定义函数则值添加属性值
            if (typeof this[name] !== 'function')
            {
                if (value || value === 0)
                {
                    writer.push(' ', name, '="', encode(value), '"');
                }
            }
            else //否则交给自定义函数处理
            {
                if (!(any = contro.__attribute_patch))
                {
                    any = control.__view_patch || (control.__view_patch = {});
                    any = any.__attribute_patch = contro.__attribute_patch = {};
                }

                any[name] = value;
            }
        }
    };




    //挂载视图
    this.mount = function (control, view) {

        var any;
        
        control.view = view;

        view.flyingon_id = control.uniqueId();
        //view.onscroll = flyingon.__dom_scroll;

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
    this.unmount = function (control) {

        var view = control.view,
            any;

        if (view)
        {
            //触发注销控件挂载过程
            if (any = control.onunmount)
            {
                any.call(control, view);
            }

            control.view = view.onscroll = null;

            if (any = view.parentNode)
            {
                any.removeChild(view);
            }
        }
    };



    //更新布局
    this.update = function (control, css) {

        var view = control.view,
            style,
            item1,
            item2,
            any;

        if (css)
        {
            any = control.parent;
            
            if (any)
            {
                item1 = any.offsetWidth - any.borderLeft - any.borderRight - any.paddingLeft - any.paddingRight;
                item2 = any.offsetHeight - any.borderTop - any.borderBottom - any.paddintTop - any.paddingBottom;
            }
            else
            {
                item1 = item2 = 0;
            }

            control.offsetLeft = control.offsetTop = 0;
            control.measure(item1, item2, item1, item2);
        }
        else
        {
            style = view.style;
            item1 = control.__locate_style;
            item2 = this.locate(control);

            if (item1)
            {
                for (var name in item2)
                {
                    any = item2[name];

                    if (any !== item1[name])
                    {
                        style[name] = any;
                    }
                }
            }
            else
            {
                for (var name in item2)
                {
                    style[name] = item2[name];
                }
            }
        }

        control.__update_dirty = 0;
    };


    //布局定位方式
    this.locate = function (control) {

        var style = control.__locate_style = {},
            x = control.offsetWidth,
            y = control.offsetHeight,
            any;

        //记录渲染的大小
        control.__size_tag = (y << 16) + x;

        //宽和高如果不包含边框则减去边框
        if (this.__no_border)
        {
            any = control.__location_values || control.__storage || control.__defaults;

            if (any.border)
            {
                x -= control.borderLeft + control.borderRight;
                y -= control.borderTop + control.borderBottom;
            }
            else
            {
                x -= this.__border_width;
                y -= this.__border_height;
            }

            //宽和高如果不包含内边距则减去内边距
            if (this.__no_padding)
            {
                if (any.padding)
                {
                    x -= control.paddingLeft + control.paddingRight;
                    y -= control.paddingTop + control.paddingBottom;
                }
                else
                {
                    x -= this.__padding_width;
                    y -= this.__padding_height;
                }
            }
        }

        style.width = x + 'px';
        style.height = y + 'px';

        style.left = (x = control.offsetLeft) + 'px';
        style.top = (y = control.offsetTop) + 'px';

        //记录渲染的位置
        control.__location_tag = (y << 16) + x;
        control.__update_dirty = 0;

        return style;
    };



    this.visible = function (control, view, value) {

        view.style.display = value ? '' : 'none';
    };


    this.text = function (control, view, value) {

        view[this.__text_name] = value && flyingon.html_encode(value) || '';
    };


    this.focus = function (control) {

        control.view.focus();
    };


    this.blur = function (control) {

        control.view.blur();
    };




    //需要处理视图补丁的控件集合
    var controls = [];

    //要销毁的视图集合
    var views = [];

    //延迟更新队列
    var update_list = [];
    
    //更新定时器
    var update_delay;
    
        
    //更新
    function update() {
        
        var list = update_list,
            index = 0,
            item,
            node;

        flyingon.__update_patch();
        
        while (item = list[index++])
        {
            item.__delay_update = false;

            if (item.__update_dirty > 1 && (node = item.view) && (node = node.parentNode))
            {
                item.__layout_top(node.clientWidth, node.clientHeight);
            }

            item.update();
        }
        
        list.length = update_delay = 0;
    };
    
    

    //延时更新
    flyingon.__delay_update = function (control) {
      
        var list = update_list;
        
        if (control)
        {
            if (!control.__delay_update)
            {
                control.__delay_update = true;
                list.push(control);

                update_delay || (update_delay = setTimeout(update, 0)); //定时刷新
            }
        }
        else
        {
            update();
        }
    };


    //更新所有挂起的dom补丁(在调用控件update前需要先更新补丁)
    flyingon.__update_patch = function () {

        var list = views,
            index = 0,
            item,
            view,
            any;

        while (item = list[index++])
        {
            if (view = item.parentNode)
            {
                view.removeChild(item);
                item.innerHTML = '';
            }
        }

        index = 0;
        list = controls;

        while (item = list[index++])
        {
            if ((any = item.__view_patch) && (view = item.view))
            {
                item.__view_patch = null;
                item.renderer.__apply_patch(item, view, any);
            }
        }

        controls.length = 0;
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
                update_delay || (update_delay = setTimeout(update, 0)); //定时刷新
            }
        }
    };


    //应用dom补丁
    this.__apply_patch = function (control, view, values) {

        var style = view.style,
            fn,
            value,
            any;

        for (var name in values)
        {
            //已处理过则不再处理
            if ((value = values[name]) === null)
            {
                continue;
            }

            switch (fn = this[name])
            {
                case 1: //直接设置样式
                    style[name] = value;
                    break;

                case 2: //设置前缀样式
                    style[style_map[name]] = value;
                    break;

                case 3: //visible
                    style.display = value ? '' : 'none';
                    break;

                case 9: //特殊样式
                    flyingon.css_value(view, name, value);
                    break;

                default:
                    if (typeof fn === 'function')
                    {
                        fn.call(this, control, view, value, name);
                    }
                    break;
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


    //直接使用css定时时的补丁
    this.__locate_patch = function (control, view, value) {

        var style = view.style,
            values = control.__locate_patch,
            value;

        control.__locate_patch = null;

        for (var name in values)
        {
            value = values[name];

            switch (name)
            {
                case 'left':
                case 'top':
                case 'minWidth':
                case 'maxWidth':
                case 'minHeight':
                case 'maxHeight':
                    style[name] = value > 0 || value < 0 ? value + 'px' : value;
                    break;

                case 'margin':
                case 'padding':
                    style[name] = sides_cache[value] || css_sides(value);
                    break;

                case 'border':
                    style.borderWidth = sides_cache[value] || css_sides(value);
                    break;

                case 'width':
                case 'height':
                    if (value === 'default' || value === 'auto')
                    {
                        style[name] = 'auto';
                    }
                    else
                    {
                        style[name] = value >= 0 ? value + 'px' : value;
                    }
                    break;
            }
        }
    };


    //属性补丁
    this.__attribute_patch = function (control, view, value) {

        var fn, any;

        control.__attribute_patch = null;

        for (var name in value)
        {
            if (typeof (fn = this[name]) !== 'function')
            {
                if ((any = value[name]) !== false)
                {
                    view.setAttribute(name, any);
                }
                else
                {
                    view.removeAttribute(name);
                }
            }
            else
            {
                fn.call(this, control, view, value[name]);
            }
        }
    };




    //销毁视图
    this.dispose = function (view) {

        views.push(view);
        update_delay || (update_delay = setTimeout(update, 0)); //定时刷新
    };




}, false);