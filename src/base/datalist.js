/**
 * @class flyingon.Dropdown
 * @description 数据列表, 主要给列表框, 下拉框及下拉树或需要翻译的地方等使用
 */
(function (Class) {


    //等待注册集合
    var wait = Class.wait = flyingon.create(null);

    
    //注册的所有数据列表集合
    var all = Class.all = flyingon.create(null);


    //根据列表创建DataList
    Class.create = function (list, callback, context) {

        if (list)
        {
            var any;

            if (list instanceof Class)
            {
                callback && callback.call(context, list);
                return list;
            }

            if (typeof list === 'string')
            {
                if (any = all[list])
                {
                    callback && callback.call(context, any);
                }
                else if (callback)
                {
                    (wait[name] || (wait[name] = [])).push(callback, context);
                }

                return any;
            }

            list = list instanceof Array ? list : (list == null ? [] : [list]);

            if ((any = list[0]) && typeof any === 'object')
            {
                any = create(any);
            }
            else
            {
                any = new flyingon.DataList();
            }

            any.load(list);

            callback && callback.call(context, any);
            return any;
        }
    };


    function create(item) {

        var keys = [];

        if ('value' in item)
        {
            keys.push('value');

            if ('text' in item)
            {
                keys.push('text');
            }
        }

        for (var name in item)
        {
            keys.push(name);

            if (keys.length > 1)
            {
                break;
            }
        }

        return new flyingon.DataList(name = keys[0] || 'value', keys[1] || name);
    };



})(flyingon.DataList = Object.extend(function () {
    

    
    var all = this.Class.all;
    
    var wait = this.Class.wait;

    var array = Array.prototype;



    this.init = function (valueField, displayField) {

        if (this.valueField = valueField || '')
        {
            this.displayField = displayField || valueField;
            this.keys = flyingon.create(null);
        }
        else
        {
            this.displayField = '';
        }
    };



    this.length = 0;
    

    this.load = function (list, childrenName) {

        var keys;

        if (list && list.length > 0)
        {
            array.push.apply(this, list);

            if (keys = this.keys)
            {
                append_keys(keys, this.valueField, list, childrenName);
            }

            this.trigger('load');
        }

        return this;
    };



    function append_keys(keys, field, list, children) {

        for (var i = 0, l = list.length; i < l; i++)
        {
            var item = list[i],
                any;

            if (item && (any = item[field]) != null)
            {
                keys[any] = item;

                if (children && (any = item[children]) && any.length > 0)
                {
                    append_keys(keys, field, any, children);
                }
            }
        }
    };



    this.clear = function () {

        if (this.keys)
        {
            this.keys = flyingon.create(null);
        }

        array.splice.call(this, 0);
        return this;
    };


    //获取指定项的值
    this.value = function (item) {

        var field = this.valueField;
        return field ? (item ? item[field] : '') : item;
    };


    //获取指定值对应的显示文本
    this.text = function (value, separator, separator2) {

        var keys = this.keys;
        
        if (keys)
        {
            var field = this.displayField,
                any;

            if (separator)
            {
                value = value ? value.split(separator) : [value];

                for (var i = 0, l = value.length; i < l; i++)
                {
                    value[i] = (any = keys[value[i]]) && any[field] || '';
                }

                return value.join(separator2 || separator);
            }

            if (any = keys[value])
            {
                return field ? any[field] : any;
            }
        }

        return value;
    };


    //根据值指定值查找下拉项
    this.find = function (value) {

        var keys = this.keys;
        return keys ? keys[value] : value;
    };


    //根据指定值查询多个下拉项
    this.select = function (value, separator) {

        var keys = this.keys;

        value = keys ? value.split(separator || ',') : [value];

        if (keys)
        {
            for (var i = 0, l = value.length; i < l; i++)
            {
                value[i] = keys[value[i]];
            }
        }

        return value;
    };


    /**
     * 注册
     */
    this.register = function (name, force) {
        
        if (name)
        {
            var any = all;
    
            if (!force && any[name])
            {
                throw 'register name "' + name + '" has exist!';
            }
    
            any[name] = this;

            if (any = wait[name])
            {
                delete wait[name];

                for (var i = any.length - 1; i >= 0; i--)
                {
                    wait[i++].call(wait[i], this);
                }
            }
        }

        return this;
    };


    this.dispose = function () {

        this.keys = null;
        array.splice.call(this, 0);
    };
    

}, false));