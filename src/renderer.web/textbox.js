flyingon.defineClass(flyingon.Renderer, function (base) {


    this.bind(flyingon.TextBox);



    //检测盒模型
    flyingon.dom_test(function (div) {
        
 
        div.innerHTML = '<input type="text" class="flyingon-control flyingon-textbox"/>';

        this.checkBoxModel(div.children[0]);


    }, this);

    

    this.render = function (writer, control, css) {

        var text = control.value();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<input type="text"');
        
        this.renderDefault(writer, control, css);
        
        writer.push(' value="', text, '"/>');
    };


    this.text = function (control, view, value) {

        view.value = value;
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        control.on('change', on_change);
    };


    function on_change(event) {

        var view = this.view;

        this.view = null;
        this.value(event.original_event.target.value);
        this.view = view;
    };


});