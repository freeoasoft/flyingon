flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                width: 780,
                height: 60,

                children: [
                    {
                        Class: 'ComboBox',
                        items: '123456789'.split('')
                    },
                    {
                        Class: 'ComboBox',
                        clear: true,
                        items: '123456789'.split(''),
                        value: '2'
                    },
                    {
                        Class: 'ComboBox',
                        checked: 'radio',
                        columns: 2,
                        items: '123456789'.split(''),
                        value: '2'
                    },
                    {
                        Class: 'ComboBox',
                        checked: 'checkbox',
                        items: '123456789'.split(''),
                        value: '1,2'
                    },
                    {
                        Class: 'ComboBox',
                        checked: 'checkbox',
                        template: '<span class="f-tree-icon-file" style="display:inline-block;width:16px;height:16px;"></span><span :text="{{index}}"></span><span :text="{{item}}"></span>',
                        items: 'ABCDEFG'.split(''),
                        value: 'B,C'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});