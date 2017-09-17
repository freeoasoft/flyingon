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

                locked: '1',

                columns: [
                    { type: 'no' },
                    { type: 'check' },
                    { name: 'F1', title: 'F1' },
                    { name: 'F2', title: 'F2' },
                    { name: 'F3', title: 'F3' },
                    { name: 'F4', title: 'F4' },
                    { name: 'F5', title: 'F5' },
                    { name: 'F6', title: 'F6' },
                    { name: 'F7', title: 'F7' },
                    { name: 'F8', title: 'F8' },
                    { name: 'F9', title: 'F9' },
                    { name: 'F10', title: 'F10' }
                ]
            },

            { Class: 'Code' }

        ]
    },

    created: function () {

        var grid = this[0];
        var dataset = new flyingon.DataSet();
        var data = [];

        for (var i = 0; i < 100; i++)
        {
            var item = {};

            item.index = i;

            for (var j = 1; j <= 10; j++)
            {
                item['F' + j] = 'R:' + (i + 1) + ' C:' + j;
            }

            data.push(item);
        }

        dataset.load(data, 'id', 'children');

        grid.dataset(dataset);

        //默认展开第一级
        //grid.expandTo(1);
    }


});