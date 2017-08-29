flyingon.renderer('LinkButton', function (base) {



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            any;
        
        writer.push('<a type="button"');
        
        this.renderDefault(writer, control, className, cssText);

        if (any = storage.href)
        {
            writer.push(' href="', flyingon.html_encode(any), '"');
        }
        
        writer.push('>');

        if (any = storage.text)
        {
            if (!storage.html)
            {
                any = flyingon.html_encode(any);
            }

            writer.push(any);
        }
        
        writer.push('</a>');
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


    this.text = this.html = function (control, view) {

        var storage = control.__storage || control.__defaults;

        if (storage.html)
        {
            view.innerHTML = storage.text;
        }
        else
        {
            view[this.__text_name] = storage.text;
        }
    };


    this.href = function (control, view, value) {

        view.href = value;
    };



});