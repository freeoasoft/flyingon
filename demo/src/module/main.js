flyingon.require([
    'flyingon/demo/src/module/module1.js',
    'flyingon/demo/src/module/module2.js',
    'flyingon/demo/src/module/module3.js'
]);


//定义主模块
flyingon.defineModule('main', function (main) {
    

    var module1 = flyingon.use('module1');
    var module2 = flyingon.use('module2');
    var moudle3 = flyingon.use('module3');
    
    
    main.MainPage = flyingon.defineClass(function () {
        
        
        
    });

    
    
});
