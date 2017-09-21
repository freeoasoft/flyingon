flyingon.widget({
    
        template: {
    
            Class: 'Plugin',
            padding: 8,
            layout: 'vertical-line',
            
            children: [
                {
                    Class: 'Tab',
                    width: 780,
                    height: 200,
                    selected: 0,
                    children: [
                        { text: '页签1' },
                        { text: '页签2' },
                        { text: '页签3' },
                        { text: '页签4' }
                    ]
                },
                { Class: 'Code' }
            ]
        },
    
        created: function () {
    
        }
    
    
    });