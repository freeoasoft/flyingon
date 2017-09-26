flyingon.TextBox.extend('Number', function (base) {


    var pow = Math.pow;


    this.__scale = this.__value = 0;


    this.defineProperty('value', 0, {

        check: function (value) {

            var scale = this.__scale;

            if (scale <= 0)
            {
                return value | 0;
            }

            return (value * scale | 0) / scale;
        },

        set: function (value) {

            this.__value = value;
            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    //小数位数
    this.defineProperty('scale', 0, {

        check: function (value) {

            return this.__scale = (value |= 0) > 0 ? pow(10, value) : 0;
        },

        set: function (value) {

            this.value(this.__value);
        }
    });


    //格式化
    this.defineProperty('format', '', {

        set: function (value) {

            this.__format = value;
        }
    });


    this.text = function () {

        var value = this.__value,
            format = this.__format;

        return format ? format.replace('{0}', value) : '' + value;
    };



}).register();