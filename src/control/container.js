//集合功能扩展
flyingon.fragment('f.collection', function () {



    var array = Array.prototype;



    //子控件数量
    this.length = 0;



    //获取指定子控件的索引号
    this.indexOf = this.lastIndexOf = [].indexOf;



    //添加子控件
    this.push = function () {

        this.__insert_items(arguments, 0, array.push);
        return this.length;
    };


    //弹出最后一个子控件
    this.pop = function () {
        
        var item = array.pop.call(this);

        if (item)
        {
            this.__remove_item(item);
        }

        return item;
    };


    //在开始位置插入子控件
    this.unshift = function () {

        this.__insert_items(arguments, 0, array.unshift);
        return this.length;
    };


    //弹出第一个子控件
    this.shift = function () {
        
        var item = array.shift.call(this);

        if (item)
        {
            this.__remove_item(item);
        }

        return item;
    };


    //插入及移除子控件
    this.splice = function (index, length) {

        var count = arguments.length,
            any;

        if (this.length > 0)
        {
            //只传一个参数表示清除全部
            if (count === 1)
            {
                any = array.splice.call(this, index);
                this.__remove_items(any);
            }
            else if (length > 0)
            {
                any = array.splice.call(this, index, length);
                this.__remove_items(any);
            }
        }

        if (count > 2)
        {
            arguments[1] = 0;
            this.__insert_items(arguments, 2, array.splice); 
        }

        return any || [];
    };

    
    //清除子控件
    this.clear = function () {
      
        if (this.length > 0)
        {
            this.__remove_items(array.splice.call(this, 0));
        }
        
        return this;
    };


});



//容器组件功能扩展
flyingon.fragment('f.container', function (childrenClass) {




    var array = Array.prototype;



    //子控件类
    this.childrenClass = childrenClass || flyingon.Control;



    //扩展集合功能
    flyingon.fragment('f.collection', this);



    //分离所有子控件
    this.detachAll = function () {

        if (this.length > 0)
        {
            array.splice.call(this, 0);

            this.view && this.renderer.set(this, 'detachAll');
            this.__update_dirty || this.invalidate(2);
        }
    };

    
    //获取子控件集合
    this.children = function () {

        return array.slice.call(this, 0);
    };



    //插入多个子项
    this.__insert_items = function (items, index, fn) {

        var length = items.length;

        if (length <= 0)
        {
            return;
        }

        var Class = this.childrenClass,
            html = this instanceof flyingon.HtmlElement,
            patch = this.__content_render && !this.__insert_patch,
            item,
            any;

        while (index < length)
        {
            item = items[index];

            if (item.__flyingon_class)
            {
                if (item instanceof Class)
                {
                    if (any = item.parent)
                    {
                        any.__remove_item(item);
                    }
                }
                else
                {
                    this.__check_error(Class);
                }
            }
            else if ((item = flyingon.ui(item, Class)) instanceof Class)
            {
                items[index] = item;
            }
            else
            {
                this.__check_error(Class);
            }

            item.parent = this;

            if ((item.__as_html = html) && item.__location_dirty &&
                (!(any = item.__view_patch) || !any.__location_patch))
            {
                item.renderer.set(item, '__location_patch');
            }

            if (any = item.onparentchange)
            {
                any.call(item, this);
            }

            //添加子项补丁
            if (patch)
            {
                patch = false;

                this.__insert_patch = true;
                this.renderer.__children_dirty(this);
            }

            index++;
        }

        any = fn.apply(this, items);

        this.__update_dirty || this.invalidate(2);

        return any;
    };



    this.__check_error = function (Class) {

        throw '"' + this.Class.fullName + '" type can push "' + Class.fullName + '" type only!';
    };



    //移除多个子项
    this.__remove_items = function (items) {

        var patch = this.__remove_patch,
            item,
            any;

        for (var i = items.length - 1; i >= 0; i--)
        {
            if (item = items[i])
            {
                item.parent = null;

                if (any = item.onparentchange)
                {
                    any.call(item, this);
                }

                if (patch)
                {
                    patch.push(item);
                }
                else
                {
                    this.__remove_patch = patch = [item];
                    this.renderer.__children_dirty(this);
                }
            }
        }

        this.__update_dirty || this.invalidate(2);
    };


    //移除子项
    this.__remove_item = function (item) {

        var patch = this.__remove_patch;

        item.parent = null;

        if (patch = item.onparentchange)
        {
            patch.call(item, null);
        }

        if (patch)
        {
            patch.push(item);
        }
        else
        {
            this.__remove_patch = patch = [item];
            this.renderer.__children_dirty(this);
        }

        this.__update_dirty || this.invalidate(2);
    };

    


    //使用选择器查找子控件
    this.find = function (selector) {

        return new flyingon.Query(selector, [this]);
    };


    //查找指定id的子控件
    this.findById = function (id, deep) {

        var query = flyingon.create(flyingon.Query.prototype),
            list;

        if (id)
        {
            list = flyingon.__find_id(deep !== false ? this.all() : this, id);
            list.push.apply(query, list);
        }

        return query;
    };


    //查找指定类型的子控件
    this.findByType = function (name, deep) {

        var query = flyingon.create(flyingon.Query.prototype),
            list;

        if (name)
        {
            list = flyingon.__find_type(deep !== false ? this.all() : this, name);
            list.push.apply(query, list);
        }

        return query;
    };


    //查找指定class的子控件
    this.findByClass = function (name, deep) {

        var query = flyingon.create(flyingon.Query.prototype),
            list;

        if (name)
        {
            list = flyingon.__find_class(deep !== false ? this.all() : this, name);
            list.push.apply(query, list);
        }

        return query;
    };


    //获取所有子控件
    this.all = function () {

        return this.__all || (this.__all = all(this, []));
    };


    function all(self, list) {

        var item, any;

        for (var i = 0, l = self.length; i < l; i++)
        {
            if (item = self[i])
            {
                list.push(item);

                if (any = item.all)
                {
                    list.push.apply(list, any.call(item));
                }
            }
        }

        return list;
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
    this.subscribeBind = function (dataset, action) {
        
        var item;
        
        this.base.subscribeBind.call(this, dataset, action);

        //向下派发
        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((item = this[i]) && !item.__dataset)
            {
                item.subscribeBind(dataset, action);
            }
        }
        
        return this;
    };
    

    
    //是否需要排列
    this.__arrange_dirty = 2;

    
    
    //使布局无效
    this.invalidate = function () {
        
        var target, any;

        //清除查找缓存
        if (arguments[0] === 2 && (any = this.__all))
        {
            this.__all = null;

            while (any = any.parent)
            {
                any.__all = null;
            }
        }

        this.__update_dirty = true;
        this.__arrange_dirty = 2;

        if (target = this.parent)
        {
            if (target.__arrange_dirty > 1)
            {
                return this;
            }

            target.__arrange_dirty = 2;
            any = target;

            while (target = any.parent)
            {
                if (!target.__arrange_dirty)
                {
                    target.__arrange_dirty = 1;
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

            switch (this.__arrange_dirty)
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

        var item;

        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((item = this[i]) && item.view)
            {
                switch (item.__arrange_dirty)
                {
                    case 2:
                        item.renderer.update(item);
                        break;

                    case 1:
                        item.__update_children();
                        break;
                }
            }
        }

        this.__arrange_dirty = 0;
    };
    

  
    
    this.deserialize_children = function (reader, values) {
      
        if (typeof values === 'function')
        {
            var any = [];

            values(any); //values(values = []); 在IE7下会出错
            values = any;
        }

        this.push.apply(this, reader.readArray(values, this.childrenClass));
    };



});