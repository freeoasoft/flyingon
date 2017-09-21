Object.extend('TreeNode', function () {



    //扩展可视组件功能
    flyingon.fragment('f-visual', this);



    //标记是树节点
    this.isTreeNode = true;


    //是否展开
    this.expanded = false;


    //选中的子项数量
    this.checkedChildren = 0;
    


    function define(self, name, defaltValue) {

        return self.defineProperty(name, defaltValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
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

            this.rendered && this.renderer.set(this, 'checked', value);
            this.trigger('checked-change', 'value', value);
        }
    });



    //是否启用延时加载
    this.defineProperty('delay', false);



    //扩展容器功能
    flyingon.fragment('f-container', this, null, flyingon.TreeNode);


    //创建子控件
    this.__create_child = function (options, Class) {

        var node = new Class(),
            storage = node.__storage || (node.__storage = flyingon.create(node.__defaults));

        for (var name in options)
        {
            switch (name)
            {
                case 'text':
                case 'icon':
                    storage[name] = '' + options[name];
                    break;

                case 'checked':
                    storage[name] = !!options[name];
                    break;

                case 'expanded':
                    if (options[name])
                    {
                        node.expanded = true;
                    }
                    break;

                case 'children':
                case 'items':
                    node.push.apply(node, options[name]);
                    break;

                default:
                    storage[name] = options[name];
                    break;
            }
        }

        return node;
    };


    //获取节点级别
    this.level = function () {

        var target = this.parent,
            index = 0;

        while (target && target.isTreeNode)
        {
            index++;
            target = target.parent;
        }

        return index;
    };



}).register();




flyingon.Control.extend('Tree', function (base) {



    this.defaultWidth = 200;
    
    this.defaultHeight = 300;

        
    this.defaultValue('border', 1);
    

    this.defaultValue('padding', 2);



    function define(self, name, defaltValue) {

        return self.defineProperty(name, defaltValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
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
    flyingon.fragment('f-container', this, base, flyingon.TreeNode.init());


    this.__create_child = flyingon.TreeNode.prototype.__create_child;



    //展开节点
    this.expand = function (node) {

        if (node)
        {
            this.__expand_node(node);
        }
        else
        {
            for (var i = 0, l = this.length; i < l; i++)
            {
                this.__expand_node(this[i]);
            }
        }

        return this;
    };


    this.__expand_node = function (node) {

        if (!node.expanded && this.trigger('expand', 'node', node) !== false)
        {
            node.expanded = true;
            node.rendered && node.renderer.set(node, 'expand');
        }
    };


    //展开节点至指定级别
    this.expandTo = function (node, level) {

        if (arguments.length < 2)
        {
            level = node;
            node = null;
        }

        this.__expand_to(node || this, level | 0);
        return this;
    };


    this.__expand_to = function (nodes, level) {

        level--;

        for (var i = nodes.length - 1; i >= 0; i--)
        {
            var node = nodes[i];

            if (!node.expanded)
            {
                if (this.trigger('expand', 'node', node) === false)
                {
                    continue;
                }

                node.expanded = true;
                node.rendered && node.renderer.set(node, 'expand');
            }

            if (node.length > 0)
            {
                if (level)
                {
                    this.__expand_to(node, level);
                }
                else
                {
                    //收拢最后一级
                    for (var j = node.length - 1; j >= 0; j--)
                    {
                        var item = node[j];

                        if (item.expanded && this.trigger('collapse', 'node', node) !== false)
                        {
                            item.expanded = false;
                            item.rendered && item.renderer.set(item, 'collapse');
                        }
                    }
                }
            }
        }
    };


    //收拢节点
    this.collapse = function (node) {

        if (node)
        {
            this.__collapse_node(node);
        }
        else
        {
            for (var i = 0, l = this.length; i < l; i++)
            {
                this.__collapse_node(this[i]);
            }
        }

        return this;
    };


    //收拢节点
    this.__collapse_node = function (node) {

        if (node.expanded && node.length > 0 && this.trigger('collapse', 'node', node) !== false)
        {
            node.expanded = false;
            node.rendered && node.renderer.set(node, 'collapse');
        }
    };



    this.beginEdit = function () {

    };


    this.endEdit = function () {

    };


    this.findNode = function (fn) {

        if (typeof fn === 'function')
        {
            return find(this, fn);
        }
    };


    function find(nodes, fn) {

        for (var i = 0, l = nodes.length; i < l; i++)
        {
            var node = nodes[i];

            if (fn(node))
            {
                return node;
            }

            if (node.length > 0 && (node = find(node, fn)))
            {
                return node;
            }
        }
    };


    this.current = function (node) {

        var any = this.__current;
        
        if (any)
        {
            any.__current = false;
        }

        if (this.__current = node)
        {
            node.__current = true;
        }

        if (this.rendered)
        {
            any && any.renderer.current(any, false);
            node && node.renderer.current(node, true);
        }
    };


    this.scrollTo = function (node) {

        this.rendered && this.renderer.scrollTo(this, node);
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