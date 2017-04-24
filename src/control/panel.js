flyingon.defineClass('Panel', flyingon.Control, function (base) {



    //允许添加的子控件类型
    this.childControlType = flyingon.Control;
    
    
    //重写默认宽度
    this.defaultWidth = 400;
    
    //重写默认高度
    this.defaultHeight = 300;
        
    
    //第一个子控件
    this.firstChild = null;


    //最后一个子控件
    this.lastChild = null;

    

    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);



    //当前布局
    this.defineProperty('layout', null, {
     
        group: 'locate',
        query: true,
        set: function (value) {

            this.__layout = null;

            if (this.scrollLeft || this.scrollTop)
            {
                this.renderer.__reset_scroll(this);
            }
            
            this.invalidate();
        }
    });
    

    //是否启用全局渲染
    this.defineProperty('fullRender', false);
    
        
    
    
    //子控件集合
    this.children = function () {

        return this.__children || this.__init_children();
    };


    //获取指定索引的子项
    this.at = function (index) {

        var list = this.__children || this.__init_children();

        if ((index |= 0) < 0)
        {
            index += list.length;
        } 

        return list[index];
    };
        
    
    //初始化子控件集合
    this.__init_children = function () {

        var list = this.__children = [],
            item = this.firstChild;

        while (item)
        {
            list.push(item);
            item = item.nextSibling;
        }

        return list;
    };


    //批量快速添加子节点
    //不检测,不处理缓存,不重置布局
    this.appendControls = function (controls) {

        var index = 0,
            last,
            item;

        if (item = controls && controls[index++])
        {
            this.__children = null;

            if (last = this.lastChild)
            {
                last.nextSibling = item;
                item.previousSibling = last;
            }
            else
            {
                this.firstChild = item;
            }

            last = item;

            while (item = controls[index++])
            {
                item.previousSibling = last;
                last.nextSibling = item;
                last = item;
            }

            this.lastChild = last;
        }

        return this;
    };

        
    //添加子控件
    this.appendChild = function (controls) {

        return this.insertBefore(controls, null);
    };


    //在指定的位置插入子控件
    this.insertAt = function (control, index) {

        return this.insertBefore(control, this.at(index));
    };
    
    
    //在指定子控件前插入子控件
    this.insertBefore = function (control, refChild) {

        var any = this.childControlType;

        if (control instanceof any)
        {
            if (any = control.parent)
            {
                any.removeChild(control, false);
            }

            control.parent = this;
        }
        else
        {
            throw 'control is not type of ' + any.xtype;
        }

        if (refChild && refChild.parent !== this)
        {
            refChild = null;
        }
 
        //清除类型选择器缓存
        if (flyingon.__type_query_cache)
        {
            flyingon.__clear_type_query(this);
        }

        //清空子视图缓存集合
        this.__children = null;

        //处理组件关系
        if (refChild)
        {
            if (any = refChild.previousSibling)
            {
                any.nextSibling = control;
                control.previousSibling = any;
            }
            else
            {
                this.firstChild = control;
            }

            refChild.previousSibling = control;
            control.nextSibling = refChild;
        }
        else 
        {
            if (any = this.lastChild)
            {
                this.lastChild = any.nextSibling = control;
                control.previousSibling = any;
            }
            else
            {
                this.firstChild = this.lastChild = control;
            }
        }

        if (this.view && control.view)
        {
            this.renderer.insertBefore(this, control);
        }

        if (this.__update_dirty < 2)
        {
            this.invalidate(true);
        }

        return this;
    };


    //移除指定子控件
    this.removeChild = function (control, dispose) {

        var previous, next;

        if (control && control.parent === this)
        {           
            //清除类型选择器缓存
            if (flyingon.__type_query_cache)
            {
                flyingon.__clear_type_query(this);
            }

            if (this.view && control.view)
            {
                this.renderer.removeChild(this, control);
            }

            control.parent = null;

            previous = control.previousSibling || null;
            next = control.nextSibling || null;

            if (previous)
            {
                previous.nextSibling = next;
            }
            else
            {
                this.firstChild = next;
            }

            if (next)
            {
                next.previousSibling = previous;
            }
            else
            {
                this.lastChild = previous;
            }

            //清空子视图缓存集合
            this.__children = null;

            if (dispose !== false)
            {
                control.dispose();
            }

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }

        return this;
    };


    //移除指定位置的子控件
    this.removeAt = function (index, dispose) {

        var item = this.at(index);
        return item ? this.removeChild(item, dispose) : this;
    };


    //清除子控件
    this.clear = function (dispose) {
      
        var item = this.firstChild;
        
        if (item)
        {
            dispose = dispose !== false;

            //清除类型选择器缓存
            if (flyingon.__type_query_cache)
            {
                flyingon.__clear_type_query(this);
            }

            //如果子项已经渲染则清除子视图
            if (this.view && item.view)
            {
                this.renderer.clear(this);
            }

            do
            {
                if (dispose)
                {
                    item.dispose();
                }
                else
                {
                    item.parent = item.previousSibling = item.nextSibling = null;
                }
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = null;

            //清空子视图缓存集合
            this.__children = null;

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }
        
        return this;
    };

               

    //测量自动大小
    this.onmeasure = function (box, auto) {
        
        if (auto && this.__visible_area !== false)
        {
            this.arrange();

            if (auto === 1)
            {
                box.offsetWidth = box.arrangeRight + box.border.width;
            }
            else
            {
                box.offsetHeight = box.arrangeBottom + box.border.height;
            }
        }
        else
        {
            return false;
        }
    };
    
        
    
    //是否需要排列
    this.__arrange_dirty = true;
    
    
    //排列子控件
    this.arrange = function () {

        var box, auto, list, item, hscroll, vscroll, any;
        
        if (box = this.boxModel)
        {
            if (auto = this.__auto_size)
            {
                box.hscroll = box.vscroll = false;
            }
            else
            {
                //处理自动滚动
                switch (this.overflowX())
                {
                    case 'scroll':
                        box.hscroll = true;
                        break;

                    case 'auto':
                        hscroll = true;
                        break;
                        
                    default:
                        box.hscroll = false;
                        break;
                }

                switch (this.overflowY())
                {
                    case 'scroll':
                        box.vscroll = true;
                        break;

                    case 'auto':
                        vscroll = true;
                        break;
                        
                    default:
                        box.vscroll = false;
                        break;
                }
            }

            auto = auto || this.fullRender();
            list = [];            

            //筛选出非隐藏控件
            if (item = this.firstChild)
            {
                do
                {
                    if (item.__visible_area = item.visible())
                    {
                        list.push(item);
                    }
                    else
                    {
                        item.boxModel = null;
                    }
                }
                while (item = item.nextSibling);
            }

            //排列
            flyingon.arrange(this, list, hscroll, vscroll);

            //计算可见控件集合
            if (auto)
            {
                this.__visible_list = list;
            }
            else
            {
                this.__compute_visible(this.scrollLeft, this.scrollTop);
            }
        }
        
        this.__arrange_dirty = false;
        return this;
    };
    

    //计算可见控件集合
    this.__compute_visible = function (x, y) {

        var list = this.__visible_list,
            box = this.boxModel,
            right = x + box.offsetWidth,
            bottom = y + box.offsetHeight,
            item = this.firstChild,
            view,
            any;

        if (list)
        {
            list.length = 0;
        }
        else
        {
            list = this.__visible_list = [];
        }

        while (item)
        {
            if (item.__visible_area = (box = item.boxModel) &&
                (any = box.offsetLeft) < right && any + box.offsetWidth > x && 
                (any = box.offsetTop) < bottom && any + box.offsetHeight > y)
            {
                list.push(item);
            }

            item = item.nextSibling;
        }

        return list;
    };



    //使用选择器查找子控件
    //注:不能超出当前控制器的查询范围
    this.find = function (selector) {

        return new flyingon.Query(selector, [this]);
    };

    

    //处理滚动
    this.__do_scroll = function (x, y) {
    
        this.__compute_visible(x, y);
        this.renderer.scroll(this, x, y);
    };
    
    
    
    //查找拖拉放置目标及位置
    this.findDropTarget = function (x, y) {
        
        var control = this.controlAt(x, y);

        if (control)
        {
            //
            
            return [this, control];
        }
        
        return [this, null];
    };
    
    
    
    //查找指定坐标的子控件
    this.controlAt = function (x, y) {
      
        if (!this.firstChild)
        {
            return this;
        }

        var layout = flyingon.getLayout(this),
            any;
        
        if ((any = this.boxModel) && (any = any.border))
        {
            x += this.scrollLeft - any.left;
            y += this.scrollTop - any.top;
        }
        
        if (any = layout.__sublayouts)
        {
            return (any = layout.controlAt(any, x, y)) ? any.controlAt(x, y) : null;
        }

        return layout.controlAt(this.__children || this.__init_children(), x, y);
    };
    
    

    //接收数据集变更动作处理
    this.ondatareceive = function (dataset, action) {
        
        var item = this.firstChild;
        
        base.ondatareceive.call(dataset, action);

        //向下派发
        while (item)
        {
            if (!item.__dataset)
            {
                item.ondatareceive(dataset, action);
            }

            item = item.nextSibling;
        }
        
        return this;
    };
    
    
    
    //使布局无效
    this.invalidate = function (content) {
        
        var target, any;

        this.__update_dirty = 2;
        this.__arrange_dirty = true;

        if (target = this.parent)
        {
            any = content && !this.__auto_size ? 1 : 2;

            if (target.__update_dirty === any)
            {
                return this;
            }

            target.__update_dirty = any;
            any = target;

            while (target = any.parent)
            {
                if (!target.__update_dirty)
                {
                    target.__update_dirty = 1;
                }

                any = target;
            }
        }
        else
        {
            any = this;
        }

        if (any.__top_control)
        {
            flyingon.__delay_update(any);
        }
        
        return this;
    };


    //更新视区
    this.update = function () {
        
        if (this.view)
        {
            switch (this.__update_dirty)
            {
                case 2:
                    this.renderer.update(this);
                    break;

                case 1:
                    this.__update_children();
                    this.__update_dirty = 0;
                    break;
            }
        }
        
        return this;
    };


    this.__update_children = function () {

        var item = this.firstChild;

        while (item)
        {
            if (item.__update_dirty)
            {
                item.update();
            }

            item = item.nextSibling;
        }
    };
    


    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.firstChild)
        {
            writer.writeProperty('children', this.children());
        }
        
        return this;
    };
    
    
    this.deserialize_children = function (reader, values) {
      
        var last, item, index;

        values = this.__children = reader.readArray(values);

        if (values && (item = values[0]))
        {
            index = 1;
            this.firstChild = last = item;

            while (item = values[index++])
            {
                item.previousSibling = last;
                last = last.nextSibling = item;
            }

            this.lastChild = last;
        }
        else
        {
            this.firstChild = this.lastChild = null;
        }
    };



    this.dispose = function () {

        var item = this.firstChild;
        
        if (item)
        {
            if (this.view)
            {
                this.renderer.clear(this);
            }

            do
            {
                item.dispose(true);
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = this.__children = null;
        }

        return base.dispose.call(this);
    };



}).alias('panel');