flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'Grid',
                locked: '0 0 2 2'
            }
        ]
    },

    created: function () {

        var grid = this[0];
        var columns = []
        var data = [];

        for (var j = 1; j <= 10; j++)
        {
            columns.push({ title: 'F' + j, name: 'F' + j });
        }

        grid.columns(columns);

        for (var i = 0; i < 100000; i++)
        {
            var item = {};

            for (var j = 1; j <= 10; j++)
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