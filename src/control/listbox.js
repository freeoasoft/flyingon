flyingon.Control.extend('ListBox', function (base) {



    this.defaultWidth = 200;

    this.defaultHeight = 100;


    this.defaultValue('border', 1);



    function define(self, name, defaultValue, clear) {

        return self.defineProperty(name, defaultValue, {

            set: function () {

                this.__template = null;
                this.rendered && this.renderer.set(this, 'content');
            }
        });
    };



    //指定渲染列数
    //0     在同一行按平均宽度渲染
    //大于0 按指定的列数渲染
    define(this, 'columns', 1);


    //是否可清除
    define(this, 'clear', false);


    //子项模板
    define(this, 'template', null);


    //子项高度
    this['item-height'] = define(this, 'itemHeight', 21);


    //值字字段名
    this['value-field'] = this.defineProperty('valueField', '', {

        set: function () {

            this.__template = null;

            if (!this.__use_index)
            {
                this.__selectedIndex = void 0;
            }

            this.rendered && this.renderer.set(this, 'content');
        }
    });


    //显示字段名
    this['display-field'] = define(this, 'displayField', '');



    //列表项集合
    this.defineProperty('items', null, {

        check: function (value) {

            if (value)
            {
                if (typeof value === 'string')
                {
                    value = flyingon.parseJSON(value);
                }

                return value instanceof Array ? value : [value];
            }

            return null;
        },

        set: function () {

            this.rendered && this.renderer.set(this, 'content');
        }
    });


    //默认选中索引
    this.defineProperty('index', -1, {

        dataType: 'integer',

        set: function (value) {

            //标记使用索引定位
            this.__use_index = true;

            this.__selectedIndex = value;
            this.rendered && this.renderer.set(this, 'change');
        }
    });


    //值类型
    //boolean   布尔类型
    //integer   整数类型
    //number    数字类型
    //string    字符类型
    this.defineProperty('type', 'string', {

        set: function () {

            if (!this.__use_index)
            {
                this.__selectedIndex = void 0;
            }

            this.rendered && this.renderer.set(this, 'change');
        }
    });


    //默认选中值
    this.defineProperty('value', '', {

        set: function () {

            //标记不使用索引定位
            this.__use_index = false;
            this.__selectedIndex = void 0;

            this.rendered && this.renderer.set(this, 'change');
        }
    });



    //获取选中索引
    this.selectedIndex = function () {

        var index = this.__selectedIndex;

        if (index === void 0)
        {
            var storage = this.__storage,
                items,
                name,
                value;

            if (storage && (items = storage.items) && items.length > 0)
            {
                value = storage.value;

                switch (storage.type)
                {
                    case 'boolean':
                        value = !!value && value !== false;
                        break;
                    
                    case 'integer':
                        value |= 0;
                        break;

                    case 'number':
                        value = +value;
                        break;
                }

                if (name = storage.valueField)
                {
                    for (var i = 0, l = items.length; i < l; i++)
                    {
                        if ((storage = items[i]) && storage[name] === value)
                        {
                            return this.__selectedIndex = i;
                        }
                    }

                    return this.__selectedIndex = -1;
                }

                return this.__selectedIndex = items.indexOf(value);
            }

            return -1;
        }

        return index;
    };


    //获取选中项
    this.selectedItem = function (field) {

        var storage = this.__storage,
            item = storage && (item = storage.items) && item[this.selectedIndex()];
        
        if (field)
        {
            if (field = storage && storage[field])
            {
                item = item ? item[field] : '';
            }

            return item !== void 0 ? '' + item : '';
        }

        return item;
    };


    //获取选中值
    this.selectedValue = function () {

        return this.selectedItem('valueField');
    };


    this.selectedText = function () {

        return this.selectedItem('displayField');
    };



}).register();




flyingon.ListBox.extend('RadioListBox', function (base) {


    this.__list_type = 'radio';


}).register();




flyingon.ListBox.extend('CheckListBox', function (base) {



    this.__list_type = 'checkbox';



    //默认选中索引
    this.defineProperty('index', null, {

        check: function (value) {

            if (value)
            {
                if (value > 0)
                {
                    return [vlaue | 0];
                }

                if (value instanceof Array)
                {
                    return value;
                }

                if (typeof value === 'string' && (value = value.match(/\d+/g)))
                {
                    for (var i = value.length - 1; i >= 0; i--)
                    {
                        value[i] |= 0;
                    }
                }
            }
            else if (value === 0)
            {
                return [0];
            }
            
            return null;
        },

        set: function (value) {

            //标记使用索引定位
            this.__use_index = true;

            this.__selectedIndex = value;
            this.rendered && this.renderer.set(this, 'content');
        }
    });


    //多值时的分隔符
    this.defineProperty('separator', ',', {

        set: function () {

            if (!this.__use_index)
            {
                this.__selectedIndex = void 0;
                this.rendered && this.renderer.set(this, 'change');
            }
        }
    });



    this.selectedIndex = function () {
        
        var list = this.__selectedIndex;

        if (list === void 0)
        {
            var storage = this.__storage,
                items,
                value,
                any;

            this.__selectedIndex = list = [];

            if (storage && (items = storage.items) && items.length > 0 && (value = storage.value))
            {
                value = storage.value.split(storage.separator);

                any = storage.type;

                if (any !== 'string')
                {
                    for (var i = value.length - 1; i >= 0; i--)
                    {
                        switch (any)
                        {
                            case 'boolean':
                                value[i] = !!value[i] && value[i] !== false;
                                break;

                            case 'integer':
                                value[i] |= 0;
                                break;

                            case 'number':
                                value[i] = +value[i];
                                break;
                        }
                    }
                }

                storage.selected = list;

                if (any = storage.valueField)
                {
                    for (var i = 0, l = items.length; i < l; i++)
                    {
                        if ((storage = items[i]) && value.indexOf(storage[any]) >= 0)
                        {
                            list.push(i);
                        }
                    }
                }
                else
                {
                    for (var i = 0, l = items.length; i < l; i++)
                    {
                        if (value.indexOf(items[i]) >= 0)
                        {
                            list.push(i);
                        }
                    }
                }
            }
        }

        return list;
    };


    //获取选中项集合
    this.selectedItem = function (field) {

        var list = [],
            storage = this.__storage,
            name = field && storage[field],
            items,
            item,
            selected,
            length;

        if (storage && (items = storage.items) && (selected = this.selectedIndex()) && (length = selected.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                item = items[selected[i]];

                if (name)
                {
                    item && list.push(item[name]);
                }
                else
                {
                    list.push(item);
                }
            }
        }

        return field ? list.join() : list;
    };


    //获取选中项集合
    this.selectedValue = function () {

        return this.selectedItem('valueField');
    };


    //获取选中项集合
    this.selectedText = function () {

        return this.selectedItem('displayField');
    };



}).register();