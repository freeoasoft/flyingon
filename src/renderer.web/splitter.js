flyingon.renderer('Splitter', function (base) {



    //渲染html
    this.render = function (writer, control, className, cssText) {

        writer.push('<div');

        this.renderDefault(writer, control, className, (cssText || '') + 'cursor:ew-resize;');

        writer.push(' onmousedown="flyingon.Splitter.onmousedown.call(this, event)"><div></div></div>');
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


    flyingon.Splitter.onmousedown = function (e) {
            
        var control = flyingon.findControl(this),
            data = resize_data(control);

        if (data)
        {
            flyingon.dom_drag(data, e, null, do_resize, null, data[1] ? 'x' : 'y');
        }
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
            style = control.__style,
            name = vertical ? 'distanceY' : 'distanceX',
            size = this[2] + event[name],
            visible = 'visible';

        if (size < 4)
        {
            size = 0;
            visible = 'hidden';
        }

        if (!style || !style.visibility !== visible)
        {
            control.style('visibility', visible);
        }

        control[vertical ? 'height' : 'width'](size);

        event[name] = (vertical ? control.offsetHeight : control.offsetWidth) - this[2];
    };

     

});