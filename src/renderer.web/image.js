flyingon.renderer('Image', function (base) {



    this.render = function (writer, control, render) {

        writer.push('<img');
        
        render.call(this, writer, control);
        
        writer.push('></img>');
    };



    this.src = function (control, view, value) {

        view.src = value;
    };


    this.alt = function (control, view, value) {

        view.alt = value;
    };



});