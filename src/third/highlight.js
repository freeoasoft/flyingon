flyingon.renderer('Highlight', function (base) {


    var styles = flyingon.create(null),
        cache;


    this.render = function (writer, control, render) {
        
        writer.push('<div');
        
        render.cssText = 'overflow:auto';
        render.call(this, writer, control);
        
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

            try
            {
                hljs.highlightBlock(view); //不支持IE8以下浏览器
            }
            catch (e)
            {
            }
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
        
        set: function (name, value) {

            this.renderer.set(this, 'code', this.code());
        }
    });


    //当前主题
    this.defineProperty('theme', 'vs', {
     
        set: this.render
    });


    //代码内容
    this.defineProperty('code', '', {
        
        set: this.render
    });


}).register();