
/*


本系统选择器从按照左到右的顺序解析, 请注意相关性能


本系统支持的基础选择器如下(注:本系统不支持html标签选择器):

*                       通用控件选择器
.N                      class选择器
#N                      id选择器
N                       类型选择器


本系统支持的组合选择器如下:

A,B                     或者选择器
A B                     后代选择器
A>B                     子选择器
A+B                     毗邻选择器
A~B                     后续兄弟选择器
AB                      并且选择器


本系统支持的属性选择器如下:

[name]                  具有name属性的控件
[name=value]            name属性值等于value的控件
[name~=value]           name属性值有多个空格分隔,其中一个值等于value的控件
[name|=value]           name属性值有多个连字号分隔(hyphen-separated)的值,其中一个值以value开头的控件, 主要用于lang属性, 比如en,en-us,en-gb等等
[name^=value]           name属性值以value开头的控件
[name$=value]           name属性值以value结尾的控件
[name*=value]           name属性值包含value的控件


本系统支持的伪类控件如下:

:focus                  控件有焦点
:enabled                控件可用
:disabled               控件被禁用
:checked                控件已选中

:has(selector)          控件下属子控件包含选择器selector规定的控件
:not(selector)          控件下属子控件不包含选择器selector规定的控件

:empty                  控件不包含任何子控件

:only                   控件是父控件中的唯一子控件
:first                  控件是父控件中的第一个子控件
:last                   控件是父控件中的最后一个子控件
:odd                    控件在父控件中的索引号是单数, 索引从0开始
:even                   控件在父控件中的索引号是双数, 索引从0开始
:eq(n)                  控件在父控件中的索引号等于n, n<0表示倒序, 索引从0开始
:gt(n)                  控件在父控件中的索引号大于n, 索引从0开始
:lt(n)                  控件在父控件中的索引号小于n, 索引从0开始


本系统不支持css伪类及伪元素


*/



