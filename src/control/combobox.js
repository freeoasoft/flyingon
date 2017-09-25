/**
 * 下拉框定义
 */
flyingon.fragment('f-ComboBox', function () {


    //选中类型
    //none
    //radio
    //checkbox
    this.defineProperty('checked', 'none');



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


    //下拉框宽度
    this['popup-width'] = this.defineProperty('popupWidth', 'default');


    //最大显示项数量
    this['max-items'] = this.defineProperty('maxItems', 10);



    //下拉列表
    this.defineProperty('items', null, {

        set: function (value) {

            //转换成flyingon.DataList
            flyingon.DataList.create(value, this.__set_items, this);
        }
    });


    //设置下拉列表
    this.__set_items = function (list) {

        this.__list = list;
        this.rendered && this.renderer.set(this, 'text');
    };


    //多值时的分隔符
    this.defineProperty('separator', ',');


});



flyingon.TextButton.extend('ComboBox', function (base) {


    
    //缓存的列表控件
    var listbox_cache; 



    this.defaultValue('button', 'f-combobox-button');



    //扩展下拉框定义
    flyingon.fragment('f-ComboBox', this);


    //默认选中值
    this.defineProperty('value', '', {

        set: function () {

            this.__list && this.renderer.set(this, 'text');
        }
    });



    this.text = function () {

        var list = this.__list;

        if (list)
        {
            var storage = this.__storage || this.__defaults;
            return list.text(storage.value, storage.checked === 'checkbox' ? storage.separator || ',' : '');
        }

        return '';
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
            length = this.__list ? this.__list.length : 0;

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

        return listbox_cache = new flyingon.ListBox().on('change', function (e) {
            
            this.target.value(e.value);

            if (this.__checked !== 'checkbox')
            {
                this.popup.close();
            }

            this.target.trigger('change', 'value', e.value);
        });
    };



}).register();