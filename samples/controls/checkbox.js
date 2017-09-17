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
                    { Class: 'CheckBox', value: true },
                    { Class: 'CheckBox', value: false }
                ]
            },

            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});
    