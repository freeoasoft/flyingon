flyingon.Control.extend('ListBox', function (base) {



    this.defaultWidth = 200;

    this.defaultHeight = 100;


    this.defaultValue('border', 1);



    function define(self, name, defaultValue, clear) {

        return self.defineProperty(name, defaultValue, {

            set: function () {

                this.__template = null;
                this.__list && this.renderer.set(this, 'content');
            }
        });
    };



    //选中类型
    //none
    //radio
    //checkbox
    define(this, 'checked', 'none');


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



    //列表项集合
    this.defineProperty('items', null, {

        set: function (value) {

            //转换成flyingon.DataList
            flyingon.DataList.create(value, set_list, this);
        }
    });


    function set_list(list) {

        this.__list = list;
        this.rendered && this.renderer.set(this, 'content');
    };


    //默认选中值
    this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'change');
        }
    });

    
    //多值时的分隔符
    this.defineProperty('separator', ',');



}).register();