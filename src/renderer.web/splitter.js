flyingon.renderer('Splitter', function (base) {



    //渲染html
    this.render = function (writer, control) {

        writer.push('<div');

        this.renderDefault(writer, control, '', 'cursor:ew-resize;');

        writer.push('><div></div></div>');
    };
    

    this.locate = function (control) {

        var vertical = control.offsetWidth > control.offsetHeight;

        base.locate.call(this, control);

        if (control.vertical !== vertical)
        {
            control.vertical = vertical;
            control.view.style.cursor = vertical ? 'ns-resize' : 'ew-resize';
        }
    };


    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        control.on('mousedown', function (e) {
            
            var data = resize_data(control);

            if (data)
            {
                flyingon.dom_drag(data, e.original_event, null, do_resize, null, data[1] ? 'x' : 'y');
            }
        });
    };



    function resize_data(control) {

        var parent = control.parent,
            vertical = control.vertical;

        if (parent && (control = parent[parent.indexOf(control) - 1]))
        {
            return [control, vertical, vertical ? control.offsetHeight : control.offsetWidth];
        }
    };


    function do_resize(event) {

        var control = this[0],
            vertical = this[1],
            name = vertical ? 'distanceY' : 'distanceX';

        control[vertical ? 'height' : 'width'](this[2] + event[name]);
        event[name] = (vertical ? control.offsetHeight : control.offsetWidth) - this[2];
    };

     

});