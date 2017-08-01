flyingon.defineClass('Unkown', flyingon.Control, function (base) {


    this.tagName = 'div';


    this.defineProperty('text', '', {
        
        set: function (value) {

            this.length > 0 && this.clear();
            this.hasRender && this.renderer.set(this, 'text', value);
        }
    });
    

    

    //扩展容器功能
    flyingon.__extend_container.call(this);



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


    this.compute = function () {

        this.renderer.compute();
        return this;
    };


 
    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.length > 0)
        {
            writer.writeProperty('children', this, true);
        }
        
        return this;
    };
    

    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            this[i].dispose(false);
        }

        base.dispose.apply(this, arguments);
        return this;
    };



});