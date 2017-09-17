//序列化功能扩展
flyingon.fragment('f-serialize', function () {
    
    
       
    //设置不反序列化Class属性
    this.deserialize_Class = true;
    
    
    
    //序列化方法
    this.serialize = function (writer) {

        var any;
        
        if ((any = this.Class) && (any = any.nickName || any.Class))
        {
            writer.writeProperty('Class', any);
        }
        
        if (any = this.__storage)
        {
            writer.writeProperties(any, this.getOwnPropertyNames(), this.__watches);
        }
    };
    
        
    //反序列化方法
    this.deserialize = function (reader, values) {

        var bind = this.addBind,
            value,
            any;
        
        for (var name in values)
        {
            if ((value = values[name]) === void 0)
            {
                continue;
            }
            
            if (bind && typeof value === 'string' && value.charAt(0) === '{' && (any = value.match(/^\{\{(\w+)\}\}$/)))
            {
                this.addBind(name, any[1]);
            }
            else if (any = this['deserialize_' + name])
            {
                if (any !== true)
                {
                    any.call(this, reader, value);
                }
            }
            else
            {
                this.set(name, value);
            }
        }
    };


});



//读序列化类
flyingon.SerializeReader = Object.extend(function () {

    

    var components = flyingon.components;
    
    var Array = window.Array;
    
    

    this.deserialize = function (data) {

        if (data)
        {
            if (typeof data === 'string')
            {
                data = flyingon.parseJSON(data);
            }

            if (typeof data === 'object')
            {
                data = data instanceof Array ? this.readArray(data) : this.readObject(data);
                this.all = this.callback = null;
            }
        }

        return data;
    };


    this.readArray = function (data, type) {

        if (data)
        {
            var array = [],
                any;

            for (var i = 0, l = data.length; i < l; i++)
            {
                if ((any = data[i]) && typeof any === 'object')
                {
                    if (type || !(any instanceof Array))
                    {
                        any = this.readObject(any, type);
                    }
                    else
                    {
                        any = this.readArray(any);
                    }
                }

                array.push(any);
            }

            return array;
        }

        return null;
    };


    this.readObject = function (data, type) {

        if (data)
        {
            var target, any;

            if (any = data.Class)
            {
                if (any = components[any])
                {
                    target = new any();
                }
                else
                {
                    target = new flyingon.HtmlElement();
                    target.tagName = data.Class;
                }

                target.deserialize(this, data);
                
                if (any = data.id)
                {
                    read_reference.call(this, target, any);
                }
            }
            else if (type)
            {
                if ((target = new type()).deserialize)
                {
                    target.deserialize(this, data);
                    
                    if (any = data.id)
                    {
                        read_reference.call(this, target, any);
                    }
                }
                else
                {
                    this.readProperties(target, data); 
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
      
        var any;

        for (var name in data)
        {
            if ((any = data[name]) && typeof any === 'object')
            {
                any = any instanceof Array ? this.readArray(any) : this.readObject(any);
            }

            target[name] = any;
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
      
        

}, false);



//写序列化类
flyingon.SerializeWriter = Object.extend(function () {


    
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
            if (value instanceof Date)
            {
                writer.push('"', value, '"', ',');
                return;
            }

            data.push('{');

            if (value.serialize)
            {
                value.serialize(this);
            }
            else
            {
                for (var name in value)
                {
                    data.push('"', name, '":');
                    this.write(value[name]);
                }
            }

            data.push(data.pop() === ',' ? '}' : '{}', ',');
        }
        else
        {
            data.push(null, ',');
        }
    };


    this.writeProperties = function (storage, keys, watches) {

        var data = this.data,
            name,
            any;
        
        for (var i = 0, l = keys.length; i < l; i++)
        {
            name = keys[i];
            
            if (watches && (any = watches[name]) && (any = any[0]))
            {
                data.push('"', name, '":"{{', any.replace(/"/g, '\\"'),'}}"', ',');
            }
            else
            {
                data.push('"', name, '":');
                this.write(storage[name]);
            }
        }
    };
    
    
    this.writeProperty = function (name, value, array) {
      
        if (name)
        {
            this.data.push('"', name, '":');

            if (array)
            {
                this.writeArray(value);
            }
            else
            {
                this.write(value);
            }
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

    

}, false);