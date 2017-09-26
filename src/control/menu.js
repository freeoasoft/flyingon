flyingon.fragment('f-menu', function () {


    flyingon.fragment('f-collection', this);


    this.__check_items = function (index, items, start) {

        var Class = flyingon.MenuItem,
            item;

        while (item = items[start])
        {
            //分隔条
            if (item === '-')
            {
                start++;
                continue;
            }

            if (!(item instanceof Class))
            {
                item = items[start] = new Class().load(item);
            }

            item.parent = this;
            start++;
        }
    };


    this.dispose = function () {

        var item;

        for (var i = this.length - 1; i >= 0; i--)
        {
            if ((item = this[i]) && item.__events)
            {
                item.off();
            }

            this[i] = null;
        }
    };


});



Object.extend('MenuItem', function () {



    this.load = function (options) {

        if (options)
        {
            var storage = this.storage(),
                value;

            for (var name in options)
            {
                value = options[name];

                switch (name)
                {
                    case 'icon':
                    case 'text':
                        storage[name] = '' + value;
                        break;

                    case 'disabled':
                        storage[name] = !!value;
                        break;

                    case 'children':
                        if (value instanceof Array && value.length > 0)
                        {
                            this.push.apply(this, value);
                        }
                        break;

                    default:
                        if (typeof value === 'function')
                        {
                            this.on(name, value);
                        }
                        else
                        {
                            storage[name] = value;
                        }
                        break;
                }
            }
        }

        return this;
    };



    this.eventBubble = 'parent';


    this.defineProperty('icon', '');


    this.defineProperty('text', '');


    this.defineProperty('disabled', false);


    this.defineProperty('tag', null);


    flyingon.fragment('f-menu', this);


});



Object.extend('Menu', function () {



    //显示
    this.show = function (reference) {

        this.renderer.show(this, reference);
        return this;
    };


    this.showAt = function (x, y) {

        this.renderer.showAt(this, x, y);
        return this;
    };


    //关闭
    this.close = function () {

        this.renderer.close(this);
        return this;
    };
    


    flyingon.fragment('f-menu', this);


    flyingon.renderer.bind(this, 'Menu');



    var all = this.Class.all;


    this.register = function (name, force) {

        if (name)
        {
            var any = all;
    
            if (!force && any[name])
            {
                throw 'register name "' + name + '" has exist!';
            }
    
            any[name] = this;
        }

        return this;
    };



}).register().all = flyingon.create(null);