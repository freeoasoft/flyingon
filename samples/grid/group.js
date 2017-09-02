flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'Grid',
                header: 40, //列头高度
                group: 35, //分组框高度
                //groups: 'F1,F2', //设置默认分组

                columns: [

                    { 
                        name: 'F1',
                        title: 'F1'
                    },

                    { 
                        name: 'F2',
                        title: 'F2'
                    },

                    { 
                        name: 'F3',
                        title: [{ text: 'F34', span: 1 }, 'F3'] 
                    },

                    { 
                        name: 'F4',
                        title: ['', 'F4'] 
                    },

                    { 
                        name: 'F5',
                        title: [{ text: 'F56', span: 1 }, 'F5']
                    },

                    { 
                        name: 'F6',
                        title: ['', 'F6'] 
                    },

                    { 
                        name: 'F7',
                        title: 'F7',
                        align: 'right',
                        summary: 'SUM',
                        precision: 2
                    },

                    { 
                        name: 'F8',
                        title: 'F8',
                        align: 'right',
                        summary: 'AVG',
                        precision: 2
                    },

                    {
                        name: 'F9',
                        title: 'F9',
                        align: 'right',
                        summary: 'MIN',
                        precision: 2
                    },

                    {
                        name: 'F10',
                        title: 'F10',
                        align: 'right',
                        summary: 'MAX',
                        precision: 2
                    }
                ]
            }

        ]
    },

    created: function () {

        var grid = this[0];
        var data = [];

        var random = Math.random;

        for (var i = 0; i < 100; i++)
        {
            var item = {},
                value;

            item.index = i;

            for (var j = 1; j <= 7; j++)
            {
                item['F' + j] = 'G:' + (i % 10 + 1) + ' C:' + j;
            }

            value = (random() * 10000 | 0) / 100;
            
            for (var j = 7; j <= 10; j++)
            {
                item['F' + j] = value;
            }

            data.push(item);
        }

        var dataset = new flyingon.DataSet();

        dataset.load(data);

        grid.dataset(dataset);
    }


});