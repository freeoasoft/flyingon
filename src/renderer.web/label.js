flyingon.renderer('Label', function (base) {



    this.render = function (writer, control, render) {

        writer.push('<span');
        
        render.call(this, writer, control);
        
        writer.push('></span>');
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