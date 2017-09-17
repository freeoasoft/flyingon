flyingon.layout('flyingon-Panel', {
   
    type: 'dock',
    spacingX: 10,    
    spacingY: 10,
    
    //子布局
    sublayouts: [
        {
            length: 3,
            width: 100,
            height: 'auto',

            layout: {
            
                type: 'line',

                //子项
                subitems: {

                    each: ['switch', 'index % 5', {

                        1: {

                        },

                        2: {

                        }
                    }]
                }
            }
        },
        
        {
            length: 0.5,
                
            layout: {
                
                type: 'dock'
            }
        },
        
        {
            length: 0.5,
                
            layout: {
                
                type: 'dock'
            }
        },
        
        {
            length: 1,
                
            layout: {
                
                type: 'dock'
            }
        }
    ],
    
    //自适应布局
    adaptation: {
        
        'width > 1000': {
            
            type: 'table',
            
            subitem: {
            
            }
        },
        
        'width > 500': {
            
            type: 'grid',
            
            subitem: {
            
            }
        }
    }
    
});