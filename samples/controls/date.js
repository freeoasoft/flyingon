flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                height: 40,

                children: [
                    {
                        Class: 'Date', 
                        // format: 'locale',
                        width: 200,
                        today: true, 
                        clear: true, 
                        time: true 
                    },
                    {
                        Class: 'Date', 
                        width: 200,
                        min: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-10', 
                        max: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-20'
                    },
                    {
                        id: 'check',
                        Class: 'Date',
                        width: 200,
                        min: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-10', 
                        max: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-20'
                    }
                ]
            },
            { Class: 'Code' }
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