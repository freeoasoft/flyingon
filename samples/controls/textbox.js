flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [

            {
                Class: 'TextBox',
                width: 200,
                placehodler: '请输入文字'
            },

            { Class: 'Code' }

        ]
    },

    created: function () {

    }


});