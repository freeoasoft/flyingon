flyingon.fragment('f-Date', function () {


    this.defineProperty('format', 'yyyy/M/dd', {
        
        set: this.__render_value
    });


    //最小可选值
    this.defineProperty('min', '');


    //最大可选值
    this.defineProperty('max', '');


    //是否显示时间
    this.defineProperty('time', false);


    //是否显示今天按钮
    this.defineProperty('today', false);


    //是否显示清除按钮
    this.defineProperty('clear', false);


});




flyingon.TextButton.extend('Date', function (base) {


    //日历控件
    var calendar_cache;



    this.__type = 'f-date-button';



    flyingon.fragment('f-Date', this);



    //日期值
    this.defineProperty('value', null, {
        
        dataType: 'date',
        set: this.__render_value
    });


    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value;

        return value ? value.format(storage.format) : '';
    };


    //弹出日历窗口
    this.popup = this.__on_click = function () {

        var popup = this.__get_popup(),
            storage = this.__storage || this.__defaults,
            calendar = calendar_cache;

        if (!calendar)
        {
            calendar = calendar_cache = new flyingon.Calendar();
            calendar.border(0).on('selected', function (e) {
                
                this.target.value(e.value);
                this.popup.close();
            });
        }

        calendar.value(storage.value)
            .min(storage.min)
            .max(storage.max)
            .time(storage.time)
            .today(storage.today)
            .clear(storage.clear);

        calendar.oncheck = this.oncheck;
        calendar.target = this;
        calendar.popup = popup;

        popup.push(calendar);
        popup.show(this);
    };



}).register();