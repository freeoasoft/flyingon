//扩展数组indexOf方法
Array.prototype.indexOf || (Array.prototype.indexOf = function (item) {

    for (var i = 0, l = this.length; i < l; i++)
    {
        if (this[i] === item)
        {
            return i;
        }
    }

    return -1;
});


//扩展数组lastIndexOf方法
Array.prototype.lastIndexOf || (Array.prototype.lastIndexOf = function (item) {

    for (var i = this.length - 1; i >= 0; i--)
    {
        if (this[i] === item)
        {
            return i;
        }
    }

    return -1;
});



//扩展函数bind方法
Function.prototype.bind || (Function.prototype.bind = function (context) {

    var fn = this;

    if (arguments.length > 1)
    {
        var list = [].slice.call(arguments, 1),
            push = list.push;

        return function () {

            var data = list.slice(0);

            if (arguments.length > 0)
            {
                push.apply(data, arguments);
            }

            return fn.apply(context || this, data);
        };
    }

    return function () {

        return fn.apply(context || this, arguments);
    };
});



//当不存在JSON对象时扩展json解析器
//使用危险代码检测的方法(无危险代码则使用eval解析)实现json解析
typeof JSON !== 'undefined' || (function () {

    
    function write(writer, value) {
        
        if (value)
        {
            switch (typeof value)
            {
                case 'string':
                    writer.push('"', value.replace(/"/g, '\\"'), '"');
                    break;
                    
                case 'object':
                    (value instanceof Array ? write_array : write_object)(writer, value);
                    break;
                    
                case 'function':
                    writer.push('null');
                    break;
                    
                default:
                    writer.push(value);
                    break;
            }
        }
        else
        {
            writer.push(value !== '' ? '' + value : '""');
        }
    };
    
    
    function write_object(writer, values) {
        
        var value, type, flag;
        
        writer.push('{');
        
        for (var name in values)
        {
            if (value = values[name])
            {
                switch (type = typeof value)
                {
                    case 'string':
                        value = value.replace(/"/g, '\\"');
                        break;
                        
                    case 'function':
                        value = void 0;
                        break;
                }
            }
            else if (value === '')
            {
                value = '""';
            }
                        
            //对象值为undefined或function则不序列化
            if (value === void 0)
            {
                continue;
            }
            
            if (flag)
            {
                writer.push(',');
            }
            else
            {
                flag = true;
            }
            
            writer.push('"', name.replace(/"/g, '\\"'), '":');
            
            if (type !== 'object')
            {
                writer.push(value);
            }
            else
            {
                (value instanceof Array ? write_array : write_object)(writer, value);
            }
        }
        
        writer.push('}');
    };
    
    
    function write_array(writer, values) {
        
        writer.push('[');
        
        for (var i = 0, l = values.length; i < l; i++)
        {
            if (i > 0)
            {
                writer.push(',');
            }
            
            write(writer, values[i]);
        }
        
        writer.push(']');
    };
    
    
    window.JSON = {
        
        parse: function (text) {

            if (typeof text === 'string')
            {
                if (/[a-zA-Z_$]/.test(text.replace(/"(?:\\"|[^"])*?"|null|true|false|\d+[Ee][-+]?\d+/g, '')))
                {
                    flyingon.raise('flyingon', 'error.json_parse');
                }

                return new Function('return ' + text)();
            }

            return text;
        },
        
        stringify: function (value) {
            
            if (value)
            {
                var writer = [];
                write(writer, value);

                return writer.join('');
            }
            
            if (value !== void 0)
            {
                return value !== '' ? '' + value : '""';
            }
        }
    };


})();