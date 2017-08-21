flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'DataGrid',
                locked: '2 2 2 2'
            }

        ]
    },

    created: function () {

        var columns = []
        var data = [];

        for (var j = 1; j <= 20; j++)
        {
            columns.push({ title: 'F' + j });
        }

        this[0].columns(columns);

        for (var i = 0; i < 10; i++)
        {
            var item = {};

            for (var j = 1; j <= 20; j++)
            {
                item['F' + j] = j;
            }
        }

        var dataset = new flyingon.DataSet();

        dataset.load(data);

        this[0].dataset(dataset);
    }


});