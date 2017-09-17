flyingon.TextButton.extend('ComboBox', function (base) {


    
    //缓存的列表控件
    var listbox_cache; 



    this.defaultValue('button', 'f-combobox-button');



    //指定渲染列数
    //0     在同一行按平均宽度渲染
    //大于0 按指定的列数渲染
    this.defineProperty('columns', 1);


    //是否生成清除项
    this.defineProperty('clear', false);


    //子项模板
    this.defineProperty('template', null);


    //子项高度
    this['item-height'] = this.defineProperty('itemHeight', 21);


    //值字字段名
    this['value-field'] = this.defineProperty('valueField', '');


    //显示字段名
    this['display-field'] = this.defineProperty('displayField', '');


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
        }
    });



    //值类型
    //boolean   布尔类型
    //integer   整数类型
    //number    数字类型
    //string    字符类型
    this.defineProperty('type', 'string');


    //默认选中值
    this.defineProperty('value', '', {

        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });



    //获取选中索引
    this.selectedIndex = function () {

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
                        return i;
                    }
                }

                return -1;
            }

            return items.indexOf(value);
        }

        return -1;
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


    this.text = function () {

        return this.selectedItem('displayField');
    };



    //弹出日历窗口
    this.popup = this.__on_click = function () {

        var popup = this.__get_popup(),
            storage = this.__storage || this.__defaults,
            listbox = this.__get_listbox();

        this.__before_popup(popup, listbox, storage);

        listbox.border(0)
            .columns(storage.columns)
            .clear(storage.clear)
            .template(storage.template)
            .itemHeight(storage.itemHeight)
            .valueField(storage.valueField)
            .displayField(storage.displayField)
            .type(storage.type)
            .items(storage.items)
            .value(storage.value);

        listbox.target = this;
        listbox.popup = popup;

        popup.push(listbox);
        popup.show(this);
    };


    this.__before_popup = function (popup, listbox, storage) {
    };


    this.__get_listbox = function () {

        return listbox_cache = new flyingon.ListBox().on('change', function (e) {
            
            this.target.value(e.value);
            this.popup.close();
        });
    };



}).register();



flyingon.ComboBox.extend('RadioComboBox', function (base) {


    var listbox_cache;


    this.__get_listbox = function () {

        return listbox_cache = new flyingon.RadioListBox().on('change', function (e) {
            
            this.target.value(e.value);
            this.popup.close();
        });
    };


}).register();



flyingon.ComboBox.extend('CheckComboBox', function (base) {



    var listbox_cache;
    

    //多值时的分隔符
    this.defineProperty('separator', ',');




    this.selectedIndex = function () {
        
        var list = [],
            storage = this.__storage,
            items,
            value,
            any;

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
    this.text = function () {

        return this.selectedItem('displayField');
    };




    this.__get_listbox = function () {

        return listbox_cache = new flyingon.CheckListBox().on('change', function (e) {
            
            this.target.value(e.value);
        });
    };


    this.__before_popup = function (popup, listbox, storage) {

        listbox.separator(storage.separator);
    };



}).register();