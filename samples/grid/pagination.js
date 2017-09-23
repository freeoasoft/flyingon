flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Pagination',
                width: 780
            },
            {
                Class: 'Grid',
                width: 780,
                height: 'auto'
            },
            {
                Class: 'Pagination',
                width: 780
            },
            {
                Class: 'Code' 
            }
        ]
    },

    created: function () {

        var grid = this[1];
        var columns = []
        var data = [];

        for (var j = 1; j <= 10; j++)
        {
            columns.push({ title: 'F' + j, name: 'F' + j });
        }

        grid.columns(columns);

        for (var i = 0; i < 10; i++)
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