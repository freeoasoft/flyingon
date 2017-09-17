flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [

            {
                Class: 'ProgressBar',
                width: 400,
                value: 50
            },

            { Class: 'Code' }

        ]
    },

    created: function () {

    }


});