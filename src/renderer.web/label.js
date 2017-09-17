flyingon.renderer('Label', function (base) {



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            text = storage.text;

        if (text && !storage.html)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<span');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>', text, '</span>');
    };



    this.locate = function (control) {

        var cache = base.locate.call(this, control),
            height = control.offsetHeight;

        if (cache.lineHeight !== height)
        {
            control.view.style.lineHeight = (cache.lineHeight = height) + 'px';
        }

        return cache;
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



    this.text = function (control, view) {

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



});