flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [

            {
                Class: 'Grid',
                width: 780,
                height: 240,

                columns: [
                    { name: 'F1', title: 'F1', type: 'checkbox' },
                    { name: 'F2', title: 'F2', type: 'textbox', align: 'right' },
                    { name: 'F3', title: 'F3', type: 'number', digits: 2, format: '¥{0}', button: 'none', align: 'right' },
                    { name: 'F4', title: 'F4', type: 'date' },
                    { name: 'F5', title: 'F5', type: 'time' },
                    { name: 'F6', title: 'F6', type: 'combobox', checked: 'checkbox', popupWidth: 100 },
                    { name: 'F7', title: 'F7', type: 'textbox' },
                    { name: 'F8', title: 'F8', type: 'textbox' },
                    { name: 'F9', title: 'F9', type: 'textbox' },
                    { name: 'F10', title: 'F10', type: 'textbox' }
                ]
            },

            { Class: 'Code' }
        ]
    },

    created: function () {

        var grid = this[0];
        var dataset = new flyingon.DataSet();
        var data = [];
        var random = Math.random;
        var date = new Date();

        grid.columns(5).items([
            { value: 'R1', text: 'text 1' }, 
            { value: 'R2', text: 'text 2' }, 
            { value: 'R3', text: 'text 3' },
            { value: 'R4', text: 'text 4' },
            { value: 'R5', text: 'text 5' }
        ]);

        for (var i = 0; i < 100; i++)
        {
            var item = {};

            item.F1 = i & 1 ? true : false;
            item.F2 = 'R' + (i + 1);
            item.F3 = (random() * 1000000 | 0) / 100;
            item.F4 = date;
            item.F6 = 'R' + ((i % 5) + 1);

            data.push(item);
        }

        dataset.load(data, 'id', 'children');

        grid.dataset(dataset);
    }


});