//解析选择器
(function () {
        
    
    
    //解析缓存
    var parse_cache = flyingon.create(null);
    
    

    //解析选择器
    function parse(tokens, index) {

        var Class = flyingon.Selector_node,
            relation = ' ',
            nodes, 
            node, 
            token;

        while (token = tokens[index++])
        {
            //switch代码在chrome下的效率没有IE9好,不知道什么原因,有可能是其操作非合法变量名的时候性能太差
            switch (token)
            {
                case '#':   //id选择器标记
                case '.':   //class选择器标记
                    node = new Class(relation, token, tokens[index++], node);
                    relation = '';
                    break;

                case '*':  //全部元素选择器标记
                    node = new Class(relation, '*', '*', node);
                    relation = '';
                    break;

                case ' ':  //后代选择器标记
                case '\t':
                    if (!relation) //忽略其它类型后的空格
                    {
                        relation = ' ';
                    }
                    break;

                case '>':  //子元素选择器标记
                case '+':  //毗邻元素选择器标记
                case '~':  //之后同级元素选择器标记
                    relation = token;
                    break;

                case ',':  //组合选择器标记
                    if (node)
                    {
                        nodes = nodes || new flyingon.Selector_nodes();
                        nodes[nodes.length++] = node.top;
                    }

                    node = null;
                    relation = ' ';
                    break;

                case '[': //属性 [name[?="value"]]
                    if (!node || relation) //未指定节点则默认添加*节点
                    {
                        node = new Class(relation, '*', '*', node);
                        relation = '';
                    }

                    index = parse_property(node, tokens, index);
                    break;

                case ':': //伪类
                    if (!node || relation) //未指定节点则默认添加*节点
                    {
                        node = new Class(relation, '*', '*', node);
                        relation = '';
                    }

                    token = new flyingon.Selector_pseudo(node, tokens[index++]);
                    
                    //处理参数
                    if (tokens[index] === '(')
                    {
                        index = parse_pseudo(token, tokens, ++index);
                    }
                    break;

                default: //类名 token = ""
                    node = new Class(relation, '', token.replace(/-/g, '.'), node);
                    relation = '';
                    break;
            }
        }
        
        if (nodes)
        {
            if (node)
            {
                nodes[nodes.length++] = node.top;
            }
            
            return nodes;
        }

        return node && node.top || node;
    };


    //解析属性
    function parse_property(node, tokens, index) {

        var target, token, any;

        while (token = tokens[index++])
        {
            switch (token)
            {
                case ']':
                    return index;

                case '*': // *= 包含属性值XX
                case '^': // ^= 属性值以XX开头
                case '$': // $= 属性值以XX结尾
                case '~': // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en
                case '|': // |= 匹配以-分隔的其中一段值 如匹配en-US中的en
                    if (target)
                    {
                        target.relation = token;
                    }
                    break;

                case '=':
                    if (target)
                    {
                        target.relation += '=';
                    }
                    break;

                case ' ':
                case '\t':
                    break;

                default:
                    if (target)
                    {
                        switch (token)
                        {
                            case 'undefined':
                                token = undefined;
                                break;
                                
                            case 'null':
                                token = null;
                                break;
                                
                            case 'true':
                                token = true;
                                break;
                                
                            case 'false':
                                token = false;
                                break;
                                
                            default:
                                if ((any = token.charAt(0)) === '"' || any === "'")
                                {
                                    token = token.substring(1, token.length - 1);
                                }
                                else
                                {
                                    token = +token;
                                }
                                break;
                        }
                        
                        target.value = token;
                    }
                    else
                    {
                        target = new flyingon.Selector_property(node, token);
                    }
                    break;
            }
        }

        return index;
    };
    

    //解析伪类参数
    function parse_pseudo(target, tokens, index) {

        var start = index,
            flag = 1,
            any;
        
        while (flag && (any = tokens[index++]))
        {
            switch (any)
            {
                case '(':
                    flag++;
                    break;
                    
                case ')':
                    flag--;
                    break;
            }
        }
        
        any = tokens.slice(start, index - 1).join('');

        switch (target.name)
        {
            case 'eq':
            case 'gt':
            case 'lt':
                any |= 0;
                break;
        }
        
        target.value = any;
        return index;
    };
    
        
    //创建解析选择器方法
    flyingon.__parse_selector = function (selector, cache) {

        if (!selector || typeof selector !== 'string')
        {
            return null;
        }
        
        if (cache !== false && (cache = parse_cache[selector]))
        {
            return cache;
        }
        
        cache = selector.match(/"[^"]*"|'[^']*'|[\w-]+|[*.#\[\]:(), \t>+~=|^$]/g);
        return parse_cache[selector] = parse(cache, 0);
    };

    
})();



