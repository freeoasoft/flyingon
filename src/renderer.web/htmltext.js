flyingon.defineClass(flyingon.Renderer, function (base) {
    
    

    //绑定渲染器
    this.bind(flyingon.HtmlText);



    //渲染html
    this.render = function (writer, control) {

        var auto = control.__auto_size, 
            style;

        if (auto)
        {
            style = '';

            if (auto & 1)
            {
                style = 'width:auto;';
            }

            if (auto & 2)
            {
                style += 'height:auto;';
            }
        }

        writer.push('<div', this.renderDefault(control, '', style), '>', control.html(), '</div>');
    };



    this.auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view.offsetWidth;
        }

        if (auto & 2)
        {
            control.offsetHeight = view.offsetWidth;
        }
    };


});