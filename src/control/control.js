//单位换算
(function (flyingon) {


    var unit = flyingon.create(null), //单位换算列表

        pixel_cache = flyingon.create(null), //缓存的单位转换值

        regex_unit = /[a-zA-z]+|%/, //计算尺寸正则表达式

        regex_sides = /[+-]?[\w%.]+/g, //4边解析正则表达式
        
        sides_cache = flyingon.create(null), //4边缓存列表
        
        parse = parseFloat;
    
    
    //初始化默认值
    unit.em = unit.rem = 12;
    unit.ex = 6;
    unit.pc = 16;
    unit.px = 1;
    unit.pt = 4 / 3;
    
    unit.mm = (unit.cm = 96 / 2.54) / 10;
    unit['in'] = 96;
    

    //或者或设置象素转换单位
    (flyingon.pixel_unit = function (name, value) {

        if (value === void 0)
        {
            return unit[name];
        }

        if (unit[name] !== value)
        {
            unit[name] = value;

            var list = pixel_cache;

            for (var key in list)
            {
                if (key.indexOf(name) > 0)
                {
                    list[key] = void 0;
                }
            }
        }
                
    }).unit = unit;


    //转换css尺寸为像素值
    //注: em与rem相同, 且在初始化时有效
    (flyingon.pixel = function (value, size) {

        if (value >= 0)
        {
            return value >> 0;
        }

        var any = pixel_cache[value];

        if (any !== void 0)
        {
            return any !== true ? any : parse(value) * size / 100 + 0.5 | 0;
        }

        if (any = value.match(regex_unit)) 
        {
            if ((any = any[0]) === '%')
            {
                pixel_cache[value] = true;
                return parse(value) * size / 100 + 0.5 | 0;
            }
            
            any = any.toLowerCase();
        }

        return pixel_cache[value] = parse(value) * (unit[any] || 1) + 0.5 | 0;

    }).cache = pixel_cache;
    
    
    //转换4边尺寸为像素值(margin, padding的百分比是以父容器的宽度为参照, border-width不支持百分比)
    (flyingon.pixel_sides = function (value, width) {
        
        var values = sides_cache[value];
        
        if (values)
        {
            //直接取缓存
            if (values.cache)
            {
                return values;
            }
        }
        else if (value >= 0)
        {
            return sides_values(value);
        }
        
        if (value && (values = value.match(regex_sides)))
        {
            sides_cache[value] = values;

            if (value.indexOf('%') < 0)
            {
                values = pixel_sides(value, values);
                values.cache = true;
                
                return values;
            }
        }
        else
        {
            return sides_values('');
        }

        return pixel_sides(value, values, width);

    }).cache = sides_cache;
    
    
    function sides_values(value) {
    
        return sides_cache[value] = { 

            cache: true,
            text: value,
            left: value |= 0, 
            top: value, 
            right: value, 
            bottom: value, 
            width: value = value << 1, 
            height: value
        };
    };
    
    
    function pixel_sides(text, sides, width) {
        
        var target = { text: text },
            fn = flyingon.pixel;
        
        switch (sides.length)
        {
            case 1:
                target.left = target.top = target.right = target.bottom = fn(sides[0], width);
                break;

            case 2:
                target.left = target.right = fn(sides[1], width);
                target.top = target.bottom = fn(sides[0], width);
                break;

            case 3:
                target.left = target.right = fn(sides[1], width);
                target.top = fn(sides[0], width);
                target.bottom = fn(sides[2], width);
                break;

            default:
                target.left = fn(sides[3], width);
                target.top = fn(sides[0], width);
                target.right = fn(sides[1], width);
                target.bottom = fn(sides[2], width);
                break;
        }

        target.width = target.left + target.right;
        target.height = target.top + target.bottom;

        return target;
    };
    

})(flyingon);




