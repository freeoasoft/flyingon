flyingon.widget({
    
    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            { 
                Class: 'Panel',
                height: 300,

                children: [
                    {
                        Class: 'Tree',
                        width: 200
                    },
                    {
                        Class: 'Tree',
                        width: 200,
                        theme: 'plus',
                    },
                    {
                        Class: 'Tree',
                        width: 200,
                        theme: 'line'
                    },
                    {
                        Class: 'Tree',
                        width: 200,
                        checked: true
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

        var nodes = [
            {
                text: 'flyingon基础', 
                expanded: true,
                children: [
                    { text: 'js插件' },
                    { text: 'widget插件' },
                    { text: 'html插件' },
                    { text: '序列化' },
                    { text: '数据绑定' },
                    { text: '选择器' },
                    { text: 'widget' },
                    { text: '多级路由' }
                ]
            },

            {
                text: '布局', 
                expanded: true,
                children: [
                    { text: '线性布局' },
                    { text: '流式布局' },
                    { text: '停靠布局' },
                    { text: '表格布局' },
                    { text: '自适应' },
                    { text: '子布局' }
                ]
            }
        ];

        var host = this[0],
            width = 774 / 4;

        for (var i = host.length - 1; i >= 0; i--)
        {
            var tree = host[i];

            tree.width(width);
            tree.push.apply(tree, nodes);
        }
    }


});