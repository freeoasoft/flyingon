//可绑定对象片段
flyingon.__bindable_fragment = flyingon.fragment(function () {
    
    

    //数据集
    this.defineProperty('dataset', null, {
        
        fn: function (value) {

            var oldValue = this.__dataset || null;

            if (value === void 0)
            {
                return oldValue;
            }

            if (oldValue === value)
            {
                return this;
            }

            if (this.__watch_list && flyingon.__do_watch(this, name, value) === false)
            {
                return this;
            }

            this.__dataset = value;

            if (oldValue) 
            {
                oldValue.subscribe(this, true);
            }

            if (value) 
            {
                value.subscribe(this);
            }

            return this;
        }
    });
    
    
    //添加属性绑定
    //text: 以"{{"开始及以"}}"结束的字符串
    this.addBind = function (name, fieldName) {
        
        if (name && fieldName)
        {
            (this.__bind_keys || (this.__bind_keys = {}))[name] = fieldName;
        }
        
        return this;
    };
    
    
    //移除属性绑定
    this.removeBind = function (name) {
        
        var bind = this.__bind_keys;
        
        if (bind)
        {
            delete bind[name];
        }
        
        return this;
    };

    
    //仅订阅数据集当前行变更动作
    this.subscribeCurrent = true;
    
    
    //接收数据集变更动作处理
    this.ondatareceive = function (dataset, action) {
        
        var keys, name, any;
        
        if (action && (keys = this.__bind_keys))
        {
            name = action.name;

            for (var key in keys)
            {
                if (!name || keys[key] === name)
                {
                    any = name || keys[key];

                    //禁止自身回推
                    keys[key] = '';

                    try
                    {
                        this.set(key, dataset.getBindingValue(any, action));
                    }
                    finally
                    {
                        //回退缓存
                        keys[key] = any;
                    }
                }
            }
        }
        
        return this;
    };
    
    
    //回推数据至数据集
    this.pushBack = function (name, value) {
        
        var target = this,
            dataset;
 
        do
        {
            if (dataset = target.__dataset)
            {
                dataset.setBindingValue(name, value);
                return this;
            }
        }
        while (target = target.parent);

        return this;
    };

    
    
}, true);