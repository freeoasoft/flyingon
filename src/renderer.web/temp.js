
    //注册style
    this.__registry_style = function (name, check) {

        var any;

        if (check !== false)
        {
            check = flyingon.css_name(name, false);

            if (any = check.name)
            {
                if (any !== name)
                {
                    this[name] = 2; //设置前缀样式

                    style_prefix[name] = any;
                    css_prefix[name] = any.css;

                    return;
                }
            }
            else
            {
                this[name] = check.set ? 9 : false; //支持自定义set则调用flyingon.css_value,否则不处理
                return;
            }
        }

        any = name.replace(/([A-Z])/g, '-$1').toLowerCase();

        this[name] = any === name ? 1 : 2;

        style_prefix[name] = name;
        css_prefix[name] = any;
    };


    //注册attribute
    this.__registry_attribute = function (name, defaultValue) {

        this[name] = typeof defaultValue === 'boolean' ? 12 : 11;
    };

