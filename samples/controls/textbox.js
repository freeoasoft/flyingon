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
                        width: 200
                    },
                    {
                        Class: 'TextBox',
                        width: 200,
                        placeholder: '请输入文字'
                    },
                    {
                        Class: 'Password',
                        text: '123456'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});