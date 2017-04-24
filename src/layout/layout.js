//布局基类
flyingon.Layout = flyingon.defineClass(function () {

    

    //注册的布局列表
    var registry_list = flyingon.create(null); 
    
    //已定义的布局集合
    var layouts = flyingon.create(null); 

    
    
    //布局类型
    this.type = null;

    
    
    //自适应布局条件
    this.defineProperty('condition', null);
    
    
    //布局间隔宽度
    //length	规定以具体单位计的值 比如像素 厘米等
    //number%   控件客户区宽度的百分比
    this.defineProperty('spacingX', '2');

    //布局间隔高度
    //length	规定以具体单位计的值 比如像素 厘米等
    //number%   控件客户区高度的百分比
    this.defineProperty('spacingY', '2');


    //是否按照从右到左的顺序排列
    this.defineProperty('rtl', false);

   
    //子项定位属性值
    this.defineProperty('location', null, {

        set: function (value) {

            this.__location = !!value;
        }
    });

    
    //分割子布局
    this.defineProperty('sublayouts', null, {
       
        set: function (value) {

            this.__sublayouts = !!value;
        }
    });
    
    
            
    //获取或切换而已或定义布局
    flyingon.layout = function (name, values) {
    
        if (name && values && typeof values !== 'function') //定义布局
        {
            layouts[name] = [values, null];
        }
        else
        {
            return flyingon.load.key('layout', name, values); //获取或设置当前布局
        }
    };
    
    
    
    //排列容器控件
    flyingon.arrange = function (control, items, hscroll, vscroll, sublayout) {
        
        var box = control.boxModel,
            border = box.border,
            padding = box.padding,
            layout,
            any;
        
        //计算排列区域
        box.arrangeLeft = padding.left;
        box.arrangeTop = padding.top;

        box.clientWidth = (any = box.offsetWidth - border.width - padding.width) > 0 ? any : 0;
        box.clientHeight = (any = box.offsetHeight - border.height - padding.height) > 0 ? any : 0;

        //自定义调整排列区域
        if (any = control.arrangeArea)
        {
            any.call(control, box);
        }

        box.arrangeRight = box.arrangeLeft;
        box.arrangeBottom = box.arrangeTop;
        
        //排列子控件
        if (items && items.length > 0)
        {
            arrange(layout = flyingon.getLayout(control), box, items, hscroll, vscroll, sublayout);
                    
            if (hscroll)
            {
                box.hscroll = box.arrangeRight > box.arrangeLeft + box.clientWidth;
            }

            if (vscroll)
            {
                box.vscroll = box.arrangeBottom > box.arrangeTop + box.clientHeight;
            }
            
            box.arrangeRight += padding.right;
            box.arrangeBottom += padding.bottom;

            //非子布局 从左向左处理(注:子布局不需处理,由上层布局统一处理)
            if (!sublayout && (flyingon.rtl || layout.rtl()))
            {
                arrange_rtl(box, items);
            }
        }
        else
        {
            box.hscroll = box.vscroll = false;
        }
    };
    
    
    //获取指定控件关联的布局实例
    flyingon.getLayout = function (control) {
        
        var layout = control.__layout,
            any;
        
        //获取当前布局对象
        if (!layout && typeof (any = control.layout) === 'function')
        {
            layout = control.__layout = find_layout(any.call(control));
        }
        
        //数组按自适应布局处理
        if (layout instanceof Array)
        {
            any = control.boxModel;
            layout = check_adaption(layout, any.offsetWidth, any.offsetHeight);
        }
        
        return layout;
    };
    
                
    //查找布局实例
    function find_layout(key) {
      
        if (key)
        {
            if (typeof key === 'string')
            {
                if (key = layouts[key])
                {
                    return key[1] || (key[1] = deserialize_layout(key[0]));
                }
            }
            else
            {
                return deserialize_layout(key);
            }
        }
  
        return new registry_list.flow();
    };


    //检测自适应
    function check_adaption(layouts, width, height) {

        var layout, item, condition, value;

        for (var i = 0, l = layouts.length; i < l; i++)
        {
            if (item = layouts[i])
            {
                if (condition = item.condition)
                {
                    if ((value = condition.width) && (width < value[0] || width > value[1]))
                    {
                        continue;
                    }

                    if ((value = condition.height) && (height < value[0] || height > value[1]))
                    {
                        continue;
                    }

                    layout = item;
                    break;
                }
                else
                {
                    layout = item;
                }
            }
        }

        if (layout)
        {
            return layout.__layout || (layout.__layout = deserialize_layout(layout, false));
        }

        return new registry_list.flow();
    };
    
    
    //反序列化布局实例
    function deserialize_layout(data, adaption) {
        
        //数组为自适应布局
        if (adaption !== false && data instanceof Array)
        {
            return data;
        }

        var layout = new (registry_list[data && data.type] || registry_list.flow)();
        
        layout.deserialize(flyingon.SerializeReader.instance, data);
        return layout;
    };

    
    //内部排列方法
    function arrange(layout, container, items, hscroll, vscroll) {

        var values = layout.__sublayouts,
            width,
            height,
            fn,
            any;
                            
        //处理子布局(注:子布局不支持镜象,由上层布局统一处理)
        if (values)
        {
            if (values === true)
            {
                values = layout.__sublayouts = init_sublayouts(layout.sublayouts());
            }
 
            //分配置子布局子项
            allot_sublayouts(values, items);
             
            //先排列子布局
            items = values;
        }
        else if (values = layout.__location) //处理强制子项值
        { 
            if (values === true)
            {
                values = layout.location(); 
                layout.__location = values;
            }

            if (typeof values === 'function')
            {
                fn = values;
                values = fn.values;
                
                width = container.clientWidth;
                height = container.clientHeight;
                
                for (var i = items.length - 1; i >= 0; i--)
                {
                    any = fn(items[i], i, width, height);
                    items[i].__location_values = any >= 0 ? values[any] : any;
                }
            }
            else
            {
                for (var i = items.length - 1; i >= 0; i--)
                {
                    items[i].__location_values = values;
                }
            }
        }
        else //清空原有强制子项属性
        {
            for (var i = items.length - 1; i >= 0; i--)
            {
                items[i].__location_values = null;
            }
        }
        
        //排列
        if (hscroll || vscroll)
        {
            arrange_auto(layout, container, items, hscroll, vscroll);
        }
        else
        {
            layout.arrange(container, items);
        }
    };
    
    
    //初始化子布局
    function init_sublayouts(values) {
        
        var index = values.length;
        
        if (!index)
        {
            values = [values];
            index = 1;
        }
        
        var reader = flyingon.SerializeReader,
            layouts = new Array(values.length),
            fixed = 0,
            weight = 0,
            layout,
            scale,
            any;
        
        while (any = values[--index])
        {
            (layout = layouts[index] = new flyingon.Sublayout()).deserialize(reader, any);
            
            if (scale = layout.scale())
            {
                if (layout.fixed = any = scale | 0)
                {
                    fixed += any;
                }

                if (layout.weight = any = scale - any)
                {
                    weight += any;
                }
            }
            else
            {
                layout.fixed = 0;
                weight += (layout.weight = 1);
            }
        }
        
        layouts.fixed = fixed;
        layouts.weight = weight;
        
        return layouts;
    };
    
    
    //分配子布局子项
    function allot_sublayouts(layouts, items) {
        
        var margin = items.length - layouts.fixed, //余量
            weight = layouts.weight,
            index = 0;
        
        if (margin < 0)
        {
            margin = 0;
        }
        
        for (var i = 0, l = layouts.length; i < l; i++)
        {
            var layout = layouts[i],
                length = layout.fixed,
                scale = layout.weight,
                value;
            
            if (scale)
            {
                value = margin * scale / weight | 0;
                weight -= scale;
                
                length += value;
                margin -= value;
            }

            layout.__children = items.slice(index, index += length);
        }
    };
        

    //自动滚动条排列
    function arrange_auto(layout, container, items, hscroll, vscroll) {

        var x, y;

        //上次有水平滚动条先减去滚动条高度
        if (hscroll && container.hscroll)
        {
            if ((container.clientHeight -= flyingon.hscroll_height) < 0)
            {
                container.clientHeight = 0;
            }

            x = true;
        }

        //上次有竖直滚动条先减去滚动条宽度
        if (vscroll && container.vscroll)
        {
            if ((container.clientWidth -= flyingon.vscroll_width) < 0)
            {
                container.clientWidth = 0;
            }

            y = true;
        }

        //按上次状态排列
        layout.arrange(container, items, x ? false : hscroll, y ? false : vscroll);

        //按水平滚动条排列后但结果无水平滚动条
        if (x = x && container.arrangeRight <= container.arrangeLeft + container.clientWidth)
        {
            container.clientHeight += flyingon.hscroll_height;
        }

        //按竖直滚动条排列后但结果无竖直滚动条
        if (y = y && container.arrangeBottom <= container.arrangeTop + container.clientHeight)
        {
            container.clientWidth += flyingon.vscroll_width;
        }

        //出现上述情况则重排
        if (x || y)
        {
            layout.arrange(container, items);
        }
    };

        
    //从右到左排列
    function arrange_rtl(container, items) {

        var width = container.clientWidth,
            any = container.arrangeRight;
        
        if (width < any)
        {
            width = any;
        }
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if (any = items[i].boxModel)
            {
                any.offsetLeft = width - any.offsetLeft - any.offsetWidth;
            }
        }
    };

    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

    };
    
    
    //重排
    this.rearrange = function (container, items, hscroll, vscroll) {
      
        var flag = false;
        
        if (hscroll && (hscroll === 1 || container.arrangeRight > container.arrangeLeft + container.clientWidth))
        {
            if ((container.clientHeight -= flyingon.hscroll_height) < 0)
            {
                container.clientHeight = 0;
            }
            
            hscroll = false;
            flag = true;
        }
        
        if (vscroll && (vscroll === 1 || container.arrangeBottom > container.arrangeTop + container.clientHeight))
        {
            if ((container.clientWidth -= flyingon.vscroll_width) < 0)
            {
                container.clientWidth = 0;
            }
            
            vscroll = false;
            flag = true;
        }
        
        if (flag)
        {
            container.arrangeRight = container.arrangeLeft;
            container.arrangeBottom = container.arrangeTop;
            
            this.arrange(container, items, hscroll, vscroll);
            return true;
        }
    };
    
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        var box, any;
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if (box = items[i].boxModel)
            {
                if (x >= (any = box.offsetLeft) && 
                    x <= any + box.offsetWidth &&
                    y >= (any = box.offsetTop) &&
                    y <= any + box.offsetHeight)
                {
                    return items[i];
                }
            }
        }

        return null;
    };
    
       
    
    //引入序列化功能片段
    flyingon.__serialize_fragment(this);
    
    
    
    //设置不反序列化type属性
    this.deserialize_type = true;
    
            

    this.__class_init = function (Class, base) {

        if (base.__class_init)
        {
            var type = this.type;
            
            if (type)
            {
                registry_list[type] = Class;
                layouts[type] = [null, new Class()];
            }
            else
            {
                throw flyingon.errortext('flyingon', 'layout type').replace('{0}', Class.xtype);
            }
        }
    };
        

});



