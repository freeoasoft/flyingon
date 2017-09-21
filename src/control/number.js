flyingon.TextBox.extend('Number', function (base) {


    this.__scale = this.__value = 0;


    this.defineProperty('value', 0, {

        set: function (value) {

            this.__value = value;
            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    //小数位数
    this.defineProperty('scale', 0, {

        check: function (value) {

            return this.__scale = (value |= 0) > 0 ? value : 0;
        }
    });


    this.text = function () {

        return this.__value.toFixed(this.__scale);
    };



}).register();