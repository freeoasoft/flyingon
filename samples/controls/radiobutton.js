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
                    { Class: 'RadioButton', height: 18, value: true },
                    { Class: 'RadioButton', height: 18, value: false }
                ]
            },
            
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});