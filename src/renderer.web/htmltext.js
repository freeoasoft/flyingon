flyingon.renderer('HtmlText', function (base) {
    
    


    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>', control.html(), '</div>');
    };


    this.text = function (control, view, value) {

        view.innerHTML = value;
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