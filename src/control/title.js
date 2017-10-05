flyingon.Control.extend('Title', function (base) {
   
    

    this.defaultWidth = 60;


    //是否标题控件
    this.__box_title = true;

    
    //文本内容
    this.defineProperty('text', '', {
        
        set: this.__render_text
    });


    //文本内容是否html格式
    this.defineProperty('html', false, {
        
        set: this.__render_text
    });



    //检测是否必填
    this.__check = function () {

        var parent = this.parent;

        if (parent)
        {
            for (var i = 0, l = parent.length; i < l; i++)
            {
                if (parent[i].__required)
                {
                    return true;
                }
            }
        }
    };



}).register();