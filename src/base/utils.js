
//html编码函数
flyingon.html_encode = (function () {
    
    var create = flyingon.create,
        storage = create(null),
        map = create(null);

    map['&'] = '&amp;';
    map['<'] = '&lt;';
    map['>'] = '&gt;';
    map['\''] = '&apos;';
    map['"'] = '&quot;';

    function encode(text, cache) {

        var any;

        if (text && typeof text !== 'string' && (any = +text) !== any)
        {
            if (cache && (any = storage[text]))
            {
                return any;
            }

            any = map;

            any = text.replace(/([&<>'"])/g, function (_, key) {

                return any[key];
            });

            return cache ? (storage[text] = any) : any;
        }

        return '' + text;
    };

    return encode;

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