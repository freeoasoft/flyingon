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
                    {
                        Class: 'TextBox',
                        width: 200,
                        placehodler: '请输入文字'
                    },
                    {
                        Class: 'Password'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});