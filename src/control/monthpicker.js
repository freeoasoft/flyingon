flyingon.TextButton.extend('MonthPicker', function (base) {



    //日历控件
    var calendar_cache;


    this.defaultValue('button', 'f-datepicker-button');



    //日期值
    this.defineProperty('value', null, {
        
        dataType: 'date',

        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    this.defineProperty('format', 'yyyy-MM', {
        
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    //最小可选值
    this.defineProperty('min', '');


    //最大可选值
    this.defineProperty('max', '');



    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value;

        return value ? value.format(storage.format) : ''
    };


    //弹出日历窗口
    this.popup = this.__on_click = function () {

        var popup = this.__get_popup(),
            storage = this.__storage || this.__defaults,
            calendar = calendar_cache;

        if (!calendar)
        {
            calendar = calendar_cache = new flyingon.Calendar();
            calendar.border(0).month(true).on('selected', function (e) {
                
                this.target.value(e.value);
                this.popup.close();
            });
        }

        calendar.value(storage.value).min(storage.min).max(storage.max);

        calendar.oncheck = this.oncheck;
        calendar.target = this;
        calendar.popup = popup;

        popup.push(calendar);
        popup.show(this);
    };



}).register();