//扩展数组方法
(function () {


    //转换数组项为键值对
    this.pair = function (value) {

        var map = flyingon.create(null);

        if (value === void 0)
        {
            value = true;
        }

        for (var i = 0, l = this.length; i < l; i++)
        {
            map[this[i]] = value;
        }

        return map;
    };


    this.indexOf || (this.indexOf = function (item, index) {

        if ((index |= 0) < 0)
        {
            return -1;
        }

        var length = this.length;

        while (index < length)
        {
            if (this[index] === item)
            {
                return index;
            }

            index++;
        }

        return -1;
    });


    this.lastIndexOf || (this.lastIndexOf = function (item, index) {

        if ((index |= 0) > 0)
        {
            return -1;
        }

        if (!index)
        {
            if (arguments.length > 1)
            {
                return -1;
            }

            index = -1;
        }

        index += this.length;

        while (index >= 0)
        {
            if (this[index] === item)
            {
                return index;
            }

            index--;
        }

        return -1;
    });


    this.forEach || (this.forEach = function (fn) {

        var context = arguments[1];

        for (var i = 0, l = this.length; i < l; i++)
        {
            fn.call(context, this[i], i, this);
        }
    });


    this.map || (this.map = function (fn) {

        var context = arguments[1],
            length = this.length,
            list = new Array(length);

        for (var i = 0; i < length; i++)
        {
            list[i] = fn.call(context, this[i], i, this);
        }

        return list;
    });


    this.filter || (this.filter = function (fn) {

        var context = arguments[1],
            list = [];

        for (var i = 0, l = this.length; i < l; i++)
        {
            if (fn.call(context, this[i], i, this))
            {
                list.push(this[i]);
            }
        }

        return list;
    });


    this.some || (this.some = function (fn) {

        var context = arguments[1];

        for (var i = 0, l = this.length; i < l; i++)
        {
            if (fn.call(context, this[i], i, this))
            {
                return true;
            }
        }

        return false;
    });


    this.every || (this.every = function (fn) {

        var context = arguments[1];

        for (var i = 0, l = this.length; i < l; i++)
        {
            if (!fn.call(context, this[i], i, this))
            {
                return false;
            }
        }

        return true;
    });


    this.reduce || (this.reduce = function (fn) {

        var value = arguments[1],
            index = 0, 
            length = this.length;

        if (value === void 0)
        {
            value = this[0];
            index = 1;
        }
        
        while (index < length)
        {
            value = fn(value, this[index], index++, this);
        }

        return value;
    });


    this.reduceRight || (this.reduceRight = function (fn) {

        var value = arguments[1],
            index = this.length - 1;

        if (value === void 0)
        {
            value = this[index--];
        }
        
        while (index >= 0)
        {
            value = fn(value, this[index], index--, this);
        }

        return value;
    });
  


}).call(Array.prototype);




Function.prototype.bind || (Function.prototype.bind = function (context) {

    var fn = this;

    if (arguments.length > 1)
    {
        var list = [].slice.call(arguments, 1),
            push = list.push;

        return function () {

            var data = list.slice(0);

            if (arguments.length > 0)
            {
                push.apply(data, arguments);
            }

            return fn.apply(context || this, data);
        };
    }

    return function () {

        return fn.apply(context || this, arguments);
    };
});



(function () {
    

    var regex = /([yMdhmsSq]+)/g;
    
    var keys1 = {
    
        'GMT': 'toGMTString',
        'ISO': 'toISOString',
        'UTC': 'toUTCString',
        'date': 'toDateString',
        'time': 'toTimeString',
        'locale': 'toLocaleString',
        'locale-date': 'toLocaleDateString',
        'locale-time': 'toLocaleTimeString'
    };

    var keys2 = {

        'y': 'getFullYear',
        'd': 'getDate',
        'h': 'getHours',
        'm': 'getMinutes',
        's': 'getSeconds',
        'S': 'getMilliseconds'
    };


    this.format = function (format) {

        var any;

        if (format)
        {
            if (any = keys1[format])
            {
                return this[any]();
            }

            any = this;

            return format.replace(regex, function (_, text) {

                var length = text.length;

                switch (text = text.charAt(0))
                {
                    case 'M':
                        text = any.getMonth() + 1;
                        break;

                    case 'q':
                        text = (any.getMonth() + 3) / 3 | 0;
                        break;

                    default:
                        text = any[keys2[text]]();
                        break;
                }

                text = '' + text;

                if (length === 1 || (length -= text.length) <= 0)
                {
                    return text;
                }

                //substr负索引有IE7下有问题
                return '0000'.substring(0, length) + text;
            });
        }
        
        return this.toString();
    };


    this.addYear = function (value) {

        this.setFullYear(this.getFullYear() + (value | 0));
        return this;
    };


    this.addMonth = function (value) {

        this.setMonth(this.getMonth() + (value | 0));
        return this;
    };


    this.addDate = function (value) {

        this.setDate(this.getDate() + (value | 0));
        return this;
    };


}).call(Date.prototype);