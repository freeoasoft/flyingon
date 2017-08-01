flyingon.renderer('TextBox', function (base) {



    //检测盒模型
    flyingon.dom_test(function (div) {
        
 
        div.innerHTML = '<input type="text" class="f-control f-textbox"/>';

        this.checkBoxModel(div.children[0]);


    }, this);

    

    this.render = function (writer, control, css) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<input type="text"');
        
        this.renderDefault(writer, control, css);
        
        writer.push(' value="', text, '"/>');
    };


    this.text = function (control, view) {

        view.value = control.text();
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        view.onchange = onchange;
    };


    this.unmount = function (control) {

        control.view.onchange = null;
        base.unmount.call(this, control);
    };


    function onchange() {

        var control = flyingon.findControl(this);

        control.hasRender = false;
        control.value(this.value);
        control.hasRender = true;

        this.value = control.text();

        control.trigger('change', 'value', this.value);
    };


});