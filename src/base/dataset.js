//行集合类
flyingon.RowCollection = Object.extend._(function () {
    

    //记录数
    this.length = 0;

    
    //查找数据行
    this.find = function (filter) {
    
        var list = new flyingon.RowCollection(),
            index = 0,
            length = this.length,
            row;
        
        for (var i = 0; i < length; i++)
        {
            if ((row = this[i]) && (!filter || filter(row)))
            {
                list[index++] = row;
            }
        }
        
        list.length = index;
        return list;
    };
    
        
    //查找所有下级行
    this.findAll = function (filter) {

        var list = arguments[1] || new flyingon.RowCollection(),
            row;
        
        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((row = this[i]) && (!filter || filter(row)))
            {
                list[list.length++] = row;
            }
            
            if (row.length > 0)
            {
                row.findAll(filter, list);
            }
        }
        
        return list;
    };
    
            
    this.toJSON = function (change, names) {
        
        var writer = ['['],
            row,
            data,
            tag,
            any;
        
        if (change && names)
        {
            if (typeof names === 'string')
            {
                names = names.match(/\w+/g);
            }
            
            names = names && names.length > 0 ? new RegExp('^(' + names.join('|') + ')$', 'i') : null;
        }
        
        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((row = this[i]) && (data = row.data))
            {
                if (tag)
                {
                    writer.push(',');
                }
                else
                {
                    tag = true;
                }
                
                if (change && (any = row.originalData))
                {
                    write_change(writer, data, any, names, this.tables);
                }
                else
                {
                    write_object(writer, data);
                }
            }
        }
        
        writer.push(']');
        
        return writer.join('');
    };
    
    
    function write_object(writer, data) {
        
        var tag;
        
        writer.push('{');
        
        for (var name in data)
        {
            if (tag)
            {
                writer.push(',');
            }
            else
            {
                tag = true;
            }
            
            writer.push('"', name, '":');
            write_value(writer, data[name]);
        }
        
        writer.push('}');
    };
    
    
    function write_array(writer, data) {
        
        writer.push('[');
        
        for (var i = 0, l = data.length; i < l; i++)
        {
            if (i > 0)
            {
                writer.push(',');
            }

            write_value(writer, data[i]);
        }
        
        writer.push(']');
    };
    
    
    function write_value(writer, value) {
    
        if (value == null)
        {
            writer.push('null');
            return;
        }

        switch (typeof value)
        {
            case 'string':
                writer.push('"', value.replace(/"/g, '\\"'), '"');
                break;

            case 'object':
                if (value instanceof Array)
                {
                    write_array(writer, value);
                }
                else if (value instanceof Date)
                {
                    writer.push('"', value, '"');
                }
                else
                {
                    write_object(writer, value);
                }
                break;

            default:
                writer.push(value);
                break;
        }
    };
    
    
    function write_change(writer, data, originalData, names, tables) {
        
        var value, oldValue;
        
        writer.push('{');
        
        for (var name in data)
        {
            value = data[name];
            oldValue = originalData[name];
            
            if (value !== oldValue || names && names.test(name))
            {
                if (value == null)
                {
                    writer.push('"', name, '":null', ',');
                    continue;
                }
                
                switch (typeof value)
                {
                    case 'string':
                        writer.push('"', name, '":"', value.replace(/"/g, '\\"'), '"', ',');
                        break;

                    case 'object':
                        if (tables && (oldValue = tables[name]))
                        {
                            oldValue = oldValue.toJSON(true);
                            
                            if (oldValue.length > 2)
                            {
                                writer.push('"', name, '":', oldValue, ',');
                            }
                        }
                        else 
                        {
                            writer.push('"', name, '":');
                            
                            if (value instanceof Array)
                            {
                                write_array(writer, value);
                            }
                            else if (value instanceof Date)
                            {
                                writer.push('"', value, '"');
                            }
                            else
                            {
                                write_object(writer, value);
                            }
                            
                            writer.push(',');
                        }
                        break;

                    default:
                        writer.push('"', name, '":', value, ',');
                        break;
                }
            }
        }
        
        writer.push(writer.pop() === ',' ? '}' : '{}');
    };
    
    
});



//数据集功能片段
flyingon.fragment('f-dataset', function () {
    
    
        
    //加载数据
    this.load = function (list, primaryKey) {
        
        var dataset = this.dataset;
        
        (dataset || this).__load_data(dataset ? this : null, list, primaryKey);        
        return this;
    };
    
    
    //加载树型数据
    this.loadTreeList = function (list, primaryKey, childrenName) {
        
        var dataset = this.dataset;
        
        (dataset || this).__load_data(dataset ? this : null, list, primaryKey, '', childrenName || 'children');        
        return this;
    };


    //扩展集合操作功能
    flyingon.fragment('f-collection', this);
    
    
    //插入子项
    this.__check_items = function (index, items, start) {

        var Class = flyingon.DataRow,
            rows = [],
            dataset = this.dataset,
            parent = null,
            keys1,
            keys2,
            primaryKey,
            row,
            data;
                
        if (dataset)
        {
            parent = this;
        }
        else
        {
            dataset = this;
        }

        keys1 = dataset.__keys1;
        keys2 = (primaryKey = dataset.primaryKey) && dataset.__keys2;

        for (var i = start, l = items.length; i < l; i++)
        {
            if ((data = items[i]) && data.dataset)
            {
                row = data;
            }
            else
            {
                row = new Class();
            
                row.dataset = dataset;
                row.parent = parent;
                row.data = data = data || {};
                row.state = 'add';
            }
            
            keys1[row.uniqueId = dataset.__new_id++] = row;
            
            if (primaryKey)
            {
                keys2[row.id = data[primaryKey]] = row;
            }
        
            dataset.__change_rows.push(row);
            rows.push(row);
        }

        dataset.trigger('add', 'parent', parent, 'index', index, 'rows', rows);
    };


    //移除子项
    this.__remove_items = function (index, items) {

        var dataset = this.dataset,
            parent = null,
            keys1,
            keys2,
            primaryKey,
            row;
                    
        if (dataset)
        {
            parent = this;
        }
        else
        {
            dataset = this;
        }

        keys1 = dataset.__keys1;
        keys2 = dataset.primaryKey && dataset.__keys2;

        dataset.trigger('remove', 'parent', parent, 'index', index, 'rows', items);

        for (var i = 0, l = items.length; i < l; i++)
        {
            row = this[i];
 
            delete keys1[row.uniqueId];

            if (primaryKey)
            {
                delete keys2[row.id];
            }

            row.dataset = row.parent = null;
        }

        if (row.uniqueId === dataset.__current_id)
        {
            dataset.moveTo(this[index] || this[--index]);
        }
    };

    
    //删除指定属性
    this.removeProperty = function (name) {
     
        if (name)
        {
            var row, data;
        
            for (var i = this.length - 1; i >= 0; i--)
            {
                if ((row = this[i]) && (data = row.data))
                {
                    delete data[name];
                    
                    if (data = row.originalData)
                    {
                        delete data[name];
                    }
                    
                    if (row.length > 0)
                    {
                        row.removeProperty(name);
                    }
                }
            }
        }
        
        return this;
    };
    
    
});



//数据行基类
flyingon.DataRow = Object.extend._(flyingon.RowCollection, function () {
    
    

    //默认事件
    var default_event = new flyingon.Event();
    
        

    //所属数据集
    this.dataset = null;
    
    //父级行
    this.parent = null;
    
    
    //id
    this.id = null;

    //唯一id
    this.uniqueId = 0;
    
    
    //当前数据
    this.data = null;
    
    
    //原始数据
    this.originalData = null;
    
        
    //数据行状态
    //normal        未变更状态
    //add           增加状态
    //change        已修改状态
    this.state = 'normal';
                
    
                
    //获取指定列的值
    this.get = function (name) {
        
        var data;
        
        if (data = name && this.data)
        {
            return data[name];                
        }
    };
    

    //获取指定列的原始值
    this.originalValue = function (name) {

        var data;
        
        if (name && (data = this.originalData || this.data))
        {
            return data[name];
        }
    };
    
    
    //设置指定列的值
    this.set = function (name, value, trigger) {
        
        var data, oldValue;
        
        //不允许设置值为undefined
        if (name && value !== void 0 && (data = this.data) && value !== (oldValue = data[name]))
        {
            var dataset = this.dataset, 
                event, 
                key, 
                any;
            
            if (trigger !== false)
            {
                event = default_event;
                event.type = 'change';
                event.row = this;
                event.name = name;
                event.value = value;
                event.oldValue = oldValue;
                
                if (dataset.trigger(event) === false)
                {
                    return this;
                }
                
                if ((any = event.value) !== value && any !== void 0)
                {
                    value = any;
                }
            }
            
            if (this.state === 'normal')
            {
                this.originalData = any = {};

                for (key in data)
                {
                    any[key] = data[key];
                }

                this.state = 'change';

                dataset.__change_rows.push(this);
            }

            data[name] = value;

            //触发变更动作
            dataset.dispatch('change', this, name);
        }
        
        return this;
    };
    
    
    //回滚指定值
    this.rollback = function (name) {
        
        var data = name && this.originalData;
        
        if (data)
        {
            this.data[name] = data[name];
        }
    };
    
    
    
    //从所属行集中移除当前行
    this.remove = function () {
        
        var parent = this.parent || this.dataset;
        
        if (parent)
        {
            parent.splice(parent.indexOf(this), 1);
        }
        
        return this;
    };
    
    
    
    //扩展数据集功能
    flyingon.fragment('f-dataset', this);
    

    
    //获取树级别
    this.level = function () {
     
        var level = 0,
            parent = this;
        
        while (parent = parent.parent)
        {
            level++;
        }
        
        return level;
    };
    
    
    //统计所有子节点的数量
    this.total = function () {
        
        var length = this.length,
            count = length;
        
        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                var row = this[i];
                
                if (row.length > 0)
                {
                    count += row.count();
                }
            }
        }
        
        return count;
    };
    
    
        
});



