flyingon.widget({

    template: {

        Class: 'Plugin',
        layout: 'vertical-line',
        padding: 8,

        children: [

            {
                Class: 'MonthPicker',
                width: 200
            },

            {
                Class: 'MonthPicker', 
                width: 200,
                min: new Date().getFullYear() + '-' + 2, 
                max: new Date().getFullYear() + '-' + 10
            },

            {
                id: 'check',
                Class: 'MonthPicker',
                width: 200,
                min: new Date().getFullYear() + '-' + 2, 
                max: new Date().getFullYear() + '-' + 10
            }
        ]
    },

    created: function () {

        this.findById('check')[0].oncheck = function (year, month) {

            if (month & 1)
            {
                return false;
            }
        };
    }


});