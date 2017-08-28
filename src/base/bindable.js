//可绑定功能片段
flyingon.fragment('f-bindable', function () {
    
    

    //数据集
    this.defineProperty('dataset', null, {
        
        fn: function (value) {

            var any = this.__dataset || null;

            if (value === void 0)
            {
                return any;
            }

            if (any === value)
            {
                return this;
            }

            if (this.__watch_list && flyingon.__do_watch(this, 'dataset', value) === false)
            {
                return this;
            }

            this.__dataset = value;

            if (any) 
            {
                any.subscribe(this, true);
            }

            if (value) 
            {
                value.subscribe(this);
            }

            return this;
        }
    });
    
    
    //添加属性绑定
    this.addBind = function (name, fieldName) {
        
        if (name && fieldName)
        {
            var watches = this.__watches || (this.__watches = {}),
                any;

            if (any = watches[name])
            {
                any[0] = fieldName;
            }
            else
            {
                watches[name] = [fieldName];
            }
        }
        
        return this;
    };
    
    
    //移除属性绑定
    this.removeBind = function (name) {
        
        var watches = this.__watches,
            any;
        
        if (watches && (any = watches[name]) && any[0])
        {
            if (any[1])
            {
                any[0] = '';
            }
            else
            {
                delete watches[name];
            }
        }
        
        return this;
    };

    
    //接收数据集变更动作处理
    this.subscribeBind = function (dataset, action) {
        
        var watches, bind, key, any;
        
        if (action && action.current && (watches = this.__watches))
        {
            bind = action.name;

            for (var name in watches)
            {
                if ((any = watches[name]) && (key = any[0]) && (!bind || key === bind))
                {
                    //禁止自身回推
                    any[0] = '';

                    try
                    {
                        this.set(name, dataset.getBindingValue(key, action));
                    }
                    finally
                    {
                        //回退缓存
                        any[0] = key;
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

    
    
});