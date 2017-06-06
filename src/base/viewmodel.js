//创建部件
flyingon.widget = function (name, options) {


    if (!name || !options)
    {
        throw 'widget name or options not allow empty!';
    }


    return flyingon.defineClass(flyingon.Widget, function () {


        var template = create_template(options.template),
            controller = options.controller,
            any;


        this.constructor = function () {

            this.vm = template.init();
        };


        //重载默认属性
        if (any = options.properties)
        {
            for (var name in any)
            {
                this.defaultValue(name, any[key]);
            }
        }


        //初始化部件
        this.init = function () {

            this.appendControls(template.create(this));

            if (controller)
            {
                controller.call(this, this.vm);
            }
        };


        options = any = null;


    }).register(name);

};




//创建窗口
flyingon.window = function (options) {

    var window = new flyingon.Window(),
        template = create_template(options.template),
        vm = window.viewModel = template.init(),
        storage = vm.__storage = flyingon.create(null),
        any;

    if (any = options.properties)
    {
        for (var name in any)
        {
            window.set(name, any[key]);
        }
    }

    if (any = options.defaults)
    {
        for (var name in any)
        {
            storage[name] = any[name];
        }
    }

    if (any = options.init)
    {
        any.call(window, vm);
    }

    window.appendControls(template.create());

    if (any = options.created)
    {
        any.call(window, vm);
    }

    return window;
};