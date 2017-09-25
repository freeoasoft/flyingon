flyingon.fragment('f-menu', function () {


    flyingon.fragment('f-collection', this);


    this.__check_items = function (index, items, start) {

        var Class = flyingon.MenuItm,
            item;

        while (item = items[start])
        {
            //分隔条
            if (item === '-')
            {
                continue;
            }

            if (!(item instanceof Class))
            {
                item = new Class().load(item);
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

                    case 'click':
                        if (typeof value === 'function')
                        {
                            this.on('click', value);
                        }
                        break;

                    default:
                        storage[name] = value;
                        break;
                }
            }
        }
    };


    this.defineProperty('icon', '');


    this.defineProperty('text', '');


    this.defineProperty('disabled', false);


    this.defineProperty('tag', null);


    flyingon.fragment('f-menu', this);


});



Object.extend('Menu', function () {



    //宽度
    this.defineProperty('width', 'auto');



    //显示
    this.show = function (reference) {

        this.renderer.show(this, reference);
        return this;
    };


    //关闭
    this.close = function () {

        this.renderer.close(this);
        return this;
    };
    


    flyingon.fragment('f-menu', this);


    flyingon.renderer.bind(this, 'Menu');



}).register();