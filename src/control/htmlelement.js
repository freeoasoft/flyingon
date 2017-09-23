flyingon.HtmlElement = flyingon.Control.extend(function (base) {


    this.tagName = 'div';


    //内容文本
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.length > 0 && this.splice(0);
            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    //设置的text是否html(注意html注入漏洞)
    this.defineProperty('html', false);


    //是否排列子控件(如果子控件或子子控件不包含布局控件,此值设为false可提升性能)
    this.defineProperty('arrange', true);
    
    

    //扩展容器功能
    flyingon.fragment('f-container', this, base, true);



    //测量自动大小
    this.onmeasure = function (auto) {
        
        var tag = (this.offsetHeight << 16) + this.offsetWidth;

        if (this.__size_tag !== tag)
        {
            this.__size_tag = tag;
            this.__arrange_dirty = 2;
        }

        if (auto)
        {
            this.renderer.__measure_auto(this, auto);
        }
        else
        {
            return false;
        }
    };



    flyingon.renderer.bind(this, 'HtmlElement');



});