//数据集
flyingon.DataSet = flyingon.defineClass(flyingon.RowCollection, function () {
    
    
    
    this.init = function () {
       
        //id生成器
        this.__new_id = 1;
        
        //uniqueId集合
        this.__keys1 = flyingon.create(null);
        
        //id集合
        this.__keys2 = flyingon.create(null);
        
        //变更的数据行集合
        this.__change_rows = [];
    };
    


    //主键
    this.primaryKey = '';

    
        
    //扩展数据集功能
    flyingon.fragment('f-dataset', this);
    
    
    
        
    //从二维关系表加载树型数据
    this.loadTreeFromList = function (list, primaryKey, parentKey) {
        
        return this.__load_data(null, list, this.primaryKey = primaryKey || 'id', parentKey || 'parentId');
    };
    
    
    //加载数据内部方法
    this.__load_data = function (parent, list, primaryKey, parentKey, childrenName) {

        if (list && list.length > 0)
        {
            this.__new_id = load_data(this, 
                parent, 
                list, 
                this.primaryKey = primaryKey, 
                parentKey, 
                childrenName, 
                this.__new_id++);
            
            this.trigger('load', 'parent', parent);
        }
        
        return this;
    };
    
    
    function load_data(dataset, parent, list, primaryKey, parentKey, childrenName, uniqueId) {
      
        var target = parent || dataset,
            rowType = flyingon.DataRow,
            keys1 = dataset.__keys1,
            keys2 = dataset.__keys2,
            index = target.length,
            length = list.length,
            data,
            row,
            id;
            
        for (var i = 0; i < length; i++)
        {
            row = new rowType();
            row.dataset = dataset;
            
            if (parent)
            {
                row.parent = parent;
            }
            
            row.data = data = list[i] || {};
            
            keys1[row.uniqueId = uniqueId++] = row;
            
            if (primaryKey)
            {
                keys2[row.id = data[primaryKey]] = row;
            }
                        
            if (!parentKey)
            {
                target[index++] = row;
                
                if (childrenName && (data = data[childrenName]) && data.length > 0)
                {
                    uniqueId = load_data(dataset, row, data, primaryKey, null, childrenName, uniqueId)
                }
            }
        }

        if (parentKey)
        {
            for (var i = 0; i < length; i++)
            {
                data = list[i];
                row = keys2[data[primaryKey]];
                
                if (parent = keys2[data[parentKey]])
                {
                    row.parent = parent;
                    parent[parent.length++] = row;
                }
                else
                {
                    dataset[index++] = row;
                }
            }
        }

        target.length = index;
        
        return uniqueId;
    };
    
    
    //获取或设置当前行
    this.current = function () {
        
        var id = this.__current_id;
        return id && this.__keys1[id] || null;
    };
    
    
    //移动到第一行
    this.first = function () {
        
        var row = this[0];
        
        if (row)
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到上一行
    this.previous = function () {
        
        var row = this.current(),
            parent = row && row.parent || this,
            index = row ? parent.indexOf(row) - 1 : 0;
        
        if (row = parent[index])
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到下一行
    this.next = function () {
        
        var row = this.current(),
            parent = row && row.parent || this,
            index = row ? parent.indexOf(row) + 1 : 0;
        
        if (row = parent[index])
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到最后一行
    this.last = function () {
        
        var row = this[this.length - 1];
        
        if (row)
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到指定行
    this.moveTo = function (row) {
        
        var id = this.__current_id,
            oldValue = id && this.__keys1[id] || null;
        
        if (oldValue !== row && this.trigger('move', 'value', row, 'oldValue', oldValue) !== false)
        {
            this.__current_id = row && row.uniqueId;

            //触发当前行移动动作
            this.dispatch('move', row);
        }
        
        return this;
    };
    
    
    
    //通过id查找数据行
    this.id = function (id) {
        
        return this.__keys2(id) || null;
    };
    
    
    //通过唯一id查找数据行
    this.uniqueId = function (id) {
        
        return this.__keys1[id] || null;
    };
    
        
    
    //获取变更的数据行
    this.getChanges = function (state) {
    
        var list = new flyingon.RowCollection(),
            rows = this.__change_rows,
            length = rows.length;
        
        if (length > 0)
        {
            if (state && typeof state === 'string')
            {
                var index = 0,
                    row;

                for (var i = 0; i < length; i++)
                {
                    if ((row = rows[i]) && state.indexOf(row.state) >= 0)
                    {
                        list[index++] = row;
                    }
                }

                list.length = index;
            }
            else
            {
                rows.push.apply(list, rows);
            }
        }
        
        return list;
    };
    
    
    //接收所有修改
    this.acceptChanges = function () {
        
        var rows = this.__change_rows,
            length = rows.length,
            row;
        
        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (row = rows[i])
                {
                    row.originalData = null;
                    row.state = 'normal';
                }
            }
            
            rows.length = 0;
        }
        
        return this;
    };
  
    
    //拒绝所有修改
    this.rejectChanges = function () {
        
        var rows = this.__change_rows,
            length = rows.length,
            row,
            data,
            any;
        
        if (length > 0)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                if (row = rows[i])
                {
                    if (any = row.originalData)
                    {
                        data = row.data;

                        for (var name in any)
                        {
                            data[name] = any[name];
                        }

                        row.originalData = null;
                        row.state = 'normal';

                        this.dispatch('change', row);
                    }
                    else
                    {
                        row.remove();
                    }
                }
            }
            
            rows.length = 0;
        }
        
        return this;
    };
    
    
    
    //订阅或取消订阅变更动作
    this.subscribe = function (control, cancel) {
        
        if (control && control.subscribeBind)
        {
            var list = this.__subscribe,
                index;
            
            if (list)
            {
                index = list.indexOf(control);
                
                if (cancel)
                {
                    if (index >= 0)
                    {
                        list.splice(index, 1);
                    }
                }
                else if (index < 0)
                {
                    list.push(control);
                }
            }
            else if (!cancel)
            {
                (this.__subscribe = []).push(control);
            }
        }

        return this;
    };


    

    var action_cache = { type: '', row: null, name: null, current: false };
    
    
    //派发变更动作
    this.dispatch = function (type, row, name) {
        
        var list;
        
        if (type && (list = this.__subscribe))
        {
            var action = action_cache,
                current;

            action.type = type;
            action.name = name || null;

            if (action.row = row)
            {
                current = row ? row.uniqueId === this.__current_id : false;
            }
            else
            {
                action.row = this.current();
                current = true;
            }

            for (var i = 0, l = list.length; i < l; i++)
            {
                if (current || list[i].__subscribe_all)
                {
                    list[i].subscribeBind(this, action);
                }
            }
        }

        return this;
    };
    
    
    //绑定数据源
    this.bind = function () {
        
        var row;
        
        if (!this.__current_id && (row = this[0]))
        {
            this.__current_id = row && row.uniqueId;
        }
        
        this.dispatch('bind');
        return this;
    };


    //添加或移除表达式
    this.expression = function (name, get, set) {

        var keys;

        if (name && typeof name === 'string')
        {
            if (typeof get === 'function')
            {
                if (typeof set !== 'function')
                {
                    set = null;
                }

                keys = this.__expression_keys || (this.__expression_keys = flyingon.create(null));
                keys[name] = [get, set];
            }
            else if (keys = this.__expression_keys)
            {
                delete keys[name];
            }
        }

        return this;
    };


    //获取绑定值
    this.getBindingValue = function (name, action) {

        var any = this.__expression_keys;

        if (any && (any = any[name]))
        {
            return any[0].call(this, action.row);
        }

        any = (any = action.row.data) && any[name];
        return any !== void 0 ? any : '';
    };


    //设置绑定值
    this.setBindingValue = function (name, value, row) {

        var any = this.__expression_keys;

        if (any && (any = any[name]))
        {
            if (any = any[1])
            {
                any.call(this, value, row || this.current());
            }
        }
        else
        {
            (row || this.current()).set(name, value);
        }

        return this;
    };

    
        
}, false);