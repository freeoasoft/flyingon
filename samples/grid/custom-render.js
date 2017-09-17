flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [

            {
                Class: 'Grid',
                width: 780,
                height: 240
            },
            
            { Class: 'Code' }

        ]
    },

    created: function () {

        var grid = this[0];
        var columns = []
        var data = [];

        for (var j = 1; j <= 20; j++)
        {
            columns.push({ title: 'F' + j, name: 'F' + j });
        }

        grid.columns(columns);


        columns = grid.columns();

        function render(cell, row, column) {

            if ((column.index() & 1) === (row.data.index & 1))
            {
                cell.style('background-color:silver;color:blue');
            }
        };

        for (var i = columns.length - 1; i >= 0; i--)
        {
            columns[i].onrender = render;
        }


        for (var i = 0; i < 100; i++)
        {
            var item = {};

            item.index = i;

            for (var j = 1; j <= 20; j++)
            {
                item['F' + j] = 'R:' + (i + 1) + ' C:' + j;
            }

            data.push(item);
        }

        var dataset = new flyingon.DataSet();

        dataset.load(data);

        grid.dataset(dataset);
    }


});