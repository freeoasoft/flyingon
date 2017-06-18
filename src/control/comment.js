//注释节点,主要作为插入标记用
flyingon.defineClass('Comment', flyingon.Control, function () {



    this.defaultValue('visible', false);


    this.defineProperty('text', '');



    this.visible = function () {

        return false;
    };



}).register('comment');