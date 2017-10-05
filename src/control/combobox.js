/**
 * 下拉框基本属性(同时给下拉框及表格下拉列使用)
 */
flyingon.fragment('f-ComboBox', function (change) {



    //选中类型
    //none
    //radio
    //checkbox
    this.defineProperty('checked', 'none', {

        set: change 
    });



    //指定渲染列数
    //0     在同一行按平均宽度渲染
    //大于0 按指定的列数渲染
    this.defineProperty('columns', 1, {
        
        set: change
    });


    //是否生成清除项
    this.defineProperty('clear', false, {
        
        set: change
    });


    //子项模板
    this.defineProperty('template', null, {
        
        set: change
    });


    //子项高度
    this['item-height'] = this.defineProperty('itemHeight', 21, {
        
        set: change
    });


    //下拉框宽度
    this['popup-width'] = this.defineProperty('popupWidth', 'default', {
        
        set: change
    });


    //最大显示项数量
    this['max-items'] = this.defineProperty('maxItems', 10, {
        
        set: change
    });


    //多值时的分隔符
    this.defineProperty('separator', ',', {
        
        set: change
    });


});



flyingon.TextButton.extend('ComboBox', function (base) {


    
    //缓存的列表控件
    var cache; 



    this.__type = 'f-combobox-button';



    //扩展下拉框定义
    flyingon.fragment('f-ComboBox', this, this.render);



    //下拉列表
    this.defineProperty('items', null, { 
        
        set: function (name, value) {

            //转换成flyingon.DataList
            flyingon.DataList.create(value, set_items, this);
        }
    });


    //设置下拉列表
    function set_items(list) {

        this.__data_list = list;
        this.renderer.set(this, 'value');
    };


    //获取或设置选中值
    this.defineProperty('value', '', {

        set: this.__render_value
    });


    //获取显示文本
    this.text = function (value) {

        if (value === void 0)
        {
            var list = this.__data_list;

            if (list)
            {
                var storage = this.__storage || this.__defaults;
                return list.text(storage.value, storage.checked === 'checkbox' ? storage.separator || ',' : '');
            }

            return '';
        }

        this.value(value);
    };



    //弹出日历窗口
    this.popup = this.__on_click = function () {

        var popup = this.__get_popup(),
            storage = this.__storage || this.__defaults,
            listbox = this.__get_listbox(),
            length,
            height,
            any;

        this.__before_popup(popup, listbox, storage);

        listbox.border(0)
            .checked(listbox.__checked = storage.checked)
            .columns(any = storage.columns)
            .clear(storage.clear)
            .template(storage.template)
            .itemHeight(height = storage.itemHeight)
            .width(storage.popupWidth)
            .separator(storage.separator)
            .items(storage.items)
            .value(storage.value);

        if (any > 0)
        {
            length = this.__data_list ? this.__data_list.length : 0;

            if (storage.clear)
            {
                length++;
            }

            length = Math.min(length, storage.maxItems);

            if (any > 1)
            {
                length = (length + any - 1) / any | 0;
            }

            height *= length;
        }

        listbox.height(height + 2);

        listbox.target = this;
        listbox.popup = popup;

        popup.push(listbox);
        popup.show(this);
    };


    this.__before_popup = function (popup, listbox, storage) {
    };


    this.__get_listbox = function () {

        return cache = new flyingon.ListBox().on('change', function (e) {
            
            this.target.value(e.value);

            if (this.__checked !== 'checkbox')
            {
                this.popup.close();
            }

            this.target.trigger('change', 'value', e.value);
        });
    };



}).register();