flyingon.TextBox.extend('TimePicker', function (base) {


    //值
    this.defineProperty('value', '', {
        
        check: function (value) {

            if (value && (value = value.match(/\d+/g)))
            {
                value.length = 3;

                value[1] |= 0;
                value[2] |= 0;

                return value.join(':');
            }

            return '';
        },

        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }

    });


    //格式化
    this.defineProperty('format', '', {
        
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value,
            format;

        if (value && (format = storage.format))
        {
            value = value.split(':');
            return new Date(2000, 1, 1, value[0] | 0, value[1] | 0, value[2] | 0).format(format);
        }

        return value;
    };



}).register();