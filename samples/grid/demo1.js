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
                locked: '2 2'
            },
            
            { Class: 'Code' }

        ]
    },

    created: function () {

        var grid = this[0];
        var columns = [];
        var data = [];

        for (var i = 1; i <= 10000; i++)
        {
            columns.push({ title: 'F' + i, name: 'F' + i });
        }

        grid.columns(columns);

        for (var i = 0; i < 20; i++)
        {
            var item = {};

            for (var j = 1; j <= 10000; j++)
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