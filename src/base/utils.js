//编码对象
flyingon.encode = function encode(data) {

    if (!data)
    {
        return '';
    }

    var list = [],
        fn = encodeURIComponent,
        value,
        any;

    for (var name in data)
    {
        value = data[name];
        name = fn(name);

        if (value === null)
        {
            list.push(name, '=null', '&');
            continue;
        }

        switch (typeof value)
        {
            case 'undefined':
                list.push(name, '=&');
                break;

            case 'boolean':
            case 'number':
                list.push(name, '=', value, '&');
                break;

            case 'string':
            case 'function':
                list.push(name, '=', fn(value), '&');
                break;

            default:
                if (value instanceof Array)
                {
                    for (var i = 0, l = value.length; i < l; i++)
                    {
                        if ((any = value[i]) === void 0)
                        {
                            list.push(name, '=&');
                        }
                        else
                        {
                            list.push(name, '=', fn(any), '&'); //数组不支持嵌套
                        }
                    }
                }
                else
                {
                    list.push(name, '=', encode(value), '&');
                }
                break;
        }
    }

    list.pop();
    return list.join('');
};
    
    

//html编码函数
flyingon.html_encode = (function () {
    
    var map = flyingon.create(null);

    map['&'] = '&amp;';
    map['<'] = '&lt;';
    map['>'] = '&gt;';
    map['\''] = '&apos;';
    map['"'] = '&quot;';

    return function (text) {

        if (text && typeof text === 'string')
        {
            var keys = map;

            return text.replace(/([&<>'"])/g, function (_, key) {

                return keys[key];
            });
        }

        return '' + text;
    };

})();


//html解码函数
flyingon.html_decode = (function () {
    
    var map = flyingon.create(null);

    map['amp'] = '&';
    map['lt'] = '<';
    map['gt'] = '>';
    map['apos'] = '\'';
    map['quot'] = '"';

    return function (text) {

        var keys = map;

        return text && text.replace(/&(\w+);/g, function (_, key) {

            return keys[key] || key;
        });
    };

})();



flyingon.parseJSON = typeof JSON !== 'undefined' 

    ? function (text) {

        return JSON.parse(text);
    }

    : function (text) {

        if (typeof text === 'string')
        {
            if (/[a-zA-Z_$]/.test(text.replace(/"(?:\\"|[^"])*?"|null|true|false|\d+[Ee][-+]?\d+/g, '')))
            {
                throw 'json parse error!';
            }

            return new Function('return ' + text)();
        }

        return text;
    };