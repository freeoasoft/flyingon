(function () {



    var encode = flyingon.create(null);

    var decode = flyingon.create(null);

    var pow = flyingon.create(null);

    var round = Math.round;


    encode['&'] = '&amp;';
    encode['<'] = '&lt;';
    encode['>'] = '&gt;';
    encode['\''] = '&apos;';
    encode['"'] = '&quot;';

    decode['amp'] = '&';
    decode['lt'] = '<';
    decode['gt'] = '>';
    decode['apos'] = '\'';
    decode['quot'] = '"';


    //注: 不同浏览器toFixed有差异, chrome使用的是银行家舍入规则
    //银行家舍入: 所谓银行家舍入法, 其实质是一种四舍六入五取偶(又称四舍六入五留双)法
    //简单来说就是: 四舍六入五考虑, 五后非零就进一, 五后为零看奇偶, 五前为偶应舍去, 五前为奇要进一

    //精确的带小数位的四舍五入方法
    flyingon.round = function (value, digits, string) {

        if (digits > 0)
        {
            var any = pow[digits] || (pow[digits] = Math.pow(10, digits | 0));

            value = round(value * any + 0.1) / any;

            return string ? value.toFixed(digits) : value;
        }

        value = round(value + 0.1); //解决如2.135*100不等于213.5的问题
        return string ? '' + value : value;
    };



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
    flyingon.html_encode = function (text) {

        if (text && typeof text === 'string')
        {
            var keys = encode;

            return text.replace(/([&<>'"])/g, function (_, key) {

                return keys[key];
            });
        }

        return '' + text;
    };


    //html解码函数
    flyingon.html_decode = function (text) {

        var keys = decode;

        return text && text.replace(/&(\w+);/g, function (_, key) {

            return keys[key] || key;
        });
    };



    /**
     * 从字符串转换成json
     */
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



})();