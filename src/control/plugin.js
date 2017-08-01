flyingon.defineClass('Plugin', flyingon.Panel, function (base) {



    this.loadPlugin = function (route) {

    };


    this.openPlugin = function (route) {

    };


    this.closePlugin = function () {

    };
    


    this.__class_init = function (Class) {

        var fn = flyingon.__load_plugin;

        base.__class_init.apply(this, arguments);

        if (fn && (Class !== flyingon.Plugin))
        {
            fn(Class);
        }
    };



}).register();




flyingon.plugin = function (superclass, fn) {

    if (!fn)
    {
        fn = superclass;
        superclass = flyingon.Plugin;
    }

    return flyingon.defineClass(superclass, fn).init();
};