//单列布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'line';
    
        
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            right = x + width,
            spacingX = flyingon.pixel(this.spacingX(), width),
            control;
        
        //先按无滚动条的方式排列
        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];
            control.measure(width, height, right - x || -1, height, 2);
            control.locate(x, y, 0, height, container);

            if (hscroll && container.arrangeRight > right)
            {
                return this.rearrange(container, items, 1, false);
            }

            x = container.arrangeX + spacingX;
        }
    };
    
    
});



//纵向单列布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'vertical-line';
    
        
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            bottom = y + height,
            spacingY = flyingon.pixel(this.spacingY(), height),
            control;
        
        //先按无滚动条的方式排列
        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];
            control.measure(width, height, width, bottom - height || -1, 1);
            control.locate(x, y, width, 0, container);

            if (vscroll && container.arrangeBottom > bottom)
            {
                return this.rearrange(container, items, false, 1);
            }

            y = container.arrangeY + spacingY;
        }
    };
    
    
});



//流式布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'flow';


    //行高
    this.defineProperty('lineHeight', 0, {
     
        dataType: 'integer',
        check: function (value) {

            return value > 0 ? value : 0;
        }
    });

        
    //控制流式布局是否换行
    flyingon.locationProperty('newline', false);
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            right = x + width,
            bottom = y + height,
            pixel = flyingon.pixel,
            spacingX = pixel(this.spacingX(), width),
            spacingY = pixel(this.spacingY(), height),
            lineHeight = pixel(this.lineHeight(), height),
            left = x,
            control,
            box;

        for (var i = 0, l = items.length; i < l; i++)
        {
            box = (control = items[i]).measure(width, height, right - x || -1, lineHeight || -1);

            //处理换行
            if (x > left && (x + box.offsetWidth + box.margin.right > right || 
                control.locationValue('newline')))
            {
                x = left;
                y = (lineHeight ? y + lineHeight : container.arrangeBottom) + spacingY;
            }

            control.locate(x, y, 0, lineHeight, container);

            //出现滚动条后重排
            if (vscroll && container.arrangeBottom > bottom)
            {
                return this.rearrange(container, items, false, 1);
            }

            x = container.arrangeX + spacingX;
        }
    };

    
});



