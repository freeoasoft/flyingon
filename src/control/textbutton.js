flyingon.TextBox.extend('TextButton', function (base) {



    //弹出层控件
    var cache;



    function set_value() {

        this.rendered && this.renderer.set(this, 'value');
    };


    //格式化
    this.defineProperty('format', '', { 
        
        set: set_value
    });


    //是否可输入
    this.defineProperty('inputable', false, { 
        
        set: this.__to_render 
    });


    //按钮图标
    this.defineProperty('icon', '', { 
        
        set: this.__to_render 
    });


    //按钮大小
    this.defineProperty('button', 16, { 
        
        set: this.__to_render 
    });


    //值
    this.defineProperty('value', null, { 
        
        set: set_value 
    });



    this.text = function (value) {

        if (value === void 0)
        {
            var storage = this.__storage || this.__defaults,
                format = storage.format;

            return format ? format.replace('{0}', value) : '' + storage.value;
        }

        this.value(value);
    };



    this.__to_value = function (text) {

        return text;
    };


    this.__on_click = function () {

        this.trigger('button-click');
    };


    this.__get_popup = function () {

        var popup = cache;

        if (popup)
        {
            popup.close('auto');
        }
        else
        {
            popup = cache = new flyingon.Popup();

            popup.autoDispose = false;

            popup.on('closed', function () {

                this.detach(0);
            });

            popup.width('auto').height('auto');
        }

        return popup;
    };



}).register();