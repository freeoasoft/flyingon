flyingon.renderer('Calendar', function (base) {



    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, (cssText || '') + 'padding:8px;');
        
        writer.push(' onclick="flyingon.Calendar.onclick.call(this, event)"></div>');
    };



    flyingon.Calendar.onclick = function (e) {

        var control = flyingon.findControl(this),
            dom = e.target || e.srcElement,
            data = control.__data,
            any;

        switch (dom.getAttribute('tag'))
        {
            case 'to-year':
                render_year(control, data);
                break;

            case 'to-month':
                render_month(control, data);
                break;

            case 'to-date':
                render_date(control, data);
                break;

            case 'date-2':
                data[4] -= 1;
                render_date(control, data);
                break;

            case 'date-1':
                if (--data[5] < 1)
                {
                    data[5] = 12;
                    data[4]--;
                }

                render_date(control, data);
                break;

            case 'date+1':
                if (++data[5] > 12)
                {
                    data[5] = 1;
                    data[4]++;
                }

                render_date(control, data);
                break;

            case 'date+2':
                data[4] += 1;
                render_date(control, data);
                break;

            case 'month-2':
                data[4] -= 10;
                render_month(control, data);
                break;

            case 'month-1':
                data[4] -= 1;
                render_month(control, data);
                break;

            case 'month+1':
                data[4] += 1;
                render_month(control, data);
                break;

            case 'month+2':
                data[4] += 10;
                render_month(control, data);
                break;

            case 'year-2':
                data[4] -= 100;
                render_year(control, data);
                break;

            case 'year-1':
                data[4] -= 20;
                render_year(control, data);
                break;

            case 'year+1':
                data[4] += 20;
                render_year(control, data);
                break;

            case 'year+2':
                data[4] += 100;
                render_year(control, data);
                break;

            case 'today':
                any = new Date();
                data[0] = data[4] = any.getFullYear();
                data[1] = data[5] = any.getMonth() + 1;
                data[2] = any.getDate();

                do_change(control, data, render_date);
                break;

            case 'clear':
                data[0] = data[1] = data[2] = 0;
                
                if (raise_change(control, null))
                {
                    render_date(control, data);
                }
                break;

            case 'year':
                data[0] = data[4] = +dom.innerHTML;
                (control.month() ? render_month : render_date)(control, data);
                break;

            case 'month':
                data[0] = data[4];
                data[1] = data[5] = +dom.getAttribute('value');

                if (control.month())
                {
                    do_change(control, data, render_month);
                }
                else
                {
                    render_date(control, data);
                }
                break;
                
            case 'date':
                if (dom.className.indexOf('f-calendar-disabled') < 0)
                {
                    any = data[5] + (dom.getAttribute('offset') | 0);

                    if (any < 1)
                    {
                        any = 12;
                        data[4]--;
                    }
                    else if (any > 12)
                    {
                        any = 1;
                        data[4]++;
                    }
                    else
                    {
                        data[4];
                    }

                    data[0] = data[4];
                    data[1] = data[5] = any;
                    data[2] = +dom.innerHTML;

                    do_change(control, data, render_date);
                }
                break;
        }
    };


    flyingon.Calendar.onchange = function () {

        var control = flyingon.findControl(this),
            values = this.value.match(/\d+/g);

        this.value = control.__data[3] = values ? check_time(values) : '00:00:00';
    };


    function do_change(control, data, fn) {

        var storage = control.__storage || control.__defaults,
            value,
            any;

        if (storage.month)
        {
            value = data[0] + '-' + data[1];
        }
        else
        {
            value = data[0] + '-' + data[1] + '-' + data[2];

            if (storage.time)
            {
                any = data[3].split(':');
                value += ' ' + any[0] + ':' + any[1] + ':' + any[2];
            }

            value = new Date(value);
        }

        if (raise_change(control, value))
        {
            fn && fn(control, data);
            return true;
        }
    };


    function raise_change(control, value) {

        if (control.value() !== value)
        {
            control.rendered = false;
            control.value(value);
            control.rendered = true;

            control.trigger('change', 'value', value);
        }

        return control.trigger('selected', 'value', value) !== false;
    };


    function check_time(values) {

        var list = [],
            max = 24,
            any;

        for (var i = 0; i < 3; i++)
        {
            if (any = values[i])
            {
                //substr在IE7下使用负索引有问题
                if (any > max)
                {
                    any = max;
                }
                else if ((any = '' + any).length === 1)
                {
                    any = '0' + any;
                }
            }
            else
            {
                any = '00';
            }

            list.push(any);
            max = 60;
        }

        return list.join(':');
    };


    this.locate = function (control) {

        base.locate.call(this, control);

        control.__data = null;
        render(control);
    };


    function render(control) {

        var storage = control.__storage || control.__defaults,
            data = control.__data,
            any;

        if (!data)
        {
            any = storage.value;

            control.__data = data = [

                any ? any.getFullYear() : 0, 
                any ? any.getMonth() + 1 : 0,
                any ? any.getDate() : 0,
                '',
                (any = any || new Date()).getFullYear(),
                any.getMonth() + 1
            ];

            if (storage.time && !storage.month)
            {
                 data[3] = check_time([any.getHours(), any.getMinutes(), any.getSeconds()]);
            }
        }

        if (storage.month)
        {
            render_month(control, data);
        }
        else
        {
            render_date(control, data);
        }
    };


    function render_year(control, data) {

        var writer = [],
            storage = control.__storage || control.__defaults,
            min = storage.min,
            max = storage.max,
            check = control.oncheck,
            year,
            text,
            name,
            any;

        min && (min = min.match(/\d+/g));
        max && (max = max.match(/\d+/g));

        any = (clientHeight(control) - 30) / 4 | 0;
        text = '<div style="height:' + any + 'px;line-height:' + any + 'px;">';

        year = (data[4] / 20 | 0) * 20 + 1;

        any = flyingon.i18ntext('calendar.title', 'Y')[0];
        any = any.replace('Y', year) + ' - ' + any.replace('Y', year + 19);
        any = '<span tag="to-' + (control.month() ? 'month">' : 'date">') + any + '</span>';

        render_head(writer, data, 'year', any);

        writer.push('<div class="f-calendar-year">');

        any = data[0];

        for (var i = 0; i < 4; i++)
        {
            writer.push(text);

            for (var j = 0; j < 5; j++)
            {
                name = year === any ? 'f-calendar-selected ' : '';

                if (min && check_min(min, year) ||
                    max && check_max(max, year) ||
                    check && check(year) === false)
                {
                    name += 'f-calendar-disabled ';
                }

                writer.push('<span class="', name, '" tag="year">', year++, '</span>');
            }

            writer.push('</div>');
        }

        control.view.innerHTML = writer.join('');
    };


    function render_month(control, data) {

        var writer = [],
            i18n = flyingon.i18ntext,
            storage = control.__storage || control.__defaults,
            min = storage.min,
            max = storage.max,
            check = control.oncheck,
            keys = i18n('calendar.month', '') || months,
            year = data[4],
            month,
            name,
            text,
            any;

        if (min = min && min.match(/\d+/g))
        {
            min[1] || (min[1] = 0);
        }

        if (max = max && max.match(/\d+/g))
        {
            max[1] || (max[1] = 12);
        }

        any = '<span tag="' + (control.month() ? 'to-year">' : 'to-date">')
            + i18n('calendar.title', 'Y')[0].replace('Y', year)
            + '</span>';

        render_head(writer, data, 'month', any);

        any = (clientHeight(control) - 30) / 3 | 0;
        text = '<div style="height:' + any + 'px;line-height:' + any + 'px;">';

        writer.push('<div class="f-calendar-month">');

        any = data[1];

        for (var i = 0; i < 3; i++)
        {
            writer.push(text);

            for (var j = 0; j < 4; j++)
            {
                month = i * 4 + j + 1;

                name = month === any ? 'f-calendar-selected ' : '';

                if (min && check_min(min, year, month) ||
                    max && check_max(max, year, month) ||
                    check && check(year, month) === false)
                {
                    name += 'f-calendar-disabled';
                }

                writer.push('<span class="', name, '" value="', month, '" tag="month">', keys[month - 1], '</span>');
            }

            writer.push('</div>');
        }

        writer.push('</div>');

        control.view.innerHTML = writer.join('');
    };


    function render_date(control, data) {

        var writer = [],
            i18n = flyingon.i18ntext,
            storage = control.__storage || control.__defaults,
            min = storage.min,
            max = storage.max,
            foot = storage.today || storage.clear || storage.time,
            check = control.oncheck,
            index = 0,
            week, //每月第一天是星期几
            last, //上一个月最大天数
            days, //本月最大天数
            text,
            name,
            year,
            month,
            date,
            selected,
            offset,
            any;

        if (min = min && min.match(/\d+/g))
        {
            min[1] || (min[1] = 0);
            min[2] || (min[2] = 0);
        }

        if (max = max && max.match(/\d+/g))
        {
            max[1] || (max[1] = 12);
            max[2] || (max[2] = 31);
        }

        //title标题
        name = i18n('calendar.title', ['Y', 'M', 'M Y']);

        year = name[0].replace('Y', data[4]);
        month = name[1].replace('M', (i18n('calendar.month', '') || months)[data[5] - 1]);
        
        any = name[2].replace('Y', '<span tag="to-year">' + year + '</span>');
        any = any.replace('M', '<span tag="to-month">' + month + '</span>');

        render_head(writer, data, 'date', any);

        //渲染周
        any = i18n('calendar.week', '') || weeks;

        writer.push('<div class="f-calendar-week" style="height:25px;line-height:25px;">');

        for (var i = 0; i < 7; i++)
        {
            writer.push('<span>', any[i], '</span>');
        }

        writer.push('</div><div class="f-calendar-line" style="height:1px;"></div><div class="f-calendar-space" style="height:4px;"></div>');
  
        any = new Date(data[4], data[5], 1);
        
        week = any.getDay();
        any.setDate(-1);

        last = any.getDate() + 1;

        any = new Date(data[4], data[5] + 1, 1);
        any.setDate(-1);

        days = any.getDate() + 1;

        any = (clientHeight(control) - (foot ? 90 : 60)) / 6 | 0;
        text = '<div class="f-calendar-date" style="height:' + any + 'px;line-height:' + any + 'px;">';

        //共渲染6行
        for (var i = 0; i < 6; i++)
        {
            writer.push(text);

            while (index++ < 7)
            {
                date = i * 7  - week + index;

                year = data[4];
                month = data[5];

                if (date < 1)
                {
                    if (--month < 1)
                    {
                        year--;
                        month = 12;
                    }

                    date += last;
                    offset = -1;
                }
                else if (date > days)
                {
                    if (++month > 12)
                    {
                        year++;
                        month = 1;
                    }

                    date -= days;
                    offset = 1;
                }
                else
                {
                    offset = 0;
                }

                name = offset ? 'f-calendar-dark ' : '';

                if (data[2] === date && data[1] === month && data[0] === year)
                {
                    name += 'f-calendar-selected ';
                }

                if (min && check_min(min, year, month, date) ||
                    max && check_max(max, year, month, date) ||
                    check && check(year, month, date) === false)
                {
                    name += 'f-calendar-disabled ';
                }

                if (index === 1 || index === 7)
                {
                    name += 'f-calendar-weekend';
                }

                writer.push('<span class="', name, '" tag="date" offset="', offset, '">', date, '</span>');
            }

            index = 0;

            writer.push('</div>');
        }
        
        if (foot)
        {
            writer.push('<div class="f-calendar-space" style="height:4px;"></div><div class="f-calendar-foot" style="height:25px;line-height:25px;">');

            storage.time && writer.push('<input type="text" class="f-calendar-time" value="', data[3], '" onchange="flyingon.Calendar.onchange.call(this)"/>');

            storage.clear && writer.push('<span class="f-calendar-clear" tag="clear">', i18n('calendar.clear', 'clear'), '</span>');
            
            storage.today && writer.push('<span class="f-calendar-today" tag="today">', i18n('calendar.today', 'today'), '</span>');

            writer.push('</div>');
        }

        control.view.innerHTML = writer.join('');
    };


    function render_head(writer, data, tag, text) {

        writer.push('<div class="f-calendar-head" style="height:30px;line-height:30px;">',
                '<span class="f-calendar-before2" tag="', tag, '-2"></span>',
                '<span class="f-calendar-before1" tag="', tag, '-1"></span>',
                '<span class="f-calendar-title">', text, '</span>',
                '<span class="f-calendar-after1" tag="', tag, '+1"></span>',
                '<span class="f-calendar-after2" tag="', tag, '+2"></span>',
            '</div>');
    };

    
    function clientHeight(control) {

        return control.offsetHeight 
            - control.borderTop - control.borderBottom 
            - control.paddingTop - control.paddingBottom;
    };


    function check_min(min, year, month, date) {

        var any = year - min[0];

        if (any < 0)
        {
            return true;
        }

        if (any === 0 && month > 0)
        {
            any = month - min[1];

            if (any < 0)
            {
                return true;
            }

            return any === 0 && date < min[2];
        }
    };


    function check_max(max, year, month, date) {

        var any = year - max[0];

        if (any > 0)
        {
            return true;
        }

        if (any === 0 && month > 0)
        {
            any = month - max[1];

            if (any > 0)
            {
                return true;
            }

            return any === 0 && date > max[2];
        }
    };


    this.refresh = function (control) {

        control.__data = null;
        render(control);
    };
    

});