//控件类
//IE7点击滚动条时修改className会造成滚动条无法拖动,需在改变className后设置focus获取焦点解决此问题
flyingon.defineClass('Control', function () {

    

    var self = this;
        
    //根据uniqueId组织的控件集合
    var controls = flyingon.__uniqueId_controls = flyingon.create(null);

    var pixel = flyingon.pixel;

    var pixel_sides = flyingon.pixel_sides;

    var id = 1;
    
    

    //默认class名
    this.defaultClassName = 'fn-control';

    
    //扩展至选择器
    this.__selector_extend = flyingon.Query;
    
                
    //向上冒泡对象名
    this.eventBubble = 'parent';
    
        
                
    //控件默认宽度(width === 'default'时的宽度)
    this.defaultWidth = 100;

    //控件默认高度(height === 'default'时的高度)
    this.defaultHeight = 25;
    
        
    //水平滚动条位置
    this.scrollLeft = 0;
    
    //竖直滚动条位置
    this.scrollTop = 0;
    

    
    //当前绘制器
    this.renderer = null;
        
    
    
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

            this.renderer.set(this, 'id', value);
        }
    });


    
    //指定class名 与html一样
    this.defineProperty('className', '', {

        set: function (value) {

            this.renderer.set(this, 'className', value);
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

        if (name && (list = name.match(/\w+/g)))
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



    
    //定义定位属性
    function location(name, defaultValue, attributes) {
        
        attributes = attributes || {};
        attributes.group = 'location';
        attributes.query = true;

        attributes.set = function () {

            if (this.__update_dirty < 2)
            {
                this.invalidate();
            }
        };

        self.defineProperty(name, defaultValue, attributes);
    };
    
    
    //定义定位属性
    flyingon.locationProperty = location;
    
        
    //是否可见
    location('visible', true, {
     
        set: function (value) {

            this.renderer.set(this, 'visible', value);

            if (this.__update_dirty < 2)
            {
                this.invalidate();
            }
        }
    });
        

    //控件横向对齐方式
    //left      左边对齐
    //center    横向居中对齐
    //right     右边对齐
    location('alignX', 'left');

    //控件纵向对齐方式
    //top       顶部对齐
    //middle    纵向居中对齐
    //bottom    底部对齐
    location('alignY', 'top');


    location('left', '');

    location('top', '');

    location('width', 'default');

    location('height', 'default');


    location('minWidth', '');

    location('maxWidth', '');

    location('minHeight', '');

    location('maxHeight', '');


    location('margin', '');

    
        
    //边框宽度
    this.defineProperty('border', '', {

        group: 'layout',
        set: function (value) {

            this.boxModel && (this.boxModel.border = pixel_sides(value));
            this.renderer.set(this, 'border', value);

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }
    });

    
    //内边距
    this.defineProperty('padding', '', {

        group: 'layout',
        dom: 1,
        set: function (value) {

            this.boxModel && (this.boxModel.padding = pixel_sides(value));
            this.renderer.set(this, 'padding', value);

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }
    });
    
    
    //水平方向超出内容时显示方式
    this.defineProperty('overflowX', 'auto', {

        group: 'layout',
        dom: 1,
        set: function (value) {

            this.renderer.set(this, 'overflowX', value);

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }
    });
      
    
    //竖直方向超出内容时显示方式
    this.defineProperty('overflowY', 'auto', {

        group: 'layout',
        dom: 1,
        set: function (value) {

            this.renderer.set(this, 'overflowY', value);

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }
    });
    
    
    
    //获取定位属性值
    this.locationValue = function (name) {
      
        var values = this.__location_values,
            value;
        
        if (values && (value = values[name]) !== void 0)
        {
            return value;
        }
        
        if ((values = this.__storage) && (value = values[name]) !== void 0)
        {
            return value;
        }
        
        return this.__defaults[name];
    };
    
    


    var box_keys = ['margin', 0, 'border', 0, 'padding', 0, 
                    'minWidth', 1, 'maxWidth', 1, 
                    'minHeight', 2, 'maxHeight', 2,
                    'width', 3, 'height', 3];
    
    var sides_empty = pixel_sides(0);

    var pixel_cache = pixel.cache;

    var sides_cache = pixel_sides.cache;

    //初始化盒子模型
    this.__init_boxModel = function (width, height) {

        var box = this.boxModel || (this.boxModel = {}),
            defaults = this.__defaults,
            storage = this.__storage,
            location = box.location = this.__location_values,
            index = 0,
            keys = box_keys,
            key,
            tag,
            any;

        while (key = keys[index++])
        {
            tag = keys[index++];

            if ((!location || (any = location[key]) === void 0) && (!storage || (any = storage[key]) === void 0))
            {
                any = defaults[key];
            }

            if (any && any !== '0')
            {
                if (any <= 0)
                {
                    any = tag ? 0 : sides_empty;
                }
                else if (any > 0)
                {
                    any |= 0;

                    if (!tag)
                    {
                        any = sides_cache[any] || pixel_sides(any, width);
                    }
                }
                else if (tag < 3)
                {
                    any = tag 
                        ? pixel_cache[any] || pixel(any, tag === 1 ? width : height) 
                        : sides_cache[any] || pixel_sides(any, width);
                }
            }
            else if (tag)
            {
                any = 0;
            }
            else
            {
                any = sides_empty;
            }

            box[key] = any;
        }
        
        box.alignX = location && location.alignX || storage && storage.alignX || defaults.alignX;
        box.alignY = location && location.alignY || storage && storage.alignY || defaults.alignY;
        
        return box;
    };
    
    
         
    //测量控件大小
    //containerWidth    容器宽度
    //containerHeight   容器高度
    //availableWidth    可用宽度 
    //availableHeight   可用高度
    //defaultToFill     默认宽度或高度是否转成充满 0:不转 1:宽度转 2:高度转 3:宽高都转
    this.measure = function (containerWidth, containerHeight, availableWidth, availableHeight, defaultToFill) {
        
        var box = this.__init_boxModel(containerWidth, containerHeight),
            minWidth = box.minWidth,
            maxWidth = box.maxWidth,
            minHeight = box.minHeight,
            maxHeight = box.maxHeight,
            width = box.width,
            height = box.height,
            auto = 0;

        //处理宽度
        switch (width)
        {
            case 'default':
                width = defaultToFill & 1 ? true : this.defaultWidth;
                break;
                
            case 'fill':
                width = true;
                break;

            case 'auto':
                if (height === 'auto') //width及height同为auto时,width按default处理
                {
                    width = defaultToFill & 1 ? true : this.defaultWidth;
                }
                else
                {
                    auto = 1;
                    width = availableWidth || this.defaultWidth;
                }
                break;

            default:
                width = width >= 0 ? width : pixel(width, containerWidth);
                break;
        }

        //充满可用宽度
        if (width === true && 
            (width = (availableWidth >= 0 ? availableWidth : containerWidth) - box.margin.width) < 0)
        {
            width = 0;
        }

        //处理高度
        switch (height)
        {
            case 'default':
                height = defaultToFill & 2 ? true : this.defaultHeight;
                break;
                
            case 'fill':
                height = true;
                break;

            case 'auto':
                auto = 2;
                height = availableHeight || this.defaultHeight;
                break;

            default:
                height = height >= 0 ? height : pixel(height, containerHeight);
                break;
        }

        this.__auto_size = auto; 
        
        //充满可用高度
        if (height === true && 
            (height = (availableHeight >= 0 ? availableHeight : containerHeight) - box.margin.height) < 0)
        {
            height = 0;
        }

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
        box.offsetWidth = width;
        box.offsetHeight = height;
        
        //测量后处理
        if (this.onmeasure(box, auto) !== false)
        {
            //处理最小及最大宽度
            if (box.offsetWidth !== width)
            {
                if ((width = box.offsetWidth) < minWidth)
                {
                    box.offsetWidth = width = minWidth;
                }
                else if (maxWidth > 0 && width > maxWidth)
                {
                    box.offsetWidth = width = maxWidth;
                }
            }

            //处理最小及最大高度
            if (box.offsetHeight !== height)
            {
                if ((height = box.offsetHeight) < minHeight)
                {
                    box.offsetHeight = height = minHeight;
                }
                else if (maxHeight > 0 && height > maxHeight)
                {
                    box.offsetHeight = height = maxHeight;
                }
            }
        }

        //如果大小发生了变化则标记布局已变更
        if (this.__update_dirty < 2 && this.__size_tag !== (height << 16) + width)
        {
            this.__update_dirty = 2;
        }
        
        return box;
    };
    
        
    //自定义测量处理
    this.onmeasure = function (box, auto) {
        
        return false;
    };
    

    //定位控件
    this.locate = function (x, y, alignWidth, alignHeight, container) {
        
        var box = this.boxModel,
            margin = box.margin,
            width = box.offsetWidth,
            height = box.offsetHeight,
            value;

        if (alignWidth > 0 && (value = alignWidth - width))
        {
            switch (box.alignX)
            {
                case 'center':
                    x += value >> 1;
                    break;

                case 'right':
                    x += value;
                    break;
                    
                default:
                    x += margin.left;
                    break;
            }
        }
        else
        {
            x += margin.left;
        }

        if (alignHeight > 0 && (value = alignHeight - height))
        {
            switch (box.alignY)
            {
                case 'middle':
                    y += value >> 1;
                    break;

                case 'bottom':
                    y += value;
                    break;
                    
                default:
                    y += margin.top;
                    break;
            }
        }
        else
        {
            y += margin.top;
        }
        
        box.offsetLeft = x;
        box.offsetTop = y;
        
        if (this.onlocate(box) !== false)
        {
            x = box.offsetLeft;
            y = box.offsetTop;
        }

        //检测位置从上次渲染后是否发生变更
        this.__location_dirty = (value = this.__location_tag) && value !== (y << 16) + x;

        if (container)
        {
            container.arrangeX = (x += width + margin.right);
            container.arrangeY = (y += height + margin.bottom);

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
    
    
    //自定义定位处理
    this.onlocate = function (box) {
      
        return false;
    };
    
        
    
    //创建样式
    function style(name, check) {

        var key = name.replace(/-(\w)/g, function (_, x) {
        
            return x.toUpperCase();
        });
        
        //定义属性
        self.defineProperty(key, '', {

            group: 'appearance',
            dom: check === false ? 1 : 2,

            set: function (value) {

                this.renderer.set(this, key, value);
            }
        });
    };
    
    
    //控件层叠顺序
    style('z-index', false);

    
    //控件上右下左边框样式
    style('border-style', false);


    //控件上右下左边框颜色
    style('border-color', false);


    //控件上右下左边框圆角
    style('border-radius');


    //阅读方向
    //ltr	    从左到右 
    //rtl	    从右到左 
    style('direction', false);


    //控件内容横向对齐样式
    //left      左边对齐
    //center    横向居中对齐
    //right     右边对齐
    style('text-align', false);

    //控件内容纵向对齐样式
    //top       顶部对齐
    //middle    纵向居中对齐
    //bottom    底部对齐
    style('vertical-align', false);



    //控件可见性
    //visible	默认值 元素是可见的 
    //hidden	元素是不可见的 
    style('visibility', false);

    //控件透明度
    //number	0(完全透明)到1(完全不透明)之间数值
    style('opacity');

    //控件光标样式
    //url	    需使用的自定义光标的 URL     注释：请在此列表的末端始终定义一种普通的光标, 以防没有由 URL 定义的可用光标 
    //default	默认光标(通常是一个箭头)
    //auto	    默认 浏览器设置的光标 
    //crosshair	光标呈现为十字线 
    //pointer	光标呈现为指示链接的指针(一只手)
    //move	    此光标指示某对象可被移动 
    //e-resize	此光标指示矩形框的边缘可被向右(东)移动 
    //ne-resize	此光标指示矩形框的边缘可被向上及向右移动(北/东) 
    //nw-resize	此光标指示矩形框的边缘可被向上及向左移动(北/西) 
    //n-resize	此光标指示矩形框的边缘可被向上(北)移动 
    //se-resize	此光标指示矩形框的边缘可被向下及向右移动(南/东) 
    //sw-resize	此光标指示矩形框的边缘可被向下及向左移动(南/西) 
    //s-resize	此光标指示矩形框的边缘可被向下移动(南) 
    //w-resize	此光标指示矩形框的边缘可被向左移动(西) 
    //text	    此光标指示文本 
    //wait	    此光标指示程序正忙(通常是一只表或沙漏) 
    //help	    此光标指示可用的帮助(通常是一个问号或一个气球) 
    style('cursor', false);


    //控件背景颜色
    //color_name	规定颜色值为颜色名称的背景颜色(比如 red)  transparent:透明 
    //hex_number	规定颜色值为十六进制值的背景颜色(比如 #ff0000) 
    //rgb_number	规定颜色值为 rgb 代码的背景颜色(比如 rgb(255,0,0)) 
    style('background-color', false);

    //控件背景图片
    //string        图像名(空字符串则表示无背景)
    //url('URL')	指向图像的路径
    style('background-image', false);

    //控件背景重复方式
    //repeat	背景图像将在垂直方向和水平方向重复 
    //repeat-x	背景图像将在水平方向重复 
    //repeat-y	背景图像将在垂直方向重复 
    //no-repeat	背景图像将仅显示一次 
    style('background-repeat', false);

    //控件背景颜色对齐方式
    //top left
    //top center
    //top right
    //center left
    //center center
    //center right
    //bottom left
    //bottom center
    //bottom right  如果您仅规定了一个关键词, 那么第二个值将是'center'     默认值：0% 0% 
    //x% y%	        第一个值是水平位置, 第二个值是垂直位置     左上角是 0% 0% 右下角是 100% 100%     如果您仅规定了一个值, 另一个值将是 50% 
    //xpos ypos	    第一个值是水平位置, 第二个值是垂直位置     左上角是 0 0 单位是像素 (0px 0px) 或任何其他的 CSS 单位     如果您仅规定了一个值, 另一个值将是50%     您可以混合使用 % 和 position 值 
    style('background-position', false);


    //控件颜色
    //color_name	规定颜色值为颜色名称的颜色(比如 red) 
    //hex_number	规定颜色值为十六进制值的颜色(比如 #ff0000) 
    //rgb_number	规定颜色值为 rgb 代码的颜色(比如 rgb(255,0,0)) 
    style('color', false);


    //控件字体样式
    //normal	浏览器显示一个标准的字体样式 
    //italic	浏览器会显示一个斜体的字体样式 
    //oblique	浏览器会显示一个倾斜的字体样式 
    style('font-style', false);

    //控件字体变体
    //normal	    浏览器会显示一个标准的字体 
    //small-caps	浏览器会显示小型大写字母的字体 
    style('font-variant', false);

    //控件字体粗细
    //normal	定义标准的字符 
    //bold	    定义粗体字符 
    //bolder	定义更粗的字符 
    //lighter	定义更细的字符 
    //100-900   定义由粗到细的字符 400 等同于 normal, 而 700 等同于 bold 
    style('font-weight', false);

    //控件字体大小
    style('font-size', false);

    //控件文字行高
    style('line-height', false);

    //控件字体族 family-name generic-family  用于某个元素的字体族名称或/及类族名称的一个优先表
    style('font-family', false);



    //控件文字词间距(以空格为准)
    style('word-spacing', false);

    //控件文字字间距
    style('letter-spacing', false);

    //控件文字缩进
    style('text-indent', false);

    //控件文字装饰
    //none	        默认 定义标准的文本 
    //underline	    定义文本下的一条线 
    //overline	    定义文本上的一条线 
    //line-through	定义穿过文本下的一条线 
    //blink	        定义闪烁的文本 
    style('text-decoration', false);

    //控件文字溢出处理方式
    //clip	    修剪文本
    //ellipsis	显示省略符号来代表被修剪的文本 	
    //string	使用给定的字符串来代表被修剪的文本 
    style('text-overflow', false);
    
    
    
        
    this.defineProperty('tabIndex', -1, {
     
        set: function (value) {

            this.renderer.set(this, 'tabIndex', value);
        }
    });
    
    
    this.defineProperty('disabled', false, {
     
        set: function (value) {

            this.renderer.set(this, 'disabled', value);
        }
    });
    

    this.defineProperty('readonly', false, {
     
        set: function (value) {

            this.renderer.set(this, 'readonly', value);
        }
    });
    
    
    
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


    //自定义标记
    this.defineProperty('tag', null);



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
            this.renderer.update(this);
        }
        
        return this;
    };


    //刷新控件
    this.refresh = function () {

        this.view && this.renderer.update(this);
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
        
        if (this.view)
        {
            this.renderer.dispose(this);
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
        
        this.parent = this.previousSibling = this.nextSibling = null;
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
            
            this.defaultClassName = name;
        }
    };

    

}).alias('control');