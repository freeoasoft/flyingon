//视图模板类
flyingon.view.Template = Object.extend(function () {



    //标签嵌套规则
    var rule = flyingon.view.rule = flyingon.create(null);



    this.init = function (template) {

        if (typeof template === 'string')
        {
            this.template = template;
        }
        else
        {
            this.ast = template;
        }
    };




    //解析html模板生成虚拟树
    this.parse = function (multi) {

        var ast = this.ast,
            any;

        if (!ast && (any = this.template))
        {
            any = any.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+<\s*\//g, '></');
            any = any.match(/[<=/]|[\w-:#@]+|\>[^<>]+(?=\<\s*\/)|[>/]|"[^"]*"|'[^']*'/g);

            ast = parse(any, []);

            if (!multi && ast instanceof Array)
            {
                if (ast[1])
                {
                    throw 'template can only one root node!';
                }

                ast = ast[0];
            }

            if (ast)
            {
                if (ast['#loop'])
                {
                    throw 'template root nood can not use "#loop"!';
                }
            }
            else
            {
                throw 'template can not be empty!';
            }

            this.ast = ast;
        }

        return ast;
    };



    //分析模板生成模型结构
    this.analyse = function () {

        var vm = this.vm,
            any;

        if (vm === void 0 && (any = this.ast || this.parse()))
        {
            analyse_object(vm = {}, any);

            for (any in vm)
            {
                return this.vm = vm;
            }

            return this.vm = null;
        }

        return vm;
    };



    //解析html模板
    function parse(tokens, array) {

        var regex_node = /[^\w-]/,
            regex_name = /[^\w-:#@]/,
            stack = [],
            flag, //属性分析阶段标记
            index = 0,
            item,
            name,
            token,
            any;

        while (token = tokens[index++])
        {
            switch (token)
            {
                case '<':
                    if (flag)
                    {
                        throw parse_error(token, item);
                    }

                    token = tokens[index++];

                    //下一个符号是关闭结点
                    if (token === '/')
                    {
                        if (!item || tokens[index] !== item.Class || tokens[index + 1].charAt(0) !== '>')
                        {
                            throw '"' + token + tokens[index] + tokens[index + 1] + '" not a valid close tag!';
                        }

                        index++;
                        stack.pop();
                        item = stack[stack.length - 1];
                        break;
                    }

                    if (token.match(regex_node))
                    {
                        throw '"' + token + '" not a valid node name!';
                    }

                    any = { Class: token };

                    //添加子项
                    if (item)
                    {
                        (item.children || (item.children = [])).push(any);
                    }
                    else
                    {
                        array.push(any);
                    }

                    stack.push(item = any);
                    flag = true; //标记处于属性分析阶段
                    break;

                case '/':
                    if (flag && tokens[index++] === '>')
                    {
                        flag = false; //标记属性分析阶段结束

                        if (name)
                        {
                            item[name] = true;
                            name = null;
                        }

                        stack.pop();
                        item = stack[stack.length - 1];
                        break;
                    }

                    throw parse_error(token, item);

                case '>':
                    if (flag)
                    {
                        flag = false; //标记属性分析阶段结束

                        if (name)
                        {
                            item[name] = true;
                            name = null;
                        }
                    }
                    break;

                case '=':
                    if (flag && name)
                    {
                        switch (token = tokens[index++])
                        {
                            case '<':
                            case '>':
                            case '/':
                            case '=':
                                throw parse_error(token, item);
                        }

                        any = token.charAt(0);
                        any = any === '"' || any === '\'' ? token.substring(1, token.length - 1) : token;

                        item[name] = any;
                        name = null;
                        break;
                    }

                    throw parse_error(token, item);


                default:
                    if (flag)
                    {
                        if (name)
                        {
                            item[name] = true;
                        }

                        flag = token.charAt(0);

                        //处理标签间的文本
                        if (item && flag === '>')
                        {
                            name = null;
                            flag = false;

                            if ((token = token.substring(1)).indexOf('&') >= 0)
                            {
                                token = flyingon.html_decode(token);
                            }

                            item.text = token;
                        }
                        else
                        {
                            if (token.match(regex_name))
                            {
                                throw '"<' + item.Class + '...' + token + '" not a valid attribute name!';
                            }

                            name = token;
                        }
                    }
                    break;
            }
        }

        return array;
    };


    function parse_error(token, item) {

        return '"' + (item ? '<' + item[0] + '...' : '') + token + '" has syntax error!';
    };




    //分析生成的节点格式
    //[type, subtype, name, path, detail]
    //[0, 0, name, path, null]    无父级节点
    //[0, 1, name, path, null]    loop item变量(0可能会升级成1或者2)
    //[0, 2, name, null, null]    loop index变量
    //[0, 3, name, path, detail]  函数, detail为参数列表
    //[1, 0, name, path, detail]  对象节点, detail为属性列表
    //[1, 1, name, path, detail]  升级为对象节点的loop item变量, detail为属性列表
    //[2, 0, name, path, detail]  数组节点, detail是item变量
    //[2, 1, name, path, detail]  升级为数组节点的loop item变量, detail是item变量
    

    function analyse_object(node, ast) {

        var item, any;

        //节点容错处理
        if ((item = ast.Class) && (item = rule[item]) && (any = ast.children) && any[0])
        {
            check_rule(item, ast, any);
        }

        for (var name in ast)
        {
            switch (name)
            {
                case 'Class':
                case 'children':
                case '#loop':
                    any = null;
                    break;

                default:
                    any = ast[name];
                    break;
            }

            if (any)
            {
                switch (name.charAt(0))
                {
                    case '#': //指令
                    case ':': //绑定
                        ast[name] = any.indexOf('(') > 0 ? analyse_function(node, any) : analyse_name(node, any, 0, 0);
                        break;

                    case '@': //事件
                        ast[name] = analyse_function(node, any);
                        break;
                }
            }
        }

        if (ast = ast.children)
        {
            any = 0;

            while (item = ast[any++])
            {
                (item['#loop'] ? analyse_loop : analyse_object)(node, item);
            }
        }
    };


    function analyse_loop(node, ast) {

        var keys = ast['#loop'].match(/[\w.-]+/g),
            loop,
            item,
            index,
            any;

        if (keys && (loop = keys[0]))
        {
            loop = analyse_name(node, loop, 2, 0);

            //第一个变量是item, 第二个变量是index
            //可以省略index, 但是不可以省略item
            if (item = keys[1])
            {
                check_loop(node, item);

                //在loop中记录item信息并添加进作用域
                any = loop[4] = node[loop.item = item] = [0, 1, item, null, null, 0];
                any.loop = loop;

                if (index = keys[2])
                {
                    check_loop(node, index);

                    //添加进作用域
                    node[loop.index = index] = loop[5] = [0, 2, index, null, null, 0];
                }
            }

            //在作用域范围内分析模板
            analyse_object(node, ast);

            if (item)
            {
                //标记超出作用域
                node[item] = 0;

                //如果item变量未使用则移除
                if (!any[0] && !any[5])
                {
                    loop.item = loop[4] = null;
                }

                if (index)
                {
                    //如果index变量未使用则移除
                    if (!node[index][5])
                    {
                        loop[5] = loop.index = null;
                    }

                    //标记超出作用域
                    node[index] = 0;
                }
            }
        }
        else
        {
            analyse_object(node, ast);
        }

        ast['#loop'] = loop;
    };


    function check_loop(node, name) {

        if (name.indexOf('.') >= 0)
        {
            throw 'loop "' + name + '" can not include "."!';
        }

        if (node[name])
        {
            throw 'loop "' + name + '" has be used!';
        }
    };


    function analyse_name(node, name, type, subtype) {

        var keys = name.match(/[\w-]+/g),
            list = null, //上级列表
            item;

        for (var i = 0, l = keys.length - 1; i < l; i++)
        {
            if (item = node[name = keys[i]])
            {
                switch (item[0])
                {
                    case 1: //对象
                        node = item[4];
                        break;

                    case 0: //数组item变量升级为对象,否则穿透抛出异常
                        item[0] = 1;
                        node = item[4] || (item[4] = {}); 
                        break;
                }
            }
            else if (item === 0)
            {
                throw '"' + name + '" is out of scope range!';
            }
            else
            {
                item = node[name] = [1, 0, name, list ? list.slice(0) : null, node = {}]; //创建新对象
            }

            if (list)
            {
                list.push(item);
            }
            else
            {
                list = [item];
            }
        }

        if (item = node[name = keys.pop()])
        {
            if (type)
            {
                if (item[0])
                {
                    throw '"' + name + '" has be used!';
                }

                item[0] = type;
            }
            else if (item[1])
            {
                item[5]++;
            }

            return item;
        }
        
        if (item === 0)
        {
            throw '"' + name + '" is out of scope range!';
        }

        return node[name] = [type, subtype, name, list, null];
    };


    function analyse_function(node, name) {

        var list = name.match(/[\w-.]+/g),
            args,
            item,
            index,
            any;

        if ((name = list[0]).indexOf('.') >= 0)
        {
            throw 'function "' + name + '" can not include "."!';
        }
        
        if ((item = node[name]) && item[1] !== 2)
        {
            throw 'function name "' + name + '" has be used!';
        }

        //函数支持重载,同一函数可传入不同的参数,所以每次分析都重新生成新节点
        item = node[name] = [0, 3, list[0], null, null];

        if (list[1])
        {
            args = [];
            index = 1;

            while (name = list[index++])
            {
                if (any = node[name])
                {
                    any[5]++; //标记变量被引用
                }
                else
                {
                    any = analyse_name(node, name, 0, 0);
                }

                args.push(any);
            }
            
            item[4] = args;
        }

        return item;
    };


    //检查标签规则,符合配置规则时替换标签以解决html不合法嵌套带来的dom结构混乱的问题
    function check_rule(rule, ast, children) {

        var check = rule[0],
            tag = rule[1] || check,
            flag = typeof check === 'string';
        
        for (var i = 0, l = children.length; i < l; i++)
        {
            if (flag ? children[i].Class !== check : !check.test(children[i].Class))
            {
                children[i] = { Class: tag, children: [children[i]] };
            }
        }
    };



    //默认html规则
    //参数1: string|Regex 替换条件 字符串表示是否与指定的类型相同
    //参数2: string       要替换成的类型 与第二项相同时可省略

    rule.table = [/tbody|thead|tfoot/, 'tbody'];

    rule.thead = rule.tbody = rule.tfoot = ['tr'];

    rule.tr = [/td|th/, 'td'];

    rule.ol = rule.ul = ['li'];

    rule.dl = ['dt'];

    rule.dt = ['dd'];

    rule.select = ['option'];


}, false);