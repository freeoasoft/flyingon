flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                width: 780,
                height: 320,

                children: [
                    {
                        Class: 'ListBox',
                        items: '123456789'.split('')
                    },
                    {
                        Class: 'ListBox',
                        items: [{ value: '1', text: 'text 1' }, { value: '2', text: 'text 2' }, { value: '3', text: 'text 3' }],
                        value: '2'
                    },
                    {
                        Class: 'ListBox',
                        checked: 'radio',
                        items: '123456789'.split(''),
                        value: '2'
                    },
                    {
                        Class: 'ListBox',
                        checked: 'checkbox',
                        items: '123456789'.split(''),
                        value: '1,2'
                    },
                    {
                        Class: 'ListBox',
                        checked: 'checkbox',
                        template: '<span class="f-tree-icon-file" style="display:inline-block;width:16px;height:16px;"></span><span :text="{{index}}"></span><span :text="{{item}}"></span>',
                        items: 'ABCDEFG'.split('')
                    },
                    {
                        Class: 'ListBox',
                        checked: 'checkbox',
                        columns: 2,
                        items: '123456789'.split(''),
                        value: '1,2'
                    },
                    {
                        Class: 'ListBox',
                        checked: 'radio',
                        columns: 0,
                        width: 604,
                        items: '123456789'.split(''),
                        value: '2'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});