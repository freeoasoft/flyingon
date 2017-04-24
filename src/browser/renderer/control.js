//控件渲染器
flyingon.Renderer = flyingon.defineClass(function () {
    
    
    
    //延时更新集合
    var controls = null;

    //默认样式文本
    //overflow:hidden解决IE怪异模式无法设置高度小于一定值的问题
    var cssText = 'position:absolute;margin:0;overflow:hidden;';

 

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
    
    
    //绑定控件类渲染器
    this.bind(flyingon.Control);
    
    
    
    //根据属性集同步视图属性
    this.sync_properties = function (control) {
        
        var list = (control.prototype || control).properties(false),
            item;
        
        for (var i = 0, l = list.length; i < l; i++)
        {
            if ((item = list[i]) && item.dom)
            {
                this[item.name] = item.dom;
            }
        }
    };
    
        
    //同步默认视图属性
    this.sync_properties(flyingon.Control);
    
    
    this.id = function (control, view, value) {

        view.setAttribute('id', value);
    };


    this.className = function (control, view, value) {
        
        view.className = value ? control.defaultClassName + ' ' + value : control.defaultClassName;
    };
    
    
    this.border = function (control, view, value) {
        
        view.style.borderWidth = value > 0 ? value + 'px' : value;
    };


    this.padding = function (control, view, value) {

        view.style.padding = value > 0 ? value + 'px' : value;
    };
    

    this.text = function (control, view, value) {

        view[this.__text_name] = value;
    };

        
    this.html = function (control, view, value) {

        view.innerHTML = value && flyingon.html_encode(value) || '';
    };


    this.disabled = function (control, view, value) {

        if (value)
        {
            view.setAttribute('disabled', 'disabled');
        }
        else
        {
            view.removeAttribute('disabled');
        }
    };


    this.readonly = function (control, view, value) {

        if (value)
        {
            view.setAttribute('readonly', 'readonly');
        }
        else
        {
            view.removeAttribute('readonly');
        }
    };


    this.focus = function (control) {

        control.view.focus();
    };


    this.blur = function (control) {

        control.view.blur();
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
        
        var border = flyingon.css_text('box-sizing', 'border-box');

        div.innerHTML = '<div class="flyingon-control" style="' + cssText + border + '"><div>';

        if (this.checkBoxModel(div.children[0]) && border)
        {
            cssText += border;
        }

    }, this);



    //计算定位样式
    this.locate = function (control) {

        var style = control.__locate_style = {},
            box = control.boxModel,
            x = box.offsetWidth,
            y = box.offsetHeight,
            any;

        if (x > 0 && y > 0)
        {
            //记录渲染的大小
            control.__size_tag = (y << 16) + x;

            //宽和高如果不包含边框则减去边框
            if (this.__no_border)
            {
                if ((any = box.border) && any.text)
                {
                    x -= any.width;
                    y -= any.height;
                }
                else
                {
                    x -= this.__border_width;
                    y -= this.__border_height;
                }

                //宽和高如果不包含内边距则减去内边距
                if (this.__no_padding)
                {
                    if ((any = box.padding) && any.text)
                    {
                        x -= any.width;
                        y -= any.height;
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

            style.left = (x = box.offsetLeft) + 'px';
            style.top = (y = box.offsetTop) + 'px';

            //记录渲染的位置
            control.__location_tag = (y << 16) + x;

            style.display = 'block';
        }
        else
        {
            style.display = 'none';
        }

        return style;
    };


    //获取渲染样式文本
    this.cssText = function (control) {

        var list = [cssText],
            style = this.locate(control, true);

        for (var name in style)
        {
            list.push(name, ':', style[name], ';');
        }

        return list.join('');
    };


    
    //渲染html
    this.render = function (control, writer) {

        writer.push('<div class="', control.defaultClassName, '" style="', this.cssText(control), '"></div>');
    };


    //创建视图
    this.createView = function (control, host) {

        var dom, any;

        host = host || document.body;

        this.render(control, any = []);

        if (dom = host.lastChild)
        {
            flyingon.dom_html(host, any.join(''));
            dom = host.lastChild;
        }
        else
        {
            host.innerHTML = any.join('');
            dom = host.firstChild;
        }

        if (dom)
        {
            this.initView(control, control.view = dom);
            return dom;
        }
    };
        

    //初始化视图
    this.initView = function (control, view) {

        var any;
        
        view.flyingon_id = control.uniqueId();

        if (any = control.__view_patch)
        {
            control.__view_patch = null;
            this.applyPatch(control, view, any);
        }

        control.__update_dirty = 0;
    };



    //更新布局
    this.update = function (control) {

        var view = control.view,
            style = view.style,
            style1 = control.__locate_style,
            style2 = this.locate(control),
            any;

        for (var name in style2)
        {
            any = style2[name];

            if (!style1 || any !== style1[name])
            {
                style[name] = any;
            }
        }

        if (any = control.__view_patch)
        {
            control.__view_patch = null;
            this.applyPatch(control, view, any);
        }

        control.__update_dirty = 0;
    };



    //应用dom补丁
    this.applyPatch = function (control, view, values) {

        var style = view.style,
            fn,
            value;

        for (var name in values)
        {
            value = values[name];

            switch (fn = this[name])
            {
                case 1: //直接设置样式
                    style[name] = value;
                    break;

                case 2: //特殊样式
                    flyingon.css_value(view, name, value);
                    break;

                default:
                    if (typeof fn === 'function')
                    {
                        fn.call(this, control, view, value);
                    }
                    break;
            }
        }
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
                if (any = controls)
                {
                    any.push(control);
                }
                else
                {
                    any = controls = [control];
                    setTimeout(flyingon.__update_patch, 0);
                }
            }
        }
    };


    //更新所有挂起的dom补丁
    flyingon.__update_patch = function () {

        var list = controls,
            item,
            view,
            values;

        if (list)
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                if ((item = list[i]) && (values = item.__view_patch) && (view = item.view))
                {
                    item.__view_patch = null;
                    item.renderer.applyPatch(item, item.view, values);
                }
            }

            list.length = 0;
            controls = null;
        }
    };



    //销毁视图
    this.dispose = function (control) {

        control.view = null;
    };

    

    
}, false);