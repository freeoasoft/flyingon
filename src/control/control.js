
//控件类
//IE7点击滚动条时修改className会造成滚动条无法拖动,需在改变className后设置focus获取焦点解决此问题
flyingon.defineClass('Control', function () {

    

    var id = 1;
    
    var self = this;


    var create = flyingon.create;
  
    //根据uniqueId组织的控件集合
    var controls = flyingon.__uniqueId_controls = create(null);


    var pixel = flyingon.pixel;

    var pixel_sides = flyingon.pixel_sides;


    //设置默认渲染器
    var renderer = this.renderer = flyingon.Renderer.prototype;


    
    //扩展至选择器
    this.__selector_extend = flyingon.Query;
    
                
    //向上冒泡对象名
    this.eventBubble = 'parent';
    
        
                
    //控件默认宽度(width === 'default'时的宽度)
    this.defaultWidth = 100;

    //控件默认高度(height === 'default'时的高度)
    this.defaultHeight = 25;
    

    //控件坐标
    this.offsetLeft = this.offsetTop = this.offsetWidth = this.offsetHeight = 0;

    //外边距
    this.marginLeft = this.marginTop = this.marginRight = this.marginBottom = 0;

    //边框宽度
    this.borderLeft = this.borderTop = this.borderRight = this.borderBottom = 0;

    //内边距
    this.paddingLeft = this.paddingTop = this.paddingRight = this.paddingBottom = 0;

    //滚动条位置
    this.scrollLeft = this.scrollTop = 0;

        
    
    this.__uniqueId = 0;
    
    //唯一id
    this.uniqueId = function () {
        
        return this.__uniqueId || (controls[id] = this, this.__uniqueId = id++);
    };
    

    //父控件
    this.parent = null;


    //上一兄弟节点控件
    this.previousSibling = null;


    //下一兄弟节点控件
    this.nextSibling = null;



    
    //读取自定义值
    this.__custom_get = function (name) {

        return (this.__storage || this.__defaults)[name];
    };


    //设置自定义值
    this.__custom_set = function (name, value) {

        var fn, any;

        if (name && name.charAt(0) === '-') //指令
        {
            if (any = name.indexOf(':'))
            {
                if (fn = this[name.substring(0, ++any)])
                {
                    fn.call(this, name.substring(any), value);
                }
            }
            else if (fn = this[name])
            {
                fn.call(this, value);
            }
        }
        else
        {
            (this.__storage || (this.__storage = create(this.__defaults)))[name] = value;
            (this.__attribute_patch || this.__new_patch('attribute'))[name] = value;
        }
    };
    

    //模型指令
    this['-model'] = function (vm, name) {

        this.on('change', function (e) {

            vm.$set(name, e.original_event.target.value);
        });
    };


    //获取焦点指令
    this['-focused'] = function (value) {

        if (value)
        {
            this.focus();
        }
        else
        {
            this.blur();
        }
    };


    
    
    //获取控件在父控件中的索引
    this.index = function () {
        
        if (this.parent)
        {
            var control = this,
                index = 0;

            while (control = control.previousSibling)
            {
                index++;
            }

            return index;
        }

        return -1;
    };
    
    
    //从父控件中移除
    this.remove = function (dispose) {
        
        var parent = this.parent;
        
        if (parent)
        {
            parent.removeChild(this, dispose);
        }
    };
    
        
    
    //引入可绑定功能片段
    flyingon.__bindable_fragment(this);
    
    
    
    //创建指定类型的补丁
    this.__new_patch = function (type) {

        var view = this.__view_patch,
            patch = this[type = '__' + type + '_patch'] = {};
        
        if (view)
        {
            view[type] = patch;
        }
        else
        {
            this.renderer.set(this, type, patch);
        }

        return patch;
    };

    

    //id
    this.defineProperty('id', '', {
     
        set: function (value, oldValue) {

            var any;

            if (any = flyingon.__id_query_cache)
            {
                if (oldValue && any[oldValue])
                {
                    flyingon.__clear_id_query(oldValue);
                }

                if (value && any[value])
                {
                    flyingon.__clear_id_query(value);
                }
            }

            if (this.view)
            {
                (this.__attribute_patch || this.__new_patch('attribute')).id = value;
            }
        }
    });


    
    //指定class名 与html一样
    this.defineProperty('className', '', {

        set: function (value) {

            this.fullClassName = value = value ? this.defaultClassName + ' ' + value : this.defaultClassName;

            if (this.view)
            {
                (this.__attribute_patch || this.__new_patch('attribute'))['class'] = value;
            }
        }
    });
    
    
    //是否包含指定class
    this.hasClass = function (name) {

        var keys;
        return name && (keys = this.__class_keys) && keys[name] || false;
    };


    //添加class
    this.addClass = function (name) {

        var list, keys, any;

        if (name && (list = name.match(/[\w-]+/g)))
        {
            if (keys = this.__class_keys)
            {
                any = list.length;

                while (any--)
                {
                    if (keys[name = list[any]])
                    {
                        list.splice(any, 1);
                    }
                    else
                    {
                        keys[name] = true;
                    }
                }
                
                if (list.length > 0)
                {
                    if (flyingon.__class_query_cache)
                    {
                        flyingon.__clear_class_query(list);
                    }

                    this.className(this.__storage.className + ' ' + list.join(' '));
                }
            }
            else
            {
                init_class(this, list);
            }
        }

        return this;
    };


    //移除class
    this.removeClass = function (name) {

        var list, keys, index;

        if (name && (list = name.match(/\w+/g)) && (keys = this.__class_keys))
        {
            index = list.length;

            while (index--)
            {
                if (keys[name = list[index]])
                {
                    keys[name] = false;
                }
                else
                {
                    list.splice(index, 1);
                }
            }
            
            if (list.length > 0)
            {
                sync_class(this, keys, list);
            }
        }

        return this;
    };


    //切换class 有则移除无则添加
    this.toggleClass = function (name) {

        var list, keys, index;

        if (name && (list = name.match(/\w+/g)))
        {
            if (keys = this.__class_keys)
            {
                index = list.length;

                while (index--)
                {
                    keys[name = list[index]] = !keys[name];
                }
                
                sync_class(this, keys, list);
            }
            else
            {
                init_class(this, list);
            }
        }

        return this;
    };


    //初始化class集合
    function init_class(self, list) {

        var keys = self.__class_keys = {},
            index = 0,
            any;

        while (any = list[index++])
        {
            keys[any] = true;
        }

        if (flyingon.__class_query_cache)
        {
            flyingon.__clear_class_query(list);
        }

        self.className(list.join(' '));
    };


    //同步class
    function sync_class(self, keys, list) {

        var any = [];

        for (var name in keys)
        {
            if (keys[name])
            {
                any.push(name);
            }
        }

        if (flyingon.__class_query_cache)
        {
            flyingon.__clear_class_query(list);
        }

        self.className(any.join(' '));
    };



    //class指令
    this['-class:'] = function (name, value) {

        if (value)
        {
            this.addClass(name);
        }
        else
        {
            this.removeClass(name);
        }
    };




    //是否可见
    this.defineProperty('visible', true, {
        
        group: 'layout',

        set: function (value) {

            if (this.view)
            {
                this.renderer.set(this, 'visible', value);
            }

            if (this.__update_dirty < 2)
            {
                this.invalidate();
            }
        }
    });
        


    //定义定位属性
    var define = function (name, defaultValue, css) {
        
        css = css || name;

        self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function (value) {

                if (this.__css_layout === true)
                {
                    (this.__locate_patch || this.__new_patch('locate'))[css] = value;
                }

                if (this.__update_dirty < 2)
                {
                    (this.parent || this).invalidate();
                }
            }
        });
    };
    

    //左边距
    define('left', '');

    //顶边距
    define('top', '');

    //宽度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define('width', 'default');

    //高度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define('height', 'default');


    //最小宽度
    define('minWidth', '', 'min-width');

    //最大宽度
    define('maxWidth', '', 'max-width');

    //最小高度
    define('minHeight', '', 'min-height');

    //最大高度
    define('maxHeight', '', 'max-height');


    //外边距
    define('margin', '');

    //边框宽度
    define('border', '', 'border-width');
    
    //内边距
    define('padding', '');



    define = function (name, defaultValue) {
        
        self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function (value) {

                if (this.__update_dirty < 2)
                {
                    this.invalidate();
                }
            }
        });
    };


    //控件横向对齐方式
    //left      左边对齐
    //center    横向居中对齐
    //right     右边对齐
    define('alignX', 'left');

    //控件纵向对齐方式
    //top       顶部对齐
    //middle    纵向居中对齐
    //bottom    底部对齐
    define('alignY', 'top');
    

    //控件停靠方式(此值仅在当前布局类型为停靠布局(dock)时有效)
    //left:     左停靠
    //top:      顶部停靠
    //right:    右停靠
    //bottom:   底部停靠
    //fill:     充满
    define('dock', 'left');



    //设置自定义样式
    this.defineProperty('style', '', {
        
        group: 'appearance',

        fn: function (name, value) {

            var style = this.__style_list,
                any = style && style.text || '';

            if (name === void 0)
            {
                return any;
            }

            name = '' + name;

            //单个设置样式
            if (value !== void 0)
            {
                this['-style:'](name, value);
            }
            else if (name.length < 36 && name.indexOf(':') < 0) //读指定名称的样式
            {
                return style && style[style.indexOf(name) + 2] || '';
            }
            else if (value = name.match(/\:|[^\s:;]+(\s+[^\s:;]+)?/g))
            {
                set_style.call(this, style, value);
            }

            if ((value = (style || this.__style_list).text) !== any)
            {
                if (this.__watch_keys && flyingon.__do_watch(this, name, value, any) === false)
                {
                    return this;
                }

                if ((any = this.__bind_keys) && (name = any[name]))
                {
                    this.pushBack(name, value);
                }
            }

            return this;
        }
    });

    
    //样式指令
    this['-style:'] = function (name, value) {

        var style = this.__style_list,
            index,
            any;

        if (!name || 
            style && (index = style.indexOf(name)) >= 0 && (any = style[index + 2]) === value ||
            this.__watch_keys && flyingon.__do_watch(this, name, value, any) === false)
        {
            return;
        }

        if (style)
        {
            if (index >= 0)
            {
                style[index + 2] = value;
            }
            else
            {
                style.push(name, ':', value, ';');
            }
        }
        else
        {
            style = this.__style_list = [name, ':', value, ';'];
        }

        if ((any = this.__bind_keys) && (any = any[name]))
        {
            this.pushBack(any, value);
        }

        if (this.view)
        {
            (this.__style_patch || this.__new_patch('style'))[name] = value;
         }
        
        style.text = style.join('');
    };


    //批量设置样式
    function set_style(style, list) {

        var watch = this.__watch_keys,
            bind = this.__bind_keys,
            view = this.view,
            patch = view && this.__style_patch,
            index = 0,
            length = list.length,
            first = !style,
            oldValue,
            name,
            value,
            any;

        style = style || (this.__style_list = []);

        while (index < length)
        {
            while ((name = list[index++]) === ':')
            {
            }

            if (!name)
            {
                continue;
            }

            //值为''表示清除原有样式
            if (list[index++] === ':')
            {
                value = list[index++] || '';
            }
            else
            {
                index--;
                value = '';
            }

            if (first || (any = list.indexOf(name)) < 0 || (oldValue = list[any + 2]) !== value)
            {
                if (watch && flyingon.__do_watch(this, name, value, oldValue || '') === false)
                {
                    continue;
                }

                if (first || any < 0)
                {
                    style.push(name, ':', value, ';');
                }
                else
                {
                    style[any + 2] = value;
                }

                if (bind && (any = bind[name]))
                {
                    this.pushBack(any, value);
                }

                if (view)
                {
                    (patch || (patch = this.__new_patch('style')))[name] = value;
                }
                else
                {
                    patch = true;
                }
            }
        }

        if (patch)
        {
            style.text = style.join('');
        }
    };




    //定义attribute属性
    define = function (name, defaultValue, attributes) {

        attributes = attributes || {};

        attributes.set = function (value) {

            (this.__attribute_patch || this.__new_patch('attribute'))[name] = value;
        };

        self.defineProperty(name, defaultValue, attributes);
    };


    flyingon.attributeProperty = define;
    
    
    //tab顺序
    define('tabIndex', -1);
    
    
    //是否禁用
    define('disabled', false);
    

    //是否只读
    define('readonly', false);


    //提示信息
    define('title', '');


    //快捷键
    define('accessKey', '');
    
    
    
    //是否可调整大小或调整大小的方式
    //none  不可调整
    //x     只能调整宽度
    //y     只能调整高度
    //all   宽度高度都可调整
    this.defineProperty('resizable', 'none');
    
    
    //是否可移动
    this.defineProperty('movable', false);
    
    
    //是否要放置移动或拖动
    this.defineProperty('droppable', false);


    //自定义标记键值
    this.defineProperty('key', '');


    //自定义标记
    this.defineProperty('tag', null);




    //获取定位属性值
    this.locationValue = function (name) {

        return (this.__location_values || this.__storage || this.__defaults)[name];
    };


    
    //初始化顶级控件布局
    this.__layout_top = function (width, height) {

        this.__location_values = null;
        this.left = this.top = 0;

        this.measure(width, height, width, height, height ? 3 : 1);
    };


    //测量控件大小
    //containerWidth    容器宽度
    //containerHeight   容器高度
    //availableWidth    可用宽度 
    //availableHeight   可用高度
    //defaultToFill     默认宽度或高度是否转成充满 0:不转 1:宽度转 2:高度转 3:宽高都转
    this.measure = function (containerWidth, containerHeight, availableWidth, availableHeight, defaultToFill) {
        
        var location = this.__location_values || this.__storage || this.__defaults,
            minWidth = location.minWidth,
            maxWidth = location.maxWidth,
            minHeight = location.minHeight,
            maxHeight = location.maxHeight,
            width = location.width,
            height = location.height,
            auto = 0,
            fn = pixel_sides,
            cache = fn.cache,
            any;

        any = cache[any = location.margin] || fn(any, containerWidth);

        this.marginLeft = any.left;
        this.marginTop = any.top;
        this.marginRight = any.right;
        this.marginBottom = any.bottom;

        any = cache[any = location.border] || fn(any, 0); //border不支持百分比

        this.borderLeft = any.left;
        this.borderTop = any.top;
        this.borderRight = any.right;
        this.borderBottom = any.bottom;

        any = cache[any = location.padding] || fn(any, containerWidth);

        this.paddingLeft = any.left;
        this.paddingTop = any.top;
        this.paddingRight = any.right;
        this.paddingBottom = any.bottom;

        fn = pixel;
        cache = fn.cache;

        minWidth = (any = +minWidth) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerWidth);
        maxWidth = (any = +maxWidth) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerWidth);

        minHeight = (any = +minHeight) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerHeight);
        maxHeight = (any = +maxHeight) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerHeight);

        //处理宽度
        switch (width)
        {
            case 'default':
                if (defaultToFill & 1)
                {
                    any = availableWidth >= 0 ? availableWidth : containerWidth;
                    width = any - this.marginLeft - this.marginRight;
                }
                else
                {
                    width = this.defaultWidth;
                }
                break;
                
            case 'auto':
                auto = 1;
                width = availableWidth || this.defaultWidth;
                break;

            default:
                width = (any = +width) === any ? any | 0 : cache[width] || fn(width, containerWidth);
                break;
        }

        if (any < 0)
        {
            width = 0;
        }

        //处理高度
        switch (height)
        {
            case 'default':
                if (defaultToFill & 2)
                {
                    any = availableHeight >= 0 ? availableHeight : containerHeight;
                    height = any - this.marginTop - this.marginBottom;
                }
                else
                {
                    height = this.defaultHeight;
                }
                break;
                
            case 'auto':
                auto |= 2;
                height = availableHeight || this.defaultHeight;
                break;

            default:
                height = (any = +height) === any ? any | 0 : cache[height] || fn(height, containerHeight);
                break;
        }

        if (height < 0)
        {
            height = 0;
        }

        this.__auto_size = auto; 
        
        //处理最小及最大宽度
        if (width < minWidth)
        {
            width = minWidth;
        }
        else if (maxWidth > 0 && width > maxWidth)
        {
            width = maxWidth;
        }
        
        //处理最小及最大高度
        if (height < minHeight)
        {
            height = minHeight;
        }
        else if (maxHeight > 0 && height > maxHeight)
        {
            height = maxHeight;
        }
        
        //设置大小
        this.offsetWidth = width;
        this.offsetHeight = height;
        
        //测量后处理
        if ((fn = this.onmeasure) && fn.call(this, auto) !== false)
        {
            //处理最小及最大宽度
            if (this.offsetWidth !== width)
            {
                if ((width = this.offsetWidth) < minWidth)
                {
                    this.offsetWidth = width = minWidth;
                }
                else if (maxWidth > 0 && width > maxWidth)
                {
                    this.offsetWidth = width = maxWidth;
                }
            }

            //处理最小及最大高度
            if (this.offsetHeight !== height)
            {
                if ((height = this.offsetHeight) < minHeight)
                {
                    this.offsetHeight = height = minHeight;
                }
                else if (maxHeight > 0 && height > maxHeight)
                {
                    this.offsetHeight = height = maxHeight;
                }
            }
        }

        //如果大小发生了变化则标记布局已变更
        if (this.__update_dirty < 2 && this.__size_tag !== (height << 16) + width)
        {
            this.__update_dirty = 2;
        }
    };
    
        
    //定位控件
    this.locate = function (x, y, alignWidth, alignHeight, container) {
        
        var width = this.offsetWidth,
            height = this.offsetHeight,
            any;

        if (alignWidth > 0 && (any = alignWidth - width))
        {
            switch ((this.__location_values || this.__storage || this.__defaults).alignX)
            {
                case 'center':
                    x += any >> 1;
                    break;

                case 'right':
                    x += any;
                    break;
                    
                default:
                    x += this.marginLeft;
                    break;
            }
        }
        else
        {
            x += this.marginLeft;
        }

        if (alignHeight > 0 && (any = alignHeight - height))
        {
            switch ((this.__location_values || this.__storage || this.__defaults).alignY)
            {
                case 'middle':
                    y += any >> 1;
                    break;

                case 'bottom':
                    y += any;
                    break;
                    
                default:
                    y += this.marginTop;
                    break;
            }
        }
        else
        {
            y += this.marginTop;
        }
        
        this.offsetLeft = x;
        this.offsetTop = y;
        
        if ((any = this.onlocate) && any.call(this) !== false)
        {
            x = this.offsetLeft;
            y = this.offsetTop;
        }

        //检测位置从上次渲染后是否发生变更
        this.__location_dirty = (any = this.__location_tag) && any !== (y << 16) + x;

        if (container)
        {
            container.arrangeX = (x += width + this.marginRight);
            container.arrangeY = (y += height + this.marginBottom);

            if (x > container.arrangeRight)
            {
                container.arrangeRight = x;
            }

            if (y > container.arrangeBottom)
            {
                container.arrangeBottom = y;
            }
        }
    };
    

    

    //是否可获取焦点
    this.canFocus = function () {

        return this.tabIndex >= 0;
    };


    this.focus = function () {

        this.renderer.focus(this);
    };


    this.blur = function () {

        this.renderer.blur(this);
    };
    
           

    //控件重绘状态
    //0: 不需要重绘
    //1: 子控件需要重绘
    //2: 当前控件需要重绘
    this.__update_dirty = 2;
    
        
    //使布局无效
    this.invalidate = function (content) {

        var any;

        this.__update_dirty = 2;

        if (any = this.parent)
        {
            if (!any.__update_dirty && (!content || this.__auto_size))
            {
                any.invalidate(true);
            }
        }
        else if (this.__top_control)
        {
            flyingon.__delay_update(this);
        }

        return this;
    };
    
            
    
    //更新视区
    this.update = function () {
        
        if (this.view && this.__update_dirty)
        {
            flyingon.__update_patch();
            this.renderer.update(this);
        }
        
        return this;
    };


    //刷新控件
    this.refresh = function () {

        if (this.view)
        {
            flyingon.__update_patch();
            this.renderer.update(this);
        }
    };

    
    
    //滚动事件处理
    this.__do_scroll = function (x, y) {
        
    };


    this.__do_change = function (value) {

        if (this.trigger('change', 'value', value) !== false)
        {
            this.text(value);
        }
    };


    
    
    //引入序列化片段
    flyingon.__serialize_fragment(this);
    
    

    var clone = this.clone;
    
    //以当前对象的参照复制生成新对象
    this.clone = function () {

        var target = clone.call(this),
            any;

        target.__dataset = this.__dataset;

        if (any = this.__class_list)
        {
            target.__class_list = flyingon.extend({}, any);
        }

        return target;
    };
    
    
    //销毁控件    
    this.dispose = function (recursion) {
    
        var storage = this.__storage,
            any;

        //触发销毁过程
        if (any = this.distroyed)
        {
            any.call(this);
        }
        
        if (any = this.view)
        {
            if (recursion !== true)
            {
                this.renderer.dispose(any);
            }

            this.view = this.view_body = null;
        }

        if (any = this.__dataset)
        {
            any.subscribe(this, true);
        }
        
        if (this.__events)
        {
            this.off();
        }

        if (storage)
        {
            //清除id选择器缓存
            if ((any = storage.id) && flyingon.__id_query_cache)
            {
                flyingon.__clear_id_query(storage.id);
            }

            //清除class选择器缓存
            if ((any = this.__class_list) && flyingon.__class_query_cache)
            {
                flyingon.__clear_class_query(any, true);
            }
        }

        if (any = this.__uniqueId)
        {
            delete controls[any];
        }
        
        this.parent = this.previousSibling = this.nextSibling = this.__loop_vm = null;

        return this;
    };
    
    
        
    //控件类初始化处理
    this.__class_init = function (Class, base) {
     
        var name = Class.xtype;
        
        if (name)
        {
            name = name.toLowerCase();
            
            if (base = base.defaultClassName)
            {
                 name = base + ' ' + name;
            }
            
            this.fullClassName = this.defaultClassName = name;
        }
    };

    


}).register('control');