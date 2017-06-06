flyingon.__container_fragment = flyingon.fragment(function () {



    //控件检测不通过提醒
    var check_error = 'control is not type of ';



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



    //未挂载的视图数量
    this.__view_unmount = 0;

    
       
    
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

        var list = !this.view,
            index = 0,
            last,
            any;

        any = controls[index = 0];

        if (list !== false && any.view)
        {
            (list || (list = this.__view_history = [])).push(any);
        }

        if (last = refChild && refChild.previousSibling)
        {
            any.previousSibling = last;
        }
        else
        {
            any.previousSibling = null;
            this.firstChild = last = any;
        }

        while (any = controls[index++])
        {
            if (list !== false && any.view)
            {
                (list || (list = this.__view_history = [])).push(any);
            }

            any.previousSibling = last;
            last = last.nextSibling = any;
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
                if (control.view)
                {
                    (this.__view_history || (this.__view_history = [])).push(control);
                }
                else
                {
                    this.__view_unmount++;
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

        var previous, next;

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
            else if (control.view && this.view) //添加视图变更历史
            {
                control.previousSibling = next = control.nextSibling = null;
                (this.__view_history || (this.__view_history = [])).push(control);
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

            //清除选择器缓存
            if (flyingon.__query_cache)
            {
                flyingon.__query_clear(this);
            }

            //不销毁时添加视图变更历史, 第一个元素为0表示清除所有子项
            if (!dispose && this.view)
            {
                this.__view_history = [0];
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
                        item.renderer.update(this);
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
    


    this.serialize = function (writer) {
        
        this.base.serialize.call(this, writer);
        
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
                this.renderer.removeView(this);
            }

            do
            {
                item.dispose(true);
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = this.__children = null;
        }

        return this.base.dispose.call(this) || this;
    };



});