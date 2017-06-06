//html元素节点
flyingon.defineClass('HtmlElement', flyingon.Control, function (base) {


    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);


    //html标签名
    this.tagName = 'div';



    //引入容器功能片段    
    flyingon.__container_fragment(this);



    //测量自动大小
    this.onmeasure = function (auto) {
        
        this.renderer.measure(this, auto);
        return !auto;
    };


});