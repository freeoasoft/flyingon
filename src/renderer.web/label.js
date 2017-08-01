flyingon.renderer('Label', function (base) {


    

    this.render = function (writer, control, css) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<span');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>', text, '</span>');
    };


    this.text = function (control, view, value) {

        view[this.__text_name] = value && flyingon.html_encode(value) || '';
    };


    this.__measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view && view.offsetWidth || 0;
        }

        if (auto & 2)
        {
            view.style.width = control.offsetWidth + 'px';
            control.offsetHeight = view && view.offsetHeight || 0;
        }
    };



});