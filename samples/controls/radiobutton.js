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
                    { Class: 'RadioButton', name: "key", height: 18, checked: true },
                    { Class: 'RadioButton', name: "key", height: 18 },
                    { Class: 'RadioButton', name: "key", height: 18, disabled: true }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});