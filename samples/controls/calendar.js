flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                height: 250,
                
                children: [
                    { 
                        Class: 'Calendar', 
                        today: true, 
                        clear: true, 
                        time: true 
                    },
                    { 
                        Class: 'Calendar', 
                        min: new Date(new Date().getFullYear(), new Date().getMonth(), 10).format('yyyy-MM-dd'), 
                        max: new Date(new Date().getFullYear(), new Date().getMonth(), 20).format('yyyy-MM-dd')
                    },
                    {
                        id: 'check',
                        Class: 'Calendar',
                        min: new Date(new Date().getFullYear(), new Date().getMonth(), 10).format('yyyy-MM-dd'), 
                        max: new Date(new Date().getFullYear(), new Date().getMonth(), 20).format('yyyy-MM-dd')
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
