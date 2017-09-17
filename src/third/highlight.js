flyingon.renderer('Highlight', function (base) {


    var styles = flyingon.create(null),
        cache;


    this.render = function (writer, control, className, cssText) {
        
        writer.push('<div');
        
        this.renderDefault(writer, control, className, (cssText || '') + 'overflow:auto');
        
        writer.push('><pre style="margin:0;width:auto;height:auto;"><code style="overflow:visible;"></code></pre></div>');
    };



    this.theme = function (control, view, value) {

        if (!styles[value])
        {
            flyingon.link(flyingon.require.path('flyingon/third/highlight/styles/' + value + '.css'));
        }
    };


    this.code = function (control, view, value) {

        var hljs = window.hljs,
            any;

        if (hljs)
        {
            view = view.firstChild.firstChild;
            view.className = control.language();
            view[this.__text_name] = value;

            hljs.highlightBlock(view);
        }
        else if (any = cache)
        {
            any.push(control);
        }
        else
        {
            cache = [control];

            this.theme(control, view, control.theme());
            flyingon.script(flyingon.require.path('flyingon/third/highlight/highlight.js'), init);
        }
    };
        

    function init() {
        
        var list = cache,
            index = 0,
            control;

        while (control = list[index++])
        {
            control.renderer.code(control, control.view, control.code());
        }

        cache = null;
    };

        
});



flyingon.Control.extend('Highlight', function (base) {


    this.defaultWidth = 400;

    this.defaultHeight = 200;


    //当前语言
    this.defineProperty('language', 'javascript', {
        
        set: function (value) {

            this.rendered && this.renderer.set(this, 'code', this.code());
        }
    });


    //当前主题
    this.defineProperty('theme', 'vs', {
     
        set: function (value) {

            this.rendered && this.renderer.set(this, 'theme', value);
        }
    });


    //代码内容
    this.defineProperty('code', '', {
        
        set: function (value) {

            this.renderer.set(this, 'code', value);
        }
    });


}).register();