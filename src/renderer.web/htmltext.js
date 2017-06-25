flyingon.defineClass(flyingon.Renderer, function (base) {
    
    

    //绑定渲染器
    this.bind(flyingon.HtmlText);



    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>', control.html(), '</div>');
    };



    this.auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view.offsetWidth;
        }

        if (auto & 2)
        {
            control.offsetHeight = view.offsetHeight;
        }
    };


});