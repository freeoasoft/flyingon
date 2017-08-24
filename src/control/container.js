//集合功能扩展
flyingon.fragment('f-container', function (childrenClass, arrange) {



    if (childrenClass === true)
    {
        childrenClass = null;
        arrange = true;
    }


    //子控件类
    this.childrenClass = childrenClass || flyingon.Control;


    //是否需要排列
    this.__arrange_dirty = 2;

    

    flyingon.fragment('f-collection', this);


    this.__check_error = function (Class) {

        throw '"' + this.Class.fullName + '" type can push "' + Class.fullName + '" type only!';
    };

  

    //分离子控件(不销毁)
    this.detach = function (index, length) {

        var items = this.splice.apply(this, arguments),
            length = items.length,
            item;

        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (item = items[i])
                {
                    item.autoDispose = false;
                }
            }
        }

        return items;
    };


    //添加子项前检测处理
    this.__check_items = function (index, items, start) {

        var Class = this.childrenClass,
            html = this instanceof flyingon.HtmlElement,
            patch = this.__content_render && [],
            length = items.length,
            item,
            any;

        while (start < length)
        {
            item = items[start];

            if (item.__flyingon_class)
            {
                if (item instanceof Class)
                {
                    if ((any = item.parent) && any !== this)
                    {
                        any.__remove_items(any.indexOf(item), [item]);
                    }
                }
                else
                {
                    this.__check_error(Class);
                }
            }
            else if ((item = this.__create_child(item, Class)) instanceof Class)
            {
                items[start] = item;
            }
            else
            {
                this.__check_error(Class);
            }

            item.parent = this;
            item.__as_html = html;

            if (patch)
            {
                patch.push(item);
            }

            start++;
        }

        this.__all && this.__clear_all();

        if (patch && patch[0])
        {
            this.__children_dirty(1, index, patch);
        }

        if (arrange && this.__arrange_dirty < 2)
        {
            this.__arrange_delay(2);
        }
    };


    //创建控件方法
    this.__create_child = flyingon.ui;


    //移除多个子项
    this.__remove_items = function (index, items) {

        var patch = [],
            item;

        this.__all && this.__clear_all();

        for (var i = items.length - 1; i >= 0; i--)
        {
            if (item = items[i])
            {
                item.parent = null;
                item.autoDispose = true;

                patch.push(item);
            }
        }

        //注册子项变更补丁
        if (patch[0])
        {
            this.__children_dirty(2, -1, patch);
        }

        if (arrange && this.__arrange_dirty < 2)
        {
            this.__arrange_delay(2);
        }
    };


    //注册子项变更补丁
    this.__children_dirty = function (type, index, items) {

        var patch = this.__children_patch;

        if (patch)
        {
            var any = patch.length - 3;

            //相同类型进行合并处理
            if (type === patch[any++] && patch[any++] === index)
            {
                any = patch[any + 1];
                any.apply(any, items);
            }
            else
            {
                patch.push(type, index, items);
            }
        }
        else
        {
            this.__children_patch = [type, index, items];
            this.renderer.__children_dirty(this);
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