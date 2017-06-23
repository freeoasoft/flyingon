//控件渲染器
flyingon.Renderer = flyingon.defineClass(function () {
    
    
    
    //margin border padding css样式缓存
    var sides_cache = flyingon.create(null);


    //样式前缀
    var style_prefix = flyingon.create(null);

    //css样式前缀
    var css_prefix = flyingon.create(null);


    css_prefix.minWidth = 'min-width';
    css_prefix.maxWidth = 'max-width';
    css_prefix.minHeight = 'min-height';
    css_prefix.maxHeight = 'max-height';
    css_prefix.overflowX = 'overflow-x';
    css_prefix.overflowY = 'overflow-y';



    function sides_css(value) {

        return sides_cache[value] = value ? value.replace(/(\d+)(\s+|$)/g, '$1px$2') : '';
    };



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




    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div', this.renderDefault(control, css), '></div>');
    };


    //渲染控件默认样式及属性
    this.renderDefault = function (control, cssLayout, className, cssText) {

        var list = [' class="', control.fullClassName],
            css = [],
            any;

        if (cssLayout)
        {
            list.push(' flyingon-html'); //标记为html节点
            this.__render_css(control, css);
        }
        else
        {
            list.push(' flyingon-absolute'); //标记为绝对定位
        }

        if (className)
        {
            list.push(' ', className, '"');
        }
        else
        {
            list.push('"');
        }

        if (any = control.__view_patch)
        {
            control.__view_patch = null;
            this.__render_patch(control, list, css, any);
        }

        if (cssText)
        {
            css.push(cssText);
        }

        if (css[0])
        {
            list.push(' style="');
            list.push.apply(list, css);
            list.push('"');
        }

        return list.join(''); 
    };



    this.__render_css = function (control, css) {

        var style = this.locate_css(control),
            any;

        // (any = style.left) && css.push('left:', any, ';');
        // (any = style.top) && css.push('top:', any, ';');
        (any = style.width) && css.push('width:', any, ';');
        (any = style.height) && css.push('height:', any, ';');
        (any = style.margin) && css.push('margin:', any, ';');

        (any = style.minWidth) && css.push('min-width:', any, ';');
        (any = style.maxWidth) && css.push('max-width:', any, ';');
        (any = style.minHeight) && css.push('min-height:', any, ';');
        (any = style.maxHeight) && css.push('max-height:', any, ';');
    };


    this.__render_patch = function (control, list, css, keys) {

        var encode = flyingon.html_encode,
            value,
            any;

        for (var name in keys)
        {
            if ((value = keys[name]) === null || !(any = this[name]))
            {
                continue;
            }

            switch (any)
            {
                case 1: //直接设置样式
                    css.push(name, ':', encode(value), ';');
                    break;

                case 2: //style直接设置样式, 但css写法需要转换, 如: overflowX overflowY
                case 3: //设置前缀样式
                    css.push(css_prefix[name], ':', encode(value), ';');
                    break;

                case 4: //border
                    css.push('border-width:', sides_cache[value] || sides_css(value), ';');
                    break;

                case 5: //padding
                    css.push('padding:', sides_cache[value] || sides_css(value), ';');
                    break;

                case 6: //visible
                    value || css.push('display:none;');
                    break;

                case 8: //定位样式
                    break;

                // case 9: //特殊样式
                //     break;

                case 11: //直接设置属性
                case 12: //布尔型属性
                    if (value || value === 0)
                    {
                        list.push(' ', name, '="', encode(value), '"');
                    }
                    break;

                default:
                    (control.__view_patch || (control.__view_patch = {}))[name] = value;
                    break;
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

        var view = control.view;

        if (css)
        {
            control.offsetLeft = control.offsetTop = control.offsetWidth = control.offsetHeight = 0;
            // control.offsetLeft = view.offsetLeft;
            // control.offsetTop = view.offsetTop;
            // control.offsetWidth = view.offsetWidth;
            // control.offsetHeight = view.offsetHeight;
        }
        else
        {
            var style = view.style, 
                style1 = control.__locate_style, 
                style2 = this.locate(control),
                any;

            if (style1)
            {
                for (var name in style2)
                {
                    any = style2[name];

                    if (any !== style1[name])
                    {
                        style[name] = any;
                    }
                }
            }
            else
            {
                for (var name in style2)
                {
                    style[name] = style2[name];
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


    //css定位方式
    this.locate_css = function (control) {

        var style = control.__css_layout = {},
            values = control.__storage || control.__defaults,
            auto = 0,
            any;

        style.margin = (any = values.margin) ? sides_cache[any] || sides_css(any) : '';

        //style.left = (any = values.left) > 0 || any < 0 ? any + 'px' : any;
        //style.top = (any = values.top) > 0 || any < 0 ? any + 'px' : any;

        style.minWidth = (any = values.minWidth) > 0 ? any + 'px' : any;
        style.maxWidth = (any = values.maxWidth) > 0 ? any + 'px' : any;
        style.minHeight = (any = values.minHeight) > 0 ? any + 'px' : any;
        style.maxHeight = (any = values.maxHeight) > 0 ? any + 'px' : any;

        switch (any = values.width)
        {
            case 'default':
            case 'auto':
                auto = 1;
                style.width = 'auto';
                break;

            default:
                style.width = any > 0 ? any + 'px' : any;
                break;
        }

        switch (any = values.height)
        {
            case 'default':
            case 'auto':
                auto |= 2;
                style.height = 'auto';
                break;

            default:
                style.height = any > 0 ? any + 'px' : any;
                break;
        }

        control.__auto_size = auto;

        return style;
    };



    //注册style
    this.__registry_style = function (name, check) {

        var any;

        if (check !== false)
        {
            check = flyingon.css_name(name, false);

            if (any = check.name)
            {
                if (any !== name)
                {
                    this[name] = 2; //设置前缀样式

                    style_prefix[name] = any;
                    css_prefix[name] = any.css;

                    return;
                }
            }
            else
            {
                this[name] = check.set ? 9 : false; //支持自定义set则调用flyingon.css_value,否则不处理
                return;
            }
        }

        any = name.replace(/([A-Z])/g, '-$1').toLowerCase();

        this[name] = any === name ? 1 : 2;

        style_prefix[name] = name;
        css_prefix[name] = any;
    };


    //注册attribute
    this.__registry_attribute = function (name, defaultValue) {

        this[name] = typeof defaultValue === 'boolean' ? 12 : 11;
    };



    this.id = 11;


    this.overflowX = this.overflowY = 2;

    this.border = 4;

    this.padding = 5;

    this.visible = 6;



    this.className = function (control, view, value) {
        
        view.className = value ? control.defaultClassName + ' ' + value : control.defaultClassName;
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
                case 2: //style直接设置样式, 但css写法需要转换, 如: overflowX overflowY
                    style[name] = value;
                    break;

                case 3: //设置前缀样式
                    style[style_prefix[name]] = value;
                    break;

                case 4: //border
                    style.borderWidth = sides_cache[value] || sides_css(value);
                    break;

                case 5: //padding
                    style.padding = sides_cache[value] || sides_css(value);
                    break;
                
                case 6: //visible
                    style.display = value ? '' : 'none';
                    break;

                case 9: //特殊样式
                    flyingon.css_value(view, name, value);
                    break;

                case 11: //直接设置属性
                    view.setAttribute(name, value);
                    break;

                case 12: //布尔型属性
                    if (value)
                    {
                        view.setAttribute(name, name);
                    }
                    else
                    {
                        view.removeAttribute(name);
                    }
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



    //直接渲染css补丁
    this.__css_patch = function (control, view, value) {

        var style = control.view.style,
            style1 = control.__css_layout,
            style2 = this.locate_css(control),
            any;

        control.__css_patch = true;

        for (var name in style2)
        {
            if ((any = style2[name]) !== style1[name])
            {
                style[name] = any;
            }
        }
    };




    //销毁视图
    this.dispose = function (view) {

        views.push(view);
        update_delay || (update_delay = setTimeout(update, 0)); //定时刷新
    };




}, false);