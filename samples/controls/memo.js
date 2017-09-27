flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        children: [
            {
                Class: 'Panel',
                height: 120,
                
                children: [
                    {
                        Class: 'Memo',
                        value: 'text ...'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});