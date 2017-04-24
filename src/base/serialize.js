//序列化组件片段
flyingon.__serialize_fragment = flyingon.fragment(function () {
    
    
    
    var create = flyingon.create;
    
    
       
    //设置不序列化type属性
    this.deserialize_type = true;
    
    
    
    //序列化方法
    this.serialize = function (writer) {

        var any;
        
        if ((any = this.Class) && (any = any.aliasName || any.xtype))
        {
            writer.writeProperty('type', any);
        }
        
        if (any = this.__storage)
        {
            writer.writeProperties(any, this.__bind_keys);
        }
    };
    
        
    //反序列化方法
    this.deserialize = function (reader, values) {

        var bind = this.addBind,
            value,
            any;
        
        for (var name in values)
        {
            value = values[name];
            
            if (bind && typeof value === 'string' && (any = value.match(/^\{\{(\w+)\}\}$/)))
            {
                bind.call(this, name, any[1]);
            }
            else if (any = this['deserialize_' + name])
            {
                if (any !== true)
                {
                    any.call(this, reader, value);
                }
            }
            else if ((any = this[name]) && typeof any === 'function')
            {
                any.call(this, value, false);
            }
            else
            {
                (this.__storage || (this.__storage = create(null)))[name] = value;
            }
        }
    };



});



//读序列化类
flyingon.SerializeReader = flyingon.defineClass(function () {

    

    var components = flyingon.components;
    
    var Array = window.Array;
    
    

    this.deserialize = function (data) {

        if (data)
        {
            if (typeof data === 'string')
            {
                data = JSON.parse(data);
            }

            if (typeof data === 'object')
            {
                data = data instanceof Array ? this.readArray(data) : this.readObject(data);
                this.all = this.callback = null;
            }
        }

        return data;
    };


    this.read = function (data) {

        if (data && typeof data === 'object')
        {
            return data instanceof Array ? this.readArray(data) : this.readObject(data);
        }

        return data;
    };


    this.readArray = function (data) {

        if (data)
        {
            var array = [];

            for (var i = 0, l = data.length; i < l; i++)
            {
                array.push(this.read(data[i]));
            }

            return array;
        }

        return null;
    };


    this.readObject = function (data, type) {

        if (data)
        {
            var target, id;

            if (type)
            {
                if ((target = new type()).deserialize)
                {
                    target.deserialize(this, data);
                    
                    if (id = data.id)
                    {
                        read_reference.call(this, target, id);
                    }
                }
                else
                {
                    this.readProperties(target, data); 
                }
            }
            else if ((type = data.type) && (type = components[type]))
            {
                (target = new type()).deserialize(this, data);
                
                if (id = data.id)
                {
                    read_reference.call(this, target, id);
                }
            }
            else
            {
                this.readProperties(target = {}, data); 
            }
            
            return target;
        }

        return null;
    };
    
    
    function read_reference(target, id) {
        
        var list = this.callback;
        
        (this.all || (this.all = {}))[id] = target;

        if (list && (list = list[id]))
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                list[i](target);
            }

            list[id] = target = null;
        }
    };

    
    this.readProperties = function (target, data) {
      
        for (var name in data)
        {
            target[name] = this.read(data[name]);
        }
    };
    
    
    this.readReference = function (name, callback) {
      
        var all = this.all,
            any;
        
        if (all && (any = all[name]))
        {
            callback(any);
        }
        else if (any = this.callback)
        {
            (any[name] || (any[name] = [])).push(callback);
        }
        else
        {
            (this.callback = {})[name] = [callback];
        }
    };
      
    
    this.__class_init = function (Class) {
    
        var reader = Class.instance = new Class();

        Class.deserialize = function (values) {

            return reader.deserialize(values);
        };
    };
    

}, false);



//写序列化类
flyingon.SerializeWriter = flyingon.defineClass(function () {


    
    var Array = window.Array;
    
    var id = 1;
    
    
    
    this.serialize = function (value) {

        if (value && typeof value === 'object')
        {
            var data = this.data = [];
            
            if (value instanceof Array)
            {
                this.writeArray(value);
            }
            else
            {
                this.writeObject(value);
            }

            data.pop();
            
            return data.join('');
        }
        
        return '' + value;
    };


    this.write = function (value) {

        if (value != null)
        {
            switch (typeof value)
            {
                case 'boolean':
                    this.data.push(value ? true : false, ',');
                    break;

                case 'number':
                    this.data.push(+value || 0, ',');
                    break;

                case 'string':
                    this.data.push('"', value.replace(/"/g, '\\"'), '"', ',');
                    break;
                    
                case 'function':
                    this.data.push('"', ('' + value).replace(/"/g, '\\"'), '"', ',');
                    break;

                default:
                    if (value instanceof Array)
                    {
                        this.writeArray(value);
                    }
                    else
                    {
                        this.writeObject(value);
                    }
                    break;
            }
        }
        else
        {
            this.data.push(null, ',');
        }
    };


    this.writeArray = function (value) {

        var data = this.data,
            length;
        
        if (value != null)
        {
            if ((length = value.length) > 0)
            {
                data.push('[');
                
                for (var i = 0; i < length; i++)
                {
                    this.write(value[i]);
                }
                
                data.pop();
                data.push(']', ',');
            }
            else
            {
                data.push('[]', ',');
            }
        }
        else
        {
            data.push(null, ',');
        }
    };


    this.writeObject = function (value) {

        var data = this.data;
        
        if (value != null)
        {
            data.push('{');

            if (value.serialize)
            {
                value.serialize(this);
            }
            else
            {
                this.writeProperties(value);
            }

            data.push(data.pop() === ',' ? '}' : '{}', ',');
        }
        else
        {
            data.push(null, ',');
        }
    };


    this.writeProperties = function (values, bind) {

        if (values)
        {
            var data = this.data,
                any;
            
            for (var name in values)
            {
                if (bind && (any = bind[name]))
                {
                    if (typeof any === 'function')
                    {
                        any = any.text;
                    }
                    
                    data.push('"', name, '":"{{', any.replace(/"/g, '\\"'),'}}"', ',');
                }
                else
                {
                    data.push('"', name, '":');
                    this.write(values[name]);
                }
            }
        }
    };
    
    
    this.writeProperty = function (name, value) {
      
        if (name)
        {
            this.data.push('"', name, '":');
            this.write(value);
        }
    };
    
    
    this.writeReference = function (name, value) {
        
        if (name && value)
        {
            var id = value.id;
            
            if (id && typeof id === 'function')
            {
                id = id();
            }
            
            this.data.push('"', name, '":', id || ('__auto_id_' + id++));
        }
    };

    
        
    this.__class_init = function (Class) {
    
        var writer = Class.instance = new Class();

        Class.serialize = function (value) {

            return writer.serialize(value);
        };
    };
    

}, false);