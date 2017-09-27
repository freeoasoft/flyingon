flyingon.Control.extend('TextButton', function (base) {



    //弹出层控件
    var popup_cache;


    function define(self, name, defaultValue, key) {

        return self.defineProperty(name, defaultValue, {

            set: function (value) {
    
                this.rendered && this.renderer.set(this, key || name, value);
            }
        });
    };


    //值
    define(this, 'value', null, 'text');


    //格式化
    define(this, 'format', '', 'text');


    //是否可输入
    define(this, 'inputable', false);



    this.text = function (value) {

        if (value === void 0)
        {
            var storage = this.__storage || this.__defaults,
                format = storage.format;

            return format ? format.replace('{0}', value) : '' + storage.value;
        }

        this.value(value);
    };



    //按钮图片
    define(this, 'button', '');


    //按钮大小
    this['button-size'] = define(this, 'buttonSize', 16);



    flyingon.fragment('f-textbox', this);



    this.__to_value = function (text) {

        return text;
    };


    this.__on_click = function () {

        this.trigger('button-click');
    };


    this.__get_popup = function () {

        var popup = popup_cache;

        if (popup)
        {
            popup.close('auto');
        }
        else
        {
            popup = popup_cache = new flyingon.Popup();

            popup.autoDispose = false;

            popup.on('closed', function () {

                this.detach(0);
            });

            popup.width('auto').height('auto');
        }

        return popup;
    };



}).register();