//选择器节点类
flyingon.Selector_node = flyingon.defineClass(function () {
    
    

    //id选择器缓存集合
    var id_query;

    //class选择器缓存集合
    var class_query;

    //类型选择器缓存集合
    var type_query;



    this.constructor = function (relation, type, name, node) {
       
        this.find = this[this.relation = relation];
        this.filter = this[this.type = type];
        this.name = name;
        
        if (node)
        {
            if (relation)
            {
                node.next = this;
            }
            else
            {
                node[node.length++] = this;
            }
            
            this.top = node.top || node;
        }
        else
        {
            this.top = this;
        }
    };
    
    
        
    //关系符
    this.relation = '';
    
    
    //节点类型
    this.type = '';
    
    
    //节点名称
    this.name = '';
    
    
    //子项数
    this.length = 0;
    
    
    //下一节点
    this.next = null;
    
    
    
    //选择节点
    this.select = function (controls) {
        
        var index, any;
        
        controls = this.find(controls);

        if (controls[0])
        {
            index = 0;

            while (any = this[index++])
            {
                controls = any.filter(controls);
            }

            if (controls[0] && (any = this.next))
            {
                controls = any.select(controls);
            }
        }

        return controls;
    };
    
    
    //检查控件是否符合选择器要求
    this.check = function (controls) {
    
        var index = 0,
            any;
        
        while (any = this[index++])
        {
            if (!(controls = any.filter(controls, [])).length)
            {
                return controls;
            }
        }

        return (any = this.next) ? any.find(controls) : controls;
    };
    
    
    
    this[''] = function (controls, cache) {

        var type = this.__type || (this.__type = flyingon.components[this.name]);

        if (type)
        {
            var exports = [],
                index = 0,
                length = 0,
                item;
            
            while (item = controls[index++])
            {
                if (item instanceof type)
                {
                    exports[length++] = item;
                }
            }
            
            return exports;
        }

        return controls;
    };
    
        
    this['*'] = function (controls, cache) {

        return controls;
    };
    
    
    this['.'] = function (controls, cache) {

        var name = this.name;;

        if (name)
        {
            var exports = [],
                index = 0,
                length = 0,
                item,
                any;
            
            while (item = controls[index++])
            {
                if ((any = item.__class_list) && any[name])
                {
                    exports[length++] = item;
                }
            }
            
            return exports;
        }

        return controls;
    };
    

    this['#'] = function (controls, cache) {

        var name = this.name;;

        if (name)
        {
            var exports = [],
                index = 0,
                length = 0,
                item,
                any;
            
            while (item = controls[index++])
            {
                if ((any = item.__storage) && any.id === name)
                {
                    exports[length++] = item;
                }
            }
            
            return exports;
        }

        return controls;
    };
    
    
    
    //后代选择器
    this[' '] = function (controls) {
        
        var cache = type_query,
            index = 0,
            exports,
            item,
            any;
        
        if (cache)
        {
            cache = (any = cache['*']) || (cache['*'] = {});
        }
        else
        {
            cache = (type_query = flyingon.__type_query_cache = {})['*'] = {};
        }

        if (controls.length > 1)
        {
            controls = remove_child(controls);
        }

        while (item = controls[index++])
        {
            any = item.__uniqueId || item.uniqueId();
            any = cache[any] || (cache[any] = (any = item.firstChild) ? all_children(any) : []);

            if (any.length > 0)
            {
                if (exports)
                {
                    any.push.apply(exports, any);
                }
                else
                {
                    exports = any;
                }
            }
        }

        if (exports && exports[0])
        {
            return this.filter(exports, 1);
        }
 
        return exports || [];
    };


    //获取指定控件的所有子控件
    function all_children(control) {

        var list = [],
            stack = [],
            index = 0,
            length = 0,
            next,
            any;

        do
        {
            list[length++] = control;
            next = control.nextSibling;

            if (any = control.firstChild)
            {
                control = any;
                
                if (next)
                {
                    stack[index++] = next;
                }
            }
            else
            {
                control = next || stack[--index];
            }
        }
        while (control);

        return list;
    };

    
    //移除子控件关系
    function remove_children(controls) {

        return controls;
    };

    
    //子控件选择器
    this['>'] = function (controls) {

        var index = 0,
            exports,
            item,
            any;

        while (item = controls[index++])
        {
            if (item.firstChild)
            {
                any = item.children();

                if (exports)
                {
                    any.push.apply(exports, any);
                }
                else
                {
                    exports = any;
                }
            }
        }

        return exports && exports[0] && this.filter(exports, 2) || [];
    };
    
    
    //毗邻控件选择器
    this['+'] = function (controls) {

        var exports = [],
            index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (item = item.nextSibling)
            {
                exports[length++] = item;
            }
        }
 
        return exports[0] ? this.filter(exports) : exports;
    };
    
    
    //后续兄弟控件选择器
    this['~'] = function (controls) {

        var exports = [],
            index = 0,
            length = 0,
            item;
        
        if (controls.length > 1)
        {
            controls = remove_next(controls);
        }

        while (item = controls[index++])
        {
            while (item = item.nextSibling)
            {
                exports[length++] = item;
            }
        }
 
        return exports[0] ? this.filter(exports) : exports;
    };


    //移除后述控件关系
    function remove_next(controls) {

        return controls;
    };
    

    //清除缓存
    function clear_cache(cache) {

        for (var type in cache)
        {
            var keys = cache[type];

            for (var id in keys)
            {
                keys[id] = null;
            }

            cache[type] = null;
        }
    };


    //清除id选择器缓存
    flyingon.__clear_id_query = function (id) {

        var keys = id_query,
            key,
            any;

        if (keys && (any = keys[id]))
        {
            for (key in any)
            {
                any[key] = null;
            }

            delete keys[key];

            for (key in keys)
            {
                return;
            }

            id_query = flyingon.__id_query_cache = null;
        }
    };
        

    //清除class选择器缓存
    flyingon.__clear_class_query = function (name) {

        var keys = class_query,
            key,
            any,
            index;
        
        if (keys && name)
        {
            if (typeof name === 'string')
            {
                if (any = keys[name])
                {
                    clear_cache(any);
                    delete keys[name];
                }
            }
            else if (name instanceof Array)
            {
                index = 0;

                while (key = name[index++])
                {
                    if (any = keys[key])
                    {
                        clear_cache(any);
                        delete keys[key];
                    }
                }
            }
            else
            {
                for (key in name)
                {
                    if (any = keys[key])
                    {
                        clear_cache(any);
                        delete keys[key];
                    }
                }
            }

            for (key in keys)
            {
                return;
            }

            class_query = flyingon.__clear_class_query = null;
        }
    };


    //清除类型选择器缓存
    flyingon.__clear_type_query = function (control) {

        var cache = type_query;

        for (var type in cache)
        {
            clear_cache(cache[type]);
            cache[type] = null;
        }

        type_query = flyingon.__type_query_cache = null;
    };

    
    
}, false);



