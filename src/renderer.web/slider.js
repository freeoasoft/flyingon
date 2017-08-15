flyingon.renderer('Slider', function (base) {


    this.render = function (writer, control) {

        writer.push('<div');
        
        this.renderDefault(writer, control);

        writer.push('>',
                '<div class="f-slider-bar"><div></div></div>',
                '<div class="f-slider-button"><div></div></div>',
            '</div>');
    };



    this.update = function (control) {

        base.update.call(this, control);
        this.refresh(control);
    };


    this.__location_patch = function (control) {

        base.__location_patch.call(this, control);
        this.refresh(control);
    };


    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        view.firstChild.onclick = onclick;
        view.lastChild.onmousedown = start_move;
    };


    this.unmount = function (control) {

        var view = control.view;

        view.firstChild.onclick = view.lastChild.onmousedown = null;

        base.unmount.call(this, control);
    };


    function onclick(e) {

        var control = flyingon.findControl(this),
            storage = control.__storage || control.__defaults,
            size = control.view.offsetWidth - storage.buttonSize,
            x = e.offsetX;

        if (x === void 0)
        {
            x = e.clientX - control.view.getBoundingClientRect().left;
        }

        x /= size;
        x = (storage.max - storage.min) * (x > 1 ? 1 : x) | 0;

        control.value(x);
        control.trigger('change', 'value', x);
    };


    function start_move(e) {

        var control = flyingon.findControl(this),
            storage = control.__storage || control.__defaults,
            context = { control: control },
            size = context.size = control.view.offsetWidth - storage.buttonSize,
            value = storage.value * size / (storage.max - storage.min) + 0.5 | 0;

        e.dom = this;

        context.min = -value;
        context.max = size - value;

        flyingon.dom_drag(context, e, null, check_move, move_end, 'y');
    };


    function check_move(e) {

        var x = e.distanceX;

        if (x < this.min)
        {
            e.distanceX = this.min;
        }
        else if (x > this.max)
        {
            e.distanceX = this.max;
        }
    };


    function move_end(e) {

        var control = this.control,
            storage = control.__storage || control.__defaults,
            x = e.distanceX - this.min;

        x = (storage.max - storage.min) * x / this.size | 0;

        control.value(x);
        control.trigger('change', 'value', x);
    };


    this.refresh = function (control) {

        var storage = control.__storage || control.__defaults,
            view = control.view,
            style = view.lastChild.style,
            width = view.offsetWidth - storage.buttonSize;

        style.left = (storage.value * width / (storage.max - storage.min) | 0) + 'px';
        style.width = storage.buttonSize + 'px';
    };


});