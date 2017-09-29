flyingon.TextBox.extend('Number', function (base) {


    //注: 不同浏览器toFixed有差异, chrome使用的是银行家舍入规则
    //银行家舍入: 所谓银行家舍入法, 其实质是一种四舍六入五取偶(又称四舍六入五留双)法
    //简单来说就是: 四舍六入五考虑, 五后非零就进一, 五后为零看奇偶, 五前为偶应舍去, 五前为奇要进一

    var pow = Math.pow;

    var round = Math.round;



    this.defineProperty('value', 0, { set: render });


    //小数位数
    this.defineProperty('scale', 0, {

        dataType: 'int',

        check: function (value) {

            return value > 0 ? value : 0;
        },

        set: render
    });


    //是否显示千分位
    this.defineProperty('thousands', false, { set: render });


    //格式化
    this.defineProperty('format', '', { set: render });



    function render() {

        this.rendered && this.renderer.set(this, 'value');
    };


    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value,
            scale = storage.scale,
            any;

        if (scale > 0)
        {
            any = pow(10, scale);

            //先四舍五入处理toFixed浏览器差异
            //此处不能用a + 0.5 | 0的方法来进行四舍五入运算,位运算精度太小
            value = (round(value * any) / any).toFixed(scale); 
        }
        else
        {
            value = '' + (value | 0);
        }

        if (storage.thousands)
        {
            value = value.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

            if (any > 3)
            {
                any = value.split('.');
                any[1] = any[1].replace(/(\d{3})(?=(\d{1,3})+)/g, '$1,');

                value = any.join('.');
            }
        }
        
        return (any = storage.format) ? any.replace('{0}', value) : value;
    };



    this.__to_value = function (text) {

        if (text = text.match(/[\d,.]+/))
        {
            return parseFloat(text[0].replace(/[,]/g, ''));
        }

        return 0;
    };



}).register();