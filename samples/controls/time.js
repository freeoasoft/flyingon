flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [
            {
                Class: 'Panel',
                width: 600,
                height: 40,

                children: [
                    {
                        Class: 'Time',
                        value: '10:10:10'
                    },
                    {
                        Class: 'Time',
                        format: 'locale-time',
                        value: '10:10:10'
                    },
                    {
                        Class: 'Time',
                        format: 'hh:mm',
                        value: '10:10:10'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});