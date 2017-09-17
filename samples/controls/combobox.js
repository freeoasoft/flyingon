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
                        Class: 'RadioComboBox',
                        columns: 2,
                        items: '123456789'.split(''),
                        value: '2'
                    },

                    {
                        Class: 'CheckComboBox',
                        items: '123456789'.split(''),
                        value: '1,2'
                    },

                    {
                        Class: 'CheckComboBox',
                        template: '<span class="f-tree-icon-file" style="display:inline-block;width:16px;height:16px;"></span><span :text="index"></span><span :text="item"></span>',
                        items: 'ABCDEFG'.split('')
                    }
                ]
            },

            { Class: 'Code' }

        ]
    },

    created: function () {

    }


});