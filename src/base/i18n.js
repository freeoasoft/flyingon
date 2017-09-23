(function () {



    var cache = flyingon.create(null);



    //定义国际化集合
    function i18n(name, values) {

        var keys = cache,
            key;
        
        if (name)
        {
            name += '.';

            for (key in values)
            {
                keys[name + key] = values[key];
            }
        }
        else
        {
            for (key in values)
            {
                keys[key] = values[key];
            }
        }
    };
        


    //获取指定key的本地化信息
    flyingon.i18ntext = function (key, text) {

        return cache[key] || (text != null ? text : key);
    };


    //获取或设置当前本地化名称
    (flyingon.i18n = function (name, values) {

        if (values && typeof values === 'object')
        {
            i18n(name, values);
        }
        else
        {
            i18n(null, name);
        }

    }).all = cache;
    


    flyingon.i18n.set = function (values) {

        cache = flyingon.i18n.all = values || flyingon.create(null);
    };

    

})();