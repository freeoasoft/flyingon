//集合功能扩展
flyingon.fragment('f.collection', function () {



    var array = Array.prototype;



    //子控件数量
    this.length = 0;



    //获取指定子控件的索引号
    this.indexOf = this.lastIndexOf = [].indexOf;



    //添加子控件
    this.push = function () {

        if (arguments.length > 0)
        {
            this.__insert_items(arguments, 0, array.push);
        }

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

        if (arguments.length > 0)
        {
            this.__insert_items(arguments, 0, array.unshift);
        }

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

    
    //分离所有子控件
    this.detachAll = function () {

        if (this.length > 0)
        {
            Array.prototype.splice.call(this, 0);
            this.view && this.renderer.set(this, 'detachAll');
        }
    };


    
    //获取子控件集合
    this.children = function () {

        return array.slice.call(this, 0);
    };



    //添加多个子项
    this.__insert_items = function (items, index, fn) {

        return fn.apply(this, items);
    };


    //移除多个子项
    this.__remove_items = function (items) {
    };


    //移除子项
    this.__remove_item = function (item) {
    };


});



//集合功能扩展
flyingon.fragment('f.container', function (childrenClass, arrange) {



    if (childrenClass === true)
    {
        childrenClass = null;
        arrange = true;
    }


    //子控件类
    this.childrenClass = childrenClass || flyingon.Control;


    //是否需要排列
    this.__arrange_dirty = 2;

    

    flyingon.fragment('f.collection', this);


    this.__check_error = function (Class) {

        throw '"' + this.Class.fullName + '" type can push "' + Class.fullName + '" type only!';
    };

  

    //添加多个子项
    this.__insert_items = function (items, index, fn) {

        var Class = this.childrenClass,
            length = items.length,
            item,
            any;

        this.__all && this.__clear_all();

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
            index++;
        }

        if (this.__content_render && !this.__insert_patch)
        {
            this.__insert_patch = true;
            this.renderer.__children_dirty(this);
        }

        if (arrange && this.__arrange_dirty < 2)
        {
            this.__arrange_delay(2);
        }

        return fn.apply(this, items);
    };


    //移除多个子项
    this.__remove_items = function (items) {

        var patch = this.__remove_patch,
            item;

        this.__all && this.__clear_all();

        for (var i = items.length - 1; i >= 0; i--)
        {
            if (item = items[i])
            {
                item.parent = null;

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
        
        if (arrange && this.__arrange_dirty < 2)
        {
            this.__arrange_delay(2);
        }
    };


    //移除子项
    this.__remove_item = function (item) {

        var patch = this.__remove_patch;

        this.__all && this.__clear_all();

        item.parent = null;

        if (patch)
        {
            patch.push(item);
        }
        else
        {
            this.__remove_patch = patch = [item];
            this.renderer.__children_dirty(this);
        }

        if (arrange && this.__arrange_dirty < 2)
        {
            this.__arrange_delay(2);
        }
    };


    //清除all缓存
    this.__clear_all = function () {

        var any = this.parent;

        this.__all = null;

        while (any && any.__all)
        {
            any.__all = null;
            any = any.parent;
        }
    };



    //使用选择器查找子控件
    this.find = function (selector) {

        return new flyingon.Query(selector, [this]);
    };


    //查找指定id的子控件
    this.findById = function (id, deep) {

        var query = new flyingon.Query(),
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

        var query = new flyingon.Query(),
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

        var query = new flyingon.Query(),
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
        
        var control = this.findAt(x, y);

        if (control)
        {
            //
            
            return [this, control];
        }
        
        return [this, null];
    };
    
    
    
    //查找指定坐标的子控件
    this.findAt = function (x, y) {
      
        return this;
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


});