//流式布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'vertical-flow';


    //行宽
    this.defineProperty('lineWidth', 0, {
     
        dataType: 'integer',
        check: function (value) {

            return value > 0 ? value : 0;
        }
    });

    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            right = x + width,
            bottom = y + height,
            pixel = flyingon.pixel,
            spacingX = pixel(this.spacingX(), width),
            spacingY = pixel(this.spacingY(), height),
            lineWidth = pixel(this.lineWidth(), width),
            top = y,
            control,
            box;

        for (var i = 0, l = items.length; i < l; i++)
        {
            box = (control = items[i]).measure(width, height, lineWidth || -1, bottom - y || -1);

            //处理换行
            if (y > top && (y + box.offsetHeight + box.margin.bottom > bottom || 
                control.locationValue('newline')))
            {
                x = (lineWidth ? x + lineWidth : container.arrangeRight) + spacingX;
                y = top;
            }

            control.locate(x, y, lineWidth, 0, container);

            //出现滚动条后重排
            if (hscroll && container.arrangeRight > right)
            {
                return this.rearrange(container, items, 1, false);
            }

            y = container.arrangeY + spacingY;
        }
    };

    
});



//停靠布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'dock';
    
    
    //控件停靠方式(此值仅在当前布局类型为停靠布局(dock)时有效)
    //left:     左停靠
    //top:      顶部停靠
    //right:    右停靠
    //bottom:   底部停靠
    //fill:     充满
    flyingon.locationProperty('dock', 'left');

    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            right = x + width,
            bottom = y + height,
            clientWidth = width,
            clientHeight = height,
            pixel = flyingon.pixel,
            spacingX = pixel(this.spacingX(), width),
            spacingY = pixel(this.spacingY(), height),
            list,
            control,
            box;

        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];

            switch (control.locationValue('dock'))
            {
                case 'left':
                    control.measure(clientWidth, clientHeight, width, height, 2);
                    control.locate(x, y, 0, height, container);

                    if ((width = right - (x = container.arrangeX + spacingX)) < 0)
                    {
                        width = 0;
                    }
                    break;

                case 'top':
                    control.measure(clientWidth, clientHeight, width, height, 1);
                    control.locate(x, y, width, 0, container);

                    if ((height = bottom - (y = container.arrangeY + spacingY)) < 0)
                    {
                        height = 0;
                    }
                    break;

                case 'right':
                    box = control.measure(clientWidth, clientHeight, width, height, 2);
                    
                    right -= box.offsetWidth - box.margin.width;
                    control.locate(right, y, 0, height, container);

                    if ((width = (right -= spacingX) - x) < 0)
                    {
                        width = 0;
                    }
                    break;

                case 'bottom':
                    box = control.measure(clientWidth, clientHeight, width, height, 1);bottom
                    
                    bottom -= box.offsetHeight - box.margin.height;
                    control.locate(x, bottom, width, 0, container);

                    if ((height = (bottom -= spacingY) - y) < 0)
                    {
                        height = 0;
                    }
                    break;

                default:
                    (list || (list = [])).push(control);
                    continue;
            }
        }
        
        //排列充满项
        if (list)
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                control.measure(clientWidth, clientHeight, width, height, 3);
                control.locate(x, y, width, height, container);
            }
        }
        
        //检查是否需要重排
        if (hscroll || vscroll)
        {
            this.rearrange(container, items, hscroll, vscroll);
        }
    };

    
});



