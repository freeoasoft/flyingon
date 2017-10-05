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
                    { Class: 'CheckBox', checked: true },
                    { Class: 'CheckBox' },
                    { Class: 'CheckBox', disabled: true }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});
    