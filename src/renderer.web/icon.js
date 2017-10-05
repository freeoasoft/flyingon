flyingon.renderer('Icon', function (base) {



    this.padding = 0;



    this.render = function (writer, control, render) {

        writer.push('<a');
        
        render.call(this, writer, control);
        
        writer.push('><span class="f-icon-body"></span></a>');
    };



    this.icon = function (control, view, value) {

        view.firstChild.className = 'f-icon-body' + (value ? ' ' + value : '');
    };


    this.size = function (control, view, value) {

        var style = view.firstChild.style;

        style.width = style.height = value + 'px';
        style.marginLeft = style.marginTop = (value >> 1) + 'px';
    };



});