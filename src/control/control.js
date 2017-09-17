
/**
 * @class flyingon.Control
 * @uses f-bindable
 * @uses f-collection
 * @description 控件基类
 */
//IE7点击滚动条时修改className会造成滚动条无法拖动,需在改变className后设置focus获取焦点解决此问题
Object.extend('Control', function () {

    
    
    var create = flyingon.create;
  
    var pixel = flyingon.pixel;

    var pixel_sides = flyingon.pixel_sides;

          
    /**
     * @property defaultWidth
     * @type {int}
     * @description 控件默认宽度(width === 'default'时的宽度)
     */
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

        
    
    //扩展可视组件功能
    flyingon.fragment('f-visual', this);

    
    //扩展可绑定功能
    flyingon.fragment('f-bindable', this);
    


    //获取焦点指令
    this['#focused'] = function (value) {

        if (value)
        {
            this.focus();
        }
        else
        {
            this.blur();
        }
    };



    this.__visible = true;


    /**
     * @method visible
     * @description 是否可见
     * @param {boolean} value
     */
    this.defineProperty('visible', true, {
        
        group: 'layout',

        set: function (value) {

            var any;

            this.__visible = value;
            
            if (this.rendered)
            {
                if (any = this.__view_patch)
                {
                    any.visible = value;
                }
                else
                {
                    this.renderer.set(this, 'visible', value);
                }
            }

            this.__update_dirty || this.invalidate();
        }
        
    });
        



    //定位属性变化
    this.__location_dirty = 0;


    //定义定位属性
    var define = function (self, name, defaultValue, dirty) {
   
        return self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function () {

                this.__location_dirty |= dirty;
                this.__update_dirty || this.invalidate();
            }
        });
    };
    

    //左边距
    define(this, 'left', '', 512);

    //顶边距
    define(this, 'top', '', 1024);

    //宽度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define(this, 'width', 'default', 1);

    //高度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define(this, 'height', 'default', 2);


    //最小宽度
    this['min-width'] = define(this, 'minWidth', '', 32);

    //最大宽度
    this['max-width'] = define(this, 'maxWidth', '', 64);

    //最小高度
    this['min-height'] = define(this, 'minHeight', '', 128);

    //最大高度
    this['max-height'] = define(this, 'maxHeight', '', 256);


    //外边距
    define(this, 'margin', '', 4);

    //边框宽度
    define(this, 'border', '', 8);

    //内边距
    define(this, 'padding', '', 16);


    define = function (self, name, defaultValue, dirty) {
   
        return self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function () {

                if (!this.__as_html && !this.__update_dirty)
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
    this['align-x'] = define(this, 'alignX', 'left');

    //控件纵向对齐方式
    //top       顶部对齐
    //middle    纵向居中对齐
    //bottom    底部对齐
    this['align-y'] = define(this, 'alignY', 'top');
    
    //控件停靠方式(此值仅在当前布局类型为停靠布局(dock)时有效)
    //left:     左停靠
    //top:      顶部停靠
    //right:    右停靠
    //bottom:   底部停靠
    //fill:     充满
    define(this, 'dock', 'left');



    //设置自定义样式
    this.defineProperty('style', '', {
        
        group: 'appearance',

        fn: function (name, value) {

            var style = this.__style,
                any;

            if (name === void 0)
            {
                if (style && (any = style.cssText) === false)
                {
                    return style.cssText = style_text(style);
                }

                return any || '';
            }

            name = '' + name;

            //单个设置样式
            if (value !== void 0)
            {
                this['style:'](name, value);
                return this;
            }
            
            if (name.length < 36 && name.indexOf(':') < 0) //读指定名称的样式
            {
                return style && style[name] || '';
            }
            
            if (value = name.match(/\:|[^\s:;]+(\s+[^\s:;]+)?/g))
            {
                set_style.call(this, style, value);
            }

            return this;
        }
    });

    
    //设置样式
    this['style:'] = function (name, value) {

        var style = this.__style,
            watches,
            any;

        if (!name || (any = style && style[name] || '') === value)
        {
            return;
        }

        (style || (style = this.__style = {}))[name] = value;

        if (watches = this.__watches)
        {
            if (watches['style:' + name])
            {
                this.notify('style:' + name, value, any);
            }

            if (watches.style)
            {
                any = style.cssText || '';
                this.notify('style', style_text(style), any);
            }
        }
        else
        {
            style.cssText = false;
        }

        if (this.rendered)
        {
            (this.__style_patch || style_patch(this))[name] = value;
        }
    };


    //批量设置样式
    function set_style(style, list) {

        var watches = this.__watches,
            render = this.rendered,
            index = 0,
            length = list.length,
            name,
            value,
            patch,
            any;

        style = style || (this.__style = {});

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

            if ((any = style && style[name] || '') !== value)
            {
                style[name] = value;

                if (watches && watches['style:' + name])
                {
                    this.notify('style:' + name, value, any);
                }

                if (render)
                {
                    (patch || (patch = this.__style_patch || style_patch(this)))[name] = value;
                }
                else
                {
                    patch = true;
                }
            }
        }

        if (patch)
        {
            if (watches && watches.style)
            {
                any = style.cssText || '';
                this.notify('style', style_text(style), any);
            }
            else
            {
                style.cssText = false;
            }
        }
    };


    //创建样式补丁
    function style_patch(self) {

        var view = self.__view_patch,
            patch = self.__style_patch = {};
        
        if (view)
        {
            view.__style_patch = patch;
        }
        else
        {
            self.renderer.set(self, '__style_patch', patch);
        }

        return patch;
    };


    //获取样式文本
    function style_text(style) {

        var list = [],
            value;

        for (var name in style)
        {
            if (name !== 'cssText' && (value = style[name]) !== '')
            {
                list.push(name, ':', value, ';');
            }
        }

        return style.cssText = list.join('');
    };

    

    //定义attribute属性
    define = function (self, name, defaultValue, attributes) {

        attributes = attributes || {};

        attributes.set = function (value) {

            var any;

            if (any = this.__view_patch)
            {
                any[name] = value;
            }
            else
            {
                this.renderer.set(this, name, value);
            }
        };

        self.defineProperty(name, defaultValue, attributes);
    };

    
    //tab顺序
    define(this, 'tabindex', 0);
    
    
    //是否禁用
    define(this, 'disabled', false);
    

    //是否只读
    define(this, 'readonly', false);


    //提示信息
    define(this, 'title', '');


    //快捷键
    define(this, 'accesskey', '');
    
    
    
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


    

    //测量控件大小
    //containerWidth    容器宽度
    //containerHeight   容器高度
    //availableWidth    可用宽度 
    //availableHeight   可用高度
    //defaultToFill     默认宽度或高度是否转成充满 0:不转 1:宽度转 2:高度转 3:宽高都转
    this.measure = function (containerWidth, containerHeight, availableWidth, availableHeight, defaultToFill) {
        
        var storage = this.__storage || this.__defaults,
            location = this.__location_values || storage,
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

        //不支持在布局中修改边框和内边距
        any = cache[any = storage.border] || fn(any, 0); //border不支持百分比

        this.borderLeft = any.left;
        this.borderTop = any.top;
        this.borderRight = any.right;
        this.borderBottom = any.bottom;

        //不支持在布局中修改边框和内边距
        any = cache[any = storage.padding] || fn(any, containerWidth);

        this.paddingLeft = any.left;
        this.paddingTop = any.top;
        this.paddingRight = any.right;
        this.paddingBottom = any.bottom;

        fn = pixel;
        cache = fn.cache;

        minWidth = minWidth > 0 ? minWidth | 0 : cache[minWidth] || fn(minWidth, containerWidth);
        maxWidth = maxWidth > 0 ? maxWidth | 0 : cache[maxWidth] || fn(maxWidth, containerWidth);

        minHeight = minHeight > 0 ? minHeight | 0 : cache[minHeight] || fn(minHeight, containerHeight);
        maxHeight = maxHeight > 0 ? maxHeight | 0 : cache[maxHeight] || fn(maxHeight, containerHeight);

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

        return !!this.tabindex;
    };


    this.focus = function () {

        this.rendered && this.renderer.focus(this);
    };


    this.blur = function () {

        this.rendered && this.renderer.blur(this);
    };
    
           
      

    this.__update_dirty = true;

    //使布局无效
    this.invalidate = function () {

        var parent = this.parent;

        this.__update_dirty = true;

        if (parent)
        {
            parent.__arrange_delay(2);
        }
        else if (this.__top_control)
        {
            flyingon.__update_delay(this);
        }

        return this;
    };


    this.__arrange_dirty = 0;

    //启用延时排列
    this.__arrange_delay = function (dirty) {

        if (this.__arrange_dirty < dirty)
        {
            var parent = this.parent;

            this.__arrange_dirty = dirty;

            if (parent)
            {
                parent.__arrange_delay(1);
            }
            else if (this.__top_control)
            {
                flyingon.__update_delay(this);
            }
        }
    };

        
    
    //滚动事件处理
    this.__do_scroll = function (x, y) {
        
    };

    
    
    //扩展可序列化功能
    flyingon.fragment('f-serialize', this);


    
    //序列化方法
    this.serialize = function (writer) {

        var any;
        
        if ((any = this.Class) && (any = any.nickName || any.fullName))
        {
            writer.writeProperty('Class', any);
        }
        
        if (any = this.__storage)
        {
            writer.writeProperties(any, this.getOwnPropertyNames(), this.__watches);
        }

        if (any = this.__style)
        {
            serialize_style(writer, any, this.__watches);
        }
    };


    function serialize_style(writer, style, watches) {

        var list = [],
            key,
            value,
            any;

        for (var name in style)
        {
            if (name !== 'cssText' && (value = style[name]) !== '')
            {
                if (watches && (any = watches[key = 'style:' + name]) && (any = any[0]))
                {
                    writer.writeProperty(key, '{{' + any + '}}');
                }
                else
                {
                    list.push(name, ':', value, ';');
                }
            }
        }

        if (list[0])
        {
            writer.writeProperty('style', list.join(''));
        }
    };
    
    

    //被移除或关闭时是否自动销毁
    this.autoDispose = true;
    
    
    //销毁控件    
    this.dispose = function () {
    
        var storage = this.__storage,
            any;

        //触发销毁过程
        if (any = this.distroyed)
        {
            any.call(this);
        }
        
        if (this.view)
        {
            this.renderer.dispose(this);
        }

        if (any = this.__dataset)
        {
            any.subscribe(this, true);
            this.__dataset = null;
        }
        
        if (this.__events)
        {
            this.off();
        }
        
        this.parent = this.__loop_vm = null;

        return this;
    };
    
    

}).register();