flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Pagination',
                width: 780,
                total: 1000
            },
            {
                Class: 'Grid',
                width: 780,
                //height: 'auto',
                maxHeight: 300
            },
            {
                Class: 'Pagination',
                width: 780,
                total: 1000
            },
            {
                Class: 'Code' 
            }
        ]
    },

    created: function () {
        
        var page1 = this[0];
        var page2 = this[2];
        var dataset = window.dataset = new flyingon.DataSet();
        var grid = this[1];
        var columns = []

        for (var j = 1; j <= 10; j++)
        {
            columns.push({ title: 'F' + j, name: 'F' + j });
        }

        grid.columns(columns);
        grid.dataset(dataset);

        function create_data(length) {

            var data = [];

            for (var i = 0; i < length; i++)
            {
                var item = {},
                    random = Math.random;

                item['F1'] = 'R:' + (i + 1);

                for (var j = 2; j <= 10; j++)
                {
                    item['F' + j] = random() * 100000 | 0;
                }

                data.push(item);
            }

            dataset.splice(0);
            dataset.push.apply(dataset, data);
        };

        create_data(page1.records());

        function refresh(e) {

            //dataset.splice(0);
            create_data(this.records());

            //同步分页控件
            this.sync(page1);
            this.sync(page2);
        };

        page1.on('refresh', refresh);
        page2.on('refresh', refresh);
    }


});