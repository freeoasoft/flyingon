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
                        Class: 'Month',
                        width: 200
                    },
                    {
                        Class: 'Month', 
                        width: 200,
                        min: new Date().getFullYear() + '-' + 2, 
                        max: new Date().getFullYear() + '-' + 10
                    },
                    {
                        id: 'check',
                        Class: 'Month',
                        width: 200,
                        min: new Date().getFullYear() + '-' + 2, 
                        max: new Date().getFullYear() + '-' + 10
                    }
                ]
            },
            { Class: 'Code' }
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