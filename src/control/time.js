flyingon.TextBox.extend('Time', function (base) {


    //值
    this.text = this.defineProperty('value', '', {
        
        check: flyingon.Time.check,
        set: this.render
    });


}).register();



flyingon.Time.check = function () {

    function check(value, max) {

        if (value <= 0)
        {
            return '00';
        }

        if (value >= 100)
        {
            value = ('' + value).substring(0, 2) | 0;
        }

        if (value >= max)
        {
            return '00';
        }
        
        return (value < 10 ? '0' : '') + value;
    };

    return function (value) {

        if (value && (value = value.match(/\d+/g)))
        {
            value.length = 3;

            value[0] = check(value[0] | 0, 24);
            value[1] = check(value[1] | 0, 60);
            value[2] = check(value[2] | 0, 60);

            return value.join(':');
        }

        return '';
    };

}();