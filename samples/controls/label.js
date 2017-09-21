flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                height: 50,
                
                children: [
                    {
                        Class: 'Label',
                        text: 'text'
                    },
                    {
                        Class: 'Label',
                        text: '<span style="color:red;">text</span>',
                        html: true
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});