//复合选择器节点类
flyingon.Selector_nodes = flyingon.defineClass(function () {
    
    
    
    this.type = ',';
    
    
    //子节点数量
    this.length = 0;
    
    
    //选择节点
    this.select = function (controls, exports) {
        
        var index = 1,
            list,
            item,
            id;
        
        if (item = this[0])
        {
            exports = item.select(controls, exports);

            while (item = this[index++])
            {
                list = item.select(controls, []);
                
                for (var i = 0, l = list.length; i < l; i++)
                {
                    if ((item = list[i]) && (id = -item.__uniqueId) &&!exports[id])
                    {
                        exports[id] = true;
                        exports.push(item);
                    }
                }
            }
        }

        return exports;
    };
    
    
    
}, false);



//选择器属性类
flyingon.Selector_property = flyingon.defineClass(function () {
    
    
    
    this.constructor = function (node, name) {
       
        this.name = name;
        node[node.length++] = this;
    };
    
    
    
    //节点类型
    this.type = '[]';
    
    
    //属性名称
    this.name = '';
    
    
    //关系符
    this.relation = '';
    
    
    //属性值
    this.value = '';



    this.filter = function (controls) {

        var name = this.name,
            fn;

        if (name && (fn = this[this.relation]))
        {
            var exports = [];

            fn.call(this, controls, name, exports);
            return exports;
        }

        return controls;
    };
    
    
    
    this[''] = function (controls, name, exports) {
        
        var index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (item[name] !== void 0)
            {
                exports[length++] = item;
            }
        }
    };
    
    
    this['='] = function (controls, name, exports) {
        
        var value = this.value,
            index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                if (any === value)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // *= 包含属性值XX (由属性解析)
    this['*='] = function (controls, name, exports) {
        
        var value = this.value,
            index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                any = '' + any;

                if (any.indexOf(value) >= 0)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // ^= 属性值以XX开头 (由属性解析)
    this['^='] = function (controls, name, exports) {
        
        var value = this.value,
            index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                any = '' + any;

                if (any.indexOf(value) === 0)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // $= 属性值以XX结尾 (由属性解析)
    this['$='] = function (controls, name, exports) {
        
        var value = this.value,
            count = value.length,
            index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                any = '' + any;

                if (any.lastIndexOf(value) === any.length - count)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en (由属性解析)
    this['~='] = function (controls, name, exports) {
        
        var regex = this.regex || (this.regex = new RegExp('(?:^|\s+)' + this.value + '(?:\s+|$)')),
            index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                if (regex.text(any))
                {
                    exports[length++] = item;
                }
            }
        }
    };


    this['|='] = function (controls, name, exports) {
        
        var regex = this.regex || (this.regex = new RegExp('\b' + this.value + '\b')),
            index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                if (regex.text(any))
                {
                    exports[length++] = item;
                }
            }
        }
    };
        
    
}, false);



