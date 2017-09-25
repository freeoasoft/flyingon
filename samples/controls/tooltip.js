flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [
            {
                Class: 'Panel',
                height: 40,
                
                children: [
                    { Class: 'Button', text: 'left' },
                    { Class: 'Button', text: 'right' },
                    { Class: 'Button', text: 'top' },
                    { Class: 'Button', text: 'bottom' }
                ]
            },
            { Class: 'Label', text: '提醒:鼠标划过按钮可观看效果' },
            { Class: 'Code' }
        ]
    },

    created: function () {

        var tooltip = new flyingon.ToolTip();

        this.on('mouseover', function (e) {

            if (e.target instanceof flyingon.Button)
            {
                var direction = e.target.text();
                tooltip.direction(direction).html(true).text('this is direction <span style="color:red;">' + direction + '</span>!').show(e.target);
            }
        });

        this.on('mouseout', function (e) {

            tooltip.close();
        });
    }


});
