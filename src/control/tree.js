Object.extend('TreeNode', function () {



    //扩展可视组件功能
    flyingon.fragment('f.visual', this);



    //标记是树节点
    this.isTreeNode = true;


    //选中的子项数量
    this.checkedChildren = 0;



    function define(self, name, defaltValue) {

        return self.defineProperty(name, defaltValue, {

            set: function (value) {

                this.hasRender && this.renderer.set(this, name, value);
            }
        });
    };


    //节点图标
    define(this, 'icon', '');


    //节点文本
    define(this, 'text', '');


    //是否禁用
    define(this, 'disabled', false);


    //是否选中
    this.defineProperty('checked', false, {
        
        set: function (value) {

            var parent = this.parent;

            while (parent && parent.isTreeNode)
            {
                if (!(value ? parent.checkedChildren++ : --parent.checkedChildren) && 
                    parent.view && !parent.checked())
                {
                    parent.renderer.set(parent, 'checked', false);
                }

                parent = parent.parent;
            }

            this.hasRender && this.renderer.set(this, 'checked', value);
            this.trigger('checked-change', 'value', value);
        }
    });


    //是否收拢
    this.defineProperty('collapsed', true, {

        set: function (value) {

            if (this.view)
            {
                value ? this.collapse(false) : this.expand(false, false);
            }
        }
    });


    //是否启用延时加载
    this.defineProperty('delay', false);



    this.load = function (options) {

        var storage = this.__storage || (this.__storage = flyingon.create(this.__defaults));

        for (var name in options)
        {
            switch (name)
            {
                case 'checked':
                case 'collapsed':
                    storage[name] = !!options[name];
                    break;

                case 'children':
                case 'items':
                    this.push.apply(this, options[name]);
                    break;

                default:
                    storage[name] = '' + options[name];
                    break;
            }
        }

        return this;
    };



    //扩展容器功能
    flyingon.fragment('f.container', this, flyingon.TreeNode);



    //重写插入子节点方法
    this.__insert_items = function (items, index, fn) {

        var Class = flyingon.TreeNode,
            render = this.hasRender,
            length = items.length,
            item,
            any;

        this.__all && this.__clear_all();
        
        while (index < length)
        {
            if ((item = items[index]) instanceof Class)
            {
                if (any = item.parent)
                {
                    any.__remove_item(item);
                }
            }
            else
            {
                items[index] = item = new Class().load(item);
            }

            item.parent = this;

            if (item.__storage.checked)
            {
                any = this;

                while (any && any.isTreeNode)
                {
                    any.checkedChildren++;
                    any = any.parent;
                }
            }

            //添加子项补丁
            if (render)
            {
                render = false;

                if (any = this.__children_patch)
                {
                    any[1] = 1;
                }
                else
                {
                    this.renderer.set(this, '__children_patch', this.__children_patch = [0, 1]);
                }
            }

            index++;
        }

        return fn.apply(this, items);
    };


    //获取节点级别
    this.level = function () {

        var Class = flyingon.TreeNode,
            target = this,
            index = -1;

        while ((target = target.parent) instanceof Class)
        {
            index++;
        }

        return index;
    };



    //展开节点
    this.expand = function (deep) {

        var check = arguments[1] !== false;

        if ((!check || this.collapsed()) && this.trigger('before-expand') !== false)
        {
            if (check)
            {
                this.collapsed(false);
            }

            this.trigger('after-expand');

            if (deep)
            {
                for (var i = 0, l = this.length; i < l; i++)
                {
                    this[i].expand(true, true, false);
                }
            }

            if (this.hasRender && arguments[2] !== false)
            {
                this.renderer.expand(this);
            }
        }
        else if (!check)
        {
            this.__storage.collapsed = true;
        }

        return this;
    };


    //收拢节点
    this.collapse = function () {

        var check = arguments[0] !== false;

        if (!(check && this.collapsed()) && this.trigger('before-collapse') !== false)
        {
            if (check)
            {
                this.collapsed(true);
            }

            this.trigger('after-collapse');

            this.hasRender && this.renderer.collapse(this);
        }
        else if (!check)
        {
            this.__storage.collapsed = false;
        }

        return this;
    };



}).register();




flyingon.Control.extend('Tree', function (base) {



    this.defaultValue('border', 1);
    

    this.defaultValue('padding', 2);



    function define(self, name, defaltValue) {

        return self.defineProperty(name, defaltValue, {

            set: function (value) {

                this.hasRender && this.renderer.set(this, name, value);
            }
        });
    };


    //树风格
    //default   默认风格
    //blue      蓝色风格
    //plus      加减风格
    //line      线条风格
    define(this, 'theme', 'default');



    //是否显示检查框
    define(this, 'checked', false);


    //是否显示图标
    define(this, 'icon', true);


    //是否可编辑
    this.defineProperty('editable', false);


    //格式化函数
    this.format = null;



    //扩展容器功能
    flyingon.fragment('f.container', this, flyingon.TreeNode);


    //重写插入子节点方法
    this.__insert_items = flyingon.TreeNode.init().prototype.__insert_items;



    this.expand = function (deep) {

        for (var i = 0, l = this.length; i < l; i++)
        {
            this[i].expand(deep);
        }

        return this;
    };


    this.collapse = function () {

        for (var i = 0, l = this.length; i < l; i++)
        {
            this[i].collapse();
        }

        return this;
    };



    this.beginEdit = function () {

    };


    this.endEdit = function () {

    };



    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            this[i].dispose(false);
        }

        base.dispose.apply(this, arguments);
        return this;
    };



}).register();