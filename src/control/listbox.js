flyingon.Control.extend('ListBox', function (base) {



    this.defaultWidth = 200;

    this.defaultHeight = 100;


    this.defaultValue('border', 1);



    function render() {

        this.__template = null;
        this.__data_list && this.renderer.set(this, 'content');
    };



    //选中类型
    //none
    //radio
    //checkbox
    this.defineProperty('checked', 'none', {

        set: render   
    });


    //指定渲染列数
    //0     在同一行按平均宽度渲染
    //大于0 按指定的列数渲染
    this.defineProperty('columns', 1, {

        set: render   
    });


    //是否可清除
    this.defineProperty('clear', false, {

        set: render   
    });


    //子项模板
    this.defineProperty('template', null, {

        set: render   
    });


    //子项高度
    this['item-height'] = this.defineProperty('itemHeight', 21, {

        set: render   
    });



    //列表项集合
    this.defineProperty('items', null, {

        set: function (name, value) {

            //转换成flyingon.DataList
            flyingon.DataList.create(value, set_list, this);
        }
    });


    function set_list(list) {

        this.__data_list = list;
        this.renderer.set(this, 'content');
    };


    //默认选中值
    this.defineProperty('value', '', {

        set: this.__render
    });

    
    //多值时的分隔符
    this.defineProperty('separator', ',');



}).register();