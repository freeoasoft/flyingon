flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'Grid'
            }

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

        grid.columns(1).onrender = function (cell, row) {

            if (row.data.index % 3 === 1)
            {
                cell.style('background-color:silver;color:blue;z-index:1;');

                //跨一行
                cell.rowSpan = 1;

                //跨两列
                cell.columnSpan = 2;
            }
        };


        grid.onrowstart = function (rows, start) {

            return start > 1 ? start - 1 : 0; //起始位置减小一行
        };


        grid.oncolumnstart = function (columns, start) {

            return start > 4 ? start : 0;
        };


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