flyingon.renderer('LinkButton', function (base) {



    this.lineHeight = 1;



    this.render = function (writer, control, render) {

        writer.push('<a type="button"');
        
        render.call(this, writer, control);
        
        writer.push('></a>');
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


    this.href = function (control, view, value) {

        view.href = value;
    };



});