//选择器伪类类
flyingon.Selector_pseudo = flyingon.defineClass(function () {
    
    
    
    this.constructor = function (node, name) {
       
        this.name = name;
        node[node.length++] = this;
    };
    
    
    
    //节点类型
    this.type = ':';
    
    
    //伪类名称
    this.name = '';
    
    
    //伪类参数值
    this.value = 0;
    


    this.filter = function (controls) {

        var name = this.name,
            fn;

        if (name && (fn = this[name]))
        {
            var exports = [];

            fn.call(this, controls, exports);
            return exports;
        }

        return controls;
    };
    

    this.active = function (controls, exports) {

    };
    
    
    this.disabled = function (controls, exports) {

        var index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item.__storage) && (any = any.disabled) === void 0)
            {
                if (any = item.__defaults)
                {
                    any = any.disabled;
                }
            }

            if (any)
            {
                exports[length++] = item;
            }
        }
    };
    

    this.enabled = function (controls, exports) {

        var index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item.__storage) && (any = any.disabled) === void 0)
            {
                if (any = item.__defaults)
                {
                    any = any.disabled;
                }
            }

            if (!any)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.checked = function (controls, exports) {

        var index = 0,
            length = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item.__storage) && (any = any.checked) === void 0)
            {
                if (any = item.__defaults)
                {
                    any = any.checked;
                }
            }

            if (any)
            {
                exports[length++] = item;
            }
        }
    };

    
    
    this.has = function (controls, exports) {

        var selector = this.value;

        if (selector)
        {
            selector = flyingon.__parse_selector(selector);

            
        }

        return controls;
    };
    
    
    this.not = function (controls, exports) {

    };
    
    

    this.empty = function (controls, exports) {

        var index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.firstChild)
            {
                exports[length++] = item;
            }
        }
    };
    
    
    this.only = function (controls, exports) {
        
        var index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.previousSibling && !item.nextSibling)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.first = function (controls, exports) {

        var index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.previousSibling)
            {
                exports[length++] = item;
            }
        }
    };

        
    this.last = function (controls, exports) {

        var index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.nextSibling)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.odd = function (controls, exports) {
        
        var value = this.value,
            index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (!(item.index() & 1))
            {
                exports[length++] = item;
            }
        }
    };
    
    
    this.even = function (controls, exports) {
        
        var value = this.value,
            index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() & 1)
            {
                exports[length++] = item;
            }
        }
    };
    
        
    this.eq = function (controls, exports) {
        
        var value = this.value,
            index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() === value)
            {
                exports[length++] = item;
            }
        }
    };
    
        
    this.gt = function (controls, exports) {

        var value = this.value,
            index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() > value)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.lt = function (controls, exports) {

        var value = this.value,
            index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() < value)
            {
                exports[length++] = item;
            }
        }
    };

    
}, false);



//选择器查询类
flyingon.Query = flyingon.defineClass(function () {
    
    
    
    //选择器解析缓存
    var parse = flyingon.__parse_selector;
    
    
    
    this.constructor = function (selector, context) {
       
        var any;
        
        if (context && (any = parse(selector)) && (any = any.select(context)) && any[0])
        {
            any.push.apply(this, any);
        }
    };
    
    
    
    this.find = function (selector) {
        
        var target = new this.Class(selector, this);

        target.previous = this;
        return target;
    };


    //
    this.children = function (step, start, end) {

    };
    
    
    this.end = function () {
      
        return this.previous || this;
    };
    
        

    this.on = function (type, fn) {

        if (type && fn)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.on(type, fn);
            }
        }
        
        return this;
    };
    
    
    this.once = function (type, fn) {

        if (type && fn)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.once(type, fn);
            }
        }
        
        return this;
    };

    
    this.off = function (type, fn) {

        var index = 0,
            item;

        while (item = this[index++])
        {
            item.off(type, fn);
        }
        
        return this;
    };


    this.trigger = function (e) {

        if (e)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.trigger.apply(item, arguments);
            }
        }
        
        return this;
    };

    

    this.hasClass = function (className) {

        var item;
        return className && (item = this[0]) ? item.hasClass(className) : false;
    };

    
    this.addClass = function (className) {

        if (className)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.addClassName(className);
            }
        }
        
        return this;
    };

    
    this.removeClass = function (className) {

        if (className)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.removeClass(className);
            }
        }
        
        return this;
    };

    
    this.toggleClass = function (className) {

        if (className)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.toggleClass(className);
            }
        }
        
        return this;
    };
    
    
}, false);