flyingon.defineClass('Panel', flyingon.Control, function (base) {




    //控件检测不通过提醒
    var check_error = 'control is not type of ';



    //允许添加的子控件类型
    this.childControlType = flyingon.Control;
    
    
    //重写默认宽度
    this.defaultWidth = 400;
    
    //重写默认高度
    this.defaultHeight = 300;

        

    //排列区域
    this.arrangeLeft = this.arrangeTop = this.arrangeRight = this.arrangeBottom = this.arrangeWidth = this.arrangeHeight = 0;



    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);


    this.defaultValue('overflowX', 'auto');


    this.defaultValue('overflowY', 'auto');



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
    


    
    //第一个子控件
    this.firstChild = null;


    //最后一个子控件
    this.lastChild = null;


       
    
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



    function check_array(self, controls, type) {

        var index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if (item instanceof type)
            {
                if (any = item.parent)
                {
                    any.removeChild(item, false);
                }

                item.parent = self;
            }
            else
            {
                throw check_error + type.xtype;
            }
        }
    };


    //插入多个控件
    function insert_array(controls, refChild) {

        var view = this.view,
            index = 0,
            last = refChild && refChild.previousSibling || null,
            item,
            any;

        if (!last)
        {
            this.firstChild = controls[0];
        }

        while (item = controls[index++])
        {
            if (view)
            {
                //添加增加视图补丁
                if (any = this.__insert_patch)
                {
                    if (item.view)
                    {
                        any.push(item);
                    }
                    else
                    {
                        any[0]++;
                    }
                }
                else
                {
                    this.__insert_patch = item.view ? [0, item] : [1];
                    this.renderer.set(this, '__insert_patch', true);
                }
            }

            item.previousSibling = last;

            last && (last.nextSibling = item);
            last = item;
        }

        if (refChild)
        {
            last.nextSibling = refChild;
            refChild.previousSibling = last;
        }
        else
        {
            this.lastChild = last;
        }
    };

        
    //添加子控件
    this.appendChild = function (controls) {

        return this.insertBefore(controls);
    };


    //在指定的位置插入子控件
    this.insertAt = function (controls, index) {

        return this.insertBefore(controls, this.at(index));
    };
    
    
    //在指定子控件前插入子控件
    this.insertBefore = function (controls, refChild) {

        var type = this.childControlType,
            control,
            any;

        if (controls instanceof Array)
        {
            if (controls.length > 1)
            {
                check_array(this, controls, type);
            }
            else
            {
                control = controls[0];
            }
        }
        else 
        {
            control = controls;
        }
        
        if (control)
        {
            if (control instanceof type)
            {
                if (any = control.parent)
                {
                    any.removeChild(control, false);
                }

                control.parent = this;
            }
            else
            {
                throw check_error + type.xtype;
            }
        }

        //清空子视图缓存集合
        this.__children = null;

        //清除选择器缓存
        if (flyingon.__query_cache)
        {
            flyingon.__query_clear(this);
        }

        if (refChild && refChild.parent !== this)
        {
            refChild = null;
        }

        if (control)
        {
            if (refChild) //处理组件关系
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

            if (this.view)
            {
                //添加增加视图补丁
                if (any = this.__insert_patch)
                {
                    if (control.view)
                    {
                        any.push(control);
                    }
                    else
                    {
                        any[0]++;
                    }
                }
                else
                {
                    this.__insert_patch = control.view ? [0, control] : [1];
                    this.renderer.set(this, '__insert_patch', true);
                }
            }
        }
        else
        {
            insert_array.call(this, controls, refChild);
        }

        if (this.__update_dirty < 2)
        {
            this.invalidate(true);
        }

        return this;
    };


    //移除指定子控件
    this.removeChild = function (control, dispose) {

        var previous, next, any;

        if (control && control.parent === this)
        {
            //清除选择器缓存
            if (flyingon.__query_cache)
            {
                flyingon.__query_clear(this);
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
            else
            {
                control.previousSibling = next = control.nextSibling = null;

                //添加移除视图补丁
                if (control.view && this.view) 
                {
                    if (any = this.__remove_patch)
                    {
                        any.push(control);
                    }
                    else
                    {
                        this.renderer.set(this, '__remove_patch', this.__remove_patch = [control]);
                    }
                }
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
      
        var item = this.firstChild,
            any;
        
        if (item)
        {
            dispose = dispose !== false;

            //清除选择器缓存
            if (flyingon.__query_cache)
            {
                flyingon.__query_clear(this);
            }

            //不销毁时添加视图清除补丁, 第一个元素为0表示清除所有子项
            if (!dispose && this.view)
            {
                if (any = this.__remove_patch)
                {
                    any.length = 1;
                    any[0] = 0;
                }
                else
                {
                    this.renderer.set(this, '__remove_patch', this.__remove_patch = [0]);
                }

                //如果之前有插入的视图补丁则清除
                this.__insert_patch = null;
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

               


    //使用选择器查找子控件
    //注:不能超出当前控制器的查询范围
    this.find = function (selector) {

        return new flyingon.Query(selector, [this]);
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
      
        return this;
    };
    
    

    //接收数据集变更动作处理
    this.ondatareceive = function (dataset, action) {
        
        var item = this.firstChild;
        
        this.base.ondatareceive.call(dataset, action);

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
    

    
    //是否需要排列
    this.__arrange_dirty = true;
    
    
    //使布局无效
    this.invalidate = function (content) {
        
        var target, any;

        this.__update_dirty = 2;
        this.__arrange_dirty = true;

        if (target = this.parent)
        {
            any = content && !this.$$auto ? 1 : 2;

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
            flyingon.__update_patch();

            switch (this.__update_dirty)
            {
                case 2:
                    this.renderer.update(this);
                    break;

                case 1:
                    this.__update_children();
                    break;
            }
        }
        
        return this;
    };


    this.__update_children = function () {

        var item = this.firstChild;

        while (item)
        {
            if (item.view)
            {
                switch (item.__update_dirty)
                {
                    case 2:
                        item.renderer.update(item);
                        break;

                    case 1:
                        item.__update_children();
                        break;
                }
            }

            item = item.nextSibling;
        }

        this.__update_dirty = 0;
    };
    

              

    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.renderer.update(this);

            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.borderLeft + this.borderRight;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.arrangeBottom + this.borderTop + this.borderBottom;
            }
        }
        else
        {
            return false;
        }
    };
    
        
    
    //查找指定坐标的子控件
    this.controlAt = function (x, y) {
      
        if (!this.firstChild)
        {
            return this;
        }

        var layout = flyingon.getLayout(this),
            any;
    
        x += this.scrollLeft - this.borderLeft;
        y += this.scrollTop - this.borderTop;

        if (any = layout.__sublayouts)
        {
            return (any = layout.controlAt(any, x, y)) ? any.controlAt(x, y) : null;
        }

        return layout.controlAt(this.__children || this.__init_children(), x, y);
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
                this.renderer.unmount(this);
            }

            do
            {
                item.dispose(true);
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = this.__children = null;
        }

        return base.dispose.call(this) || this;
    };


 

}).register('panel');