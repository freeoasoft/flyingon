flyingon.renderer('Error', 'Label', function (base) {

    

    this.__line_height = 1;
    


    this.render = function (writer, control, render) {

        writer.push('<span');
        
        render.call(this, writer, control);
        
        writer.push('><span class="f-error-', control.type(), '"></span></span>');
    };


    this.type = function (control, view, value) {

        var name = 'f-error-' + value;

        view = view.firstChild;

        if (value !== 'text')
        {
            name = 'f-error-icon ' + name;
            view.innerHTML = '';
        }

        view.className = name;
    };


    this.text = function (control, view, value) {

        view.firstChild.innerHTML = value;
    };


});