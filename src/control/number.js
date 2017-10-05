//数字控件公用属性, 同时给数字控件及表格数字列使用
flyingon.fragment('f-Number', function (change) {


    //小数位数
    this.defineProperty('digits', 0, {

        dataType: 'int',

        check: function (value) {

            return value > 0 ? value : 0;
        },

        set: change
    });


    //是否显示千分位
    this.defineProperty('thousands', false, {
        
        set: change
    });


    //格式化
    this.defineProperty('format', '', {
        
        set: change
    });


});



flyingon.TextButton.extend('Number', function (base) {



    var round = flyingon.round;



    this.__type = 'up-down';


    this.defaultValue('inputable', true);



    flyingon.fragment('f-Number', this, this.__render_value);



    this.defineProperty('value', 0, {
        
        set: this.__render_value
    });


    this.defineProperty('min', 0, {
        
        set: this.__render_value
    });


    this.defineProperty('max', 0, {
        
        set: this.__render_value
    });


    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value,
            digits = storage.digits,
            any;

        value = round(value, digits, true);

        if (storage.thousands)
        {
            value = value.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

            if (digits > 3)
            {
                any = value.split('.');
                any[1] = any[1].replace(/(\d{3})(?=(\d{1,3})+)/g, '$1,');

                value = any.join('.');
            }
        }
        
        return (any = storage.format) ? any.replace('{0}', value) : value;
    };



    this.__on_click = function (up) {

        this.value(this.value() + (up ? 1 : -1));
    };


    this.__to_value = function (text) {

        if (text = text.match(/[\d,.]+/))
        {
            return parseFloat(text[0].replace(/[,]/g, ''));
        }

        return 0;
    };



}).register();