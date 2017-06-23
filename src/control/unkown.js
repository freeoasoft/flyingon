flyingon.defineClass('Unkown', flyingon.Control, function (base) {


    this.tagName = '';



    
    //引入容器功能片段
    flyingon.__container_fragment(this);



    //测量自动大小
    this.onmeasure = function (auto, border) {
        
        if (auto)
        {
            this.renderer.measure_auto(this, auto, border);
        }
        else
        {
            return false;
        }
    };


    this.compute = function () {

        this.renderer.compute();
        return this;
    };


 
    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.firstChild)
        {
            writer.writeProperty('children', this.children());
        }
        
        return this;
    };
    

    this.dispose = function (recursion) {

        var item = this.firstChild;
        
        if (item)
        {
            do
            {
                item.dispose(true);
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = this.__children = null;
        }

        return base.dispose.call(this) || this;
    };



});