//层叠布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'cascade';
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            control;

        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];
            control.measure(width, height);
            control.locate(x, y, width, height, container);
        }
        
        //检查是否需要重排
        if (hscroll || vscroll)
        {
            this.rearrange(container, items, hscroll, vscroll);
        }
    };
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        return -1;
    };
    
    
});



//绝对定位布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'absolute';
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            right = x + width,
            bottom = y + height,
            fn = flyingon.pixel,
            control,
            left,
            top;

        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];

            left = x + fn(control.locationValue('left'), width);
            top = y + fn(control.locationValue('top'), height);

            control.measure(width, height, right - x, bottom - y);
            control.locate(left, top, 0, 0, container);
        }
    };
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        return -1;
    };
    
    
});



//均分布局
flyingon.defineClass(flyingon.Layout, function (base) {
    
    
    this.type = 'uniform';
    
    
    //固定大小
    this.defineProperty('size', 20);
    
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.clientWidth,
            height = container.clientHeight,
            length = items.length,
            size = this.size(),
            weight = length - 1,
            spacing = width - size * length,
            control,
            box,
            value;

        for (var i = 0; i < length; i++)
        {
            box = (control = items[i]).measure(width, height, size, height, 3);
            control.locate(x, y, 0, height, container);
            
            value = spacing / weight | 0;
            
            x += box.offsetWidth + value;
            
            spacing -= value;
            weight--;
        }
    };
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        var box, any;
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if (box = items[i].boxModel)
            {
                if (x >= (any = box.offsetLeft) && x <= any + box.offsetWidth)
                {
                    return items[i];
                }
            }
        }

        return null;
    };
    
    
});