/**
 * @class f-bindable
 * @extension
 * @description 可绑定功能片段
 */
flyingon.fragment('f-bindable', function () {
    
    

    /**
     * @method dataset
     * @description 获取或设置关联的数据集
     * @param {?flyingon.DataSet=} value 未传入值时表示获取值, 否则表示设置值
     * @return {(?flyingon.DataSet|object)} 获取值时返回数据集对象或null, 否则返回当前对象实例
     */
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
    
    
    /**
     * @method addBind
     * @description 添加属性绑定
     * @param {string} name 属性名
     * @param {string} fieldName 数据集字段名
     * @return {object} 当前实例对象
     */
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
    
    
    /**
     * @method removeBind
     * @description 移除属性绑定
     * @param {string} name 属性名
     * @return {object} 当前实例对象
     */
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

    
    /**
     * @method subscribeBind
     * @description 接收数据集变更动作处理
     * @param {flyingon.DataSet} dataset 数据集
     * @param {object} action 数据集动作 { name: string, row: DataRow }
     * @return {object} 当前实例对象
     */
    this.subscribeBind = function (dataset, action) {
        
        var watches = this.__watches;
        
        if (watches)
        {
            var bind = action.name, 
                key, 
                any;

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
    
    
    /**
     * @method pushBack
     * @description 回推数据至数据集
     * @param {string} name 属性名
     * @param {any} value 属性值
     * @return {object} 当前实例对象
     */
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