/**
 * 下拉框定义
 */
flyingon.fragment('f-ComboTree', function () {



    //树风格
    //default   默认风格
    //blue      蓝色风格
    //plus      加减风格
    //line      线条风格
    this.defineProperty('theme', 'default');


    //是否显示检查框
    this.defineProperty('checked', false);


    //是否显示图标
    this.defineProperty('icon', true);


    //子项高度
    this['item-height'] = this.defineProperty('itemHeight', 21);


    //下拉框宽度
    this['popup-width'] = this.defineProperty('popupWidth', 'default');


  
});



flyingon.TextButton.extend('ComboTree', function (base) {


    
    //缓存的树控件
    var tree_cache; 



    this.defaultValue('icon', 'f-combotree-button');



    //扩展下拉框定义
    flyingon.fragment('f-ComboTree', this);


    //默认选中值
    this.defineProperty('value', '', {

        set: function () {

            this.__list && this.renderer.set(this, 'value');
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
            tree = this.__get_tree(),
            length,
            height,
            any;

        this.__before_popup(popup, tree, storage);

        tree.border(0)
            .checked(tree.__checked = storage.checked)
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

        tree.height(height + 2);

        tree.target = this;
        tree.popup = popup;

        popup.push(tree);
        popup.show(this);
    };


    this.__before_popup = function (popup, tree, storage) {
    };


    this.__get_tree = function () {

        return tree_cache = new flyingon.tree().on('change', function (e) {
            
            this.target.value(e.value);

            if (this.__checked !== 'checkbox')
            {
                this.popup.close();
            }

            this.target.trigger('change', 'value', e.value);
        });
    };



}).register();