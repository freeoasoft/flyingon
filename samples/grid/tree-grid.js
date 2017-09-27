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

                treeColumn: 'F1',

                columns: [
                    { name: 'F1', title: 'F1', size: 200 },
                    { name: 'F2', title: 'F2' },
                    { name: 'F3', title: 'F3' },
                    { name: 'F4', title: 'F4' },
                    { name: 'F5', title: 'F5' }
                ]
            },
            
            { Class: 'Code' }
        ]
    },

    created: function () {


        function create_data(list, index, id, random) {

            var items = [],
                length = list[index++],
                name = 'L' + index + ': ',
                next = list[index] ? length * id + 1 : 0;

            for (var i = 1; i <= length; i++)
            {
                var item = { id: id + i, 'F1': name + i };

                for (var j = 2; j <= 5; j++)
                {
                    item['F' + j] = random() * 10000 | 0;
                }

                if (next > 0)
                {
                    item.children = create_data(list, index, next, random);
                }

                items.push(item);
            }

            return items;
        };


        var grid = this[0];
        var dataset = new flyingon.DataSet('F1', 'children');
        var data = create_data([100, 10, 10], 0, 1, Math.random);

        dataset.load(data);

        grid.dataset(dataset);

        //默认展开第一级
        //grid.expandTo(1);
    }


});