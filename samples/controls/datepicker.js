flyingon.widget({

    template: {

        Class: 'Plugin',
        layout: 'vertical-line',
        padding: 8,

        children: [

            {
                Class: 'DatePicker', 
                format: 'locale',
                width: 200,
                today: true, 
                clear: true, 
                time: true 
            },

            {
                Class: 'DatePicker', 
                width: 200,
                min: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-10', 
                max: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-20'
            },

            {
                id: 'check',
                Class: 'DatePicker',
                width: 200,
                min: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-10', 
                max: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-20'
            }
        ]
    },

    created: function () {

        this.findById('check')[0].oncheck = function (year, month, date) {

            if (date & 1)
            {
                return false;
            }
        };
    }


});