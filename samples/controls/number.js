flyingon.widget({
    
    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                width: 780,
                height: 60,

                children: [
                    {
                        Class: 'Number',
                        value: 123456789
                    },
                    {
                        Class: 'Number',
                        value: 123456789.1234,
                        scale: 4,
                        thousands: true
                    },
                    {
                        Class: 'Number',
                        value: 123456789.12,
                        scale: 2,
                        format: '¥{0}'
                    },
                    {
                        Class: 'Number',
                        value: 123456789.12,
                        scale: 2,
                        thousands: true,
                        format: '¥{0}'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});