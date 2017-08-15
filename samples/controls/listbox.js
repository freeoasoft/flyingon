flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'ListBox',
                items: '123456789'.split('')
            },

            {
                Class: 'ListBox',
                items: [{ value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3' }],
                valueField: 'value',
                displayField: 'text',
                value: '2'
            },

            {
                Class: 'RadioListBox',
                items: '123456789'.split(''),
                value: '2'
            },

            {
                Class: 'CheckListBox',
                items: '123456789'.split(''),
                value: '1,2'
            },

            {
                Class: 'CheckListBox',
                template: '<span class="f-tree-icon-file" style="display:inline-block;width:16px;height:16px;"></span><span :text="index"></span><span :text="item"></span>',
                items: 'ABCDEFG'.split('')
            },

            {
                Class: 'RadioListBox',
                columns: 0,
                width: 300,
                items: '123456789'.split(''),
                value: '2'
            },

            {
                Class: 'CheckListBox',
                columns: 2,
                items: '123456789'.split(''),
                value: '1,2'
            }

        ]
    },

    created: function () {

    }


});