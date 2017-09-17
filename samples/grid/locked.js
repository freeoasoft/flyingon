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
                locked: '2 2 1 1'
            },
            
            { Class: 'Code' }

        ]
    },

    created: function () {

        var columns = []
        var data = [];

        for (var j = 1; j <= 100; j++)
        {
            columns.push({ title: 'F' + j, name: 'F' + j });
        }

        this[0].columns(columns);

        for (var i = 0; i < 100; i++)
        {
            var item = {};

            for (var j = 1; j <= 100; j++)
            {
                item['F' + j] = 'R:' + (i + 1) + ' C:' + j;
            }

            data.push(item);
        }

        var dataset = new flyingon.DataSet();

        dataset.load(data);

        this[0].dataset(dataset);
    }


});