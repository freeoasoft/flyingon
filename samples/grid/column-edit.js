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
                    { name: 'F2', title: 'F2', type: 'textbox' },
                    { name: 'F3', title: 'F3', type: 'number' },
                    { name: 'F4', title: 'F4', type: 'date' },
                    { name: 'F5', title: 'F5', type: 'time' },
                    { name: 'F6', title: 'F6', type: 'combobox' },
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

        for (var i = 0; i < 100; i++)
        {
            var item = {};

            item.F1 = i & 1 ? true : false;
            item.F2 = 'R' + (i + 1);
            item.F3 = random() * 10000 | 0;
            item.F4 = date;
            item.F5 = '';

            data.push(item);
        }

        dataset.load(data, 'id', 'children');

        grid.dataset(dataset);
    }


});