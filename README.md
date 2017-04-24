flyingon javascript ui library
========

flyingon is an object oriented javascript ui library

flyingon是一个使用100%原生javascript开发前端组件库

不依赖任何其它第三方库, 小巧轻便(预计完成全部标准控件不足250K, 再经过gzip压缩的话可能不到100K), 支持几乎所有的浏览器

简单易用, 易扩展, 易维护, 增强的javascript面向对象功能支持具有不下于Java及C#等标准面向对象语言的能力


flyingon基于LGPLv3协议,无论您是个人或公司都可以免费使用!有关LPGLv3的更多细节,请参考相关内容


flyingon主要包含以下内容：

1. 核心库(类及继承, 属性, 事件, 序列化及反序列化, 数据绑定, 模块及依赖...)
2. 控件基础体系(盒模型, 样式, 拖拉, 调整大小, 选择器, 视图模型...)
3. 布局系统(Panel, Splitter, TabPanel, TabControl, OutlookBar...)
4. 基础控件(Button, TextBox, ComboBox...)
5. 高级控件(TreeView, Grid, TreeGrid, VerticalGrid, PropertyGrid...)


浏览器支持：
IE7+
FF3+
Safari4+
chrome2+
Opera9+



作者承诺: 本人会对flyingon持续升级,且永久免费!




类, 属性及事件示例
-----------------------------------

 

    //定义基类BaseClass
    var BaseClass = flyingon.defineClass(function () {


        //定义构造函数
        this.constructor = function (p1, p2) {

            this.p1 = p1;
            this.p2 = p2;
        };


        //定义静态成员
        this.statics = {
            
            static_value: 10,

            static_fn: function () {

                return 'static';
            }
        };


        //定义实例方法
        this.instance_fn = function () {

            return 'BaseClass';
        };


        //定义布尔型属性,默认值为false
        this.defineProperty('p_boolean', false);


        //定义整数型属性,默认值为0
        this.defineProperty('p_int', 0, {

            dataType: 'integer'
        });


        //定义数字型属性,默认值为0
        this.defineProperty('p_float', 0);


        //定义字符型属性,默认值为''
        this.defineProperty('p_string', '');


        //定义只读属性
        this.defineProperty('p_readonly', function () {

            return new Date();
        });

    });



    //定义子类ChildClass 从BaseClass继承
    var ChildClass = flyingon.defineClass(BaseClass, function (base) {


        //定义构造函数
        this.constructor = function (p1, p2, p3) {

            //调用父类构造函数
            base.constructor.call(this, p1, p2);
            this.p3 = p3;
        };


        //重载实例方法
        this.instance_fn = function () {

            //先调用父类的方法
            base.instance_fn.call(this);
            return 'ChildClass';
        };


    });



    //创建对象
    var obj1 = new BaseClass(1, 2);
    var obj2 = new ChildClass(1, 2, 3);


    //类型判断
    obj1.constructor === BaseClass; //true
    obj2.constructor === ChildClass; //true

    //类型检测
    obj2.is(BaseClass) === true; //true
    obj2.is(ChildClass) === true; //true

    //调用实例方法
    obj1.instance_fn() === 'BaseClass'; //true

    //调用继承的实例方法
    obj2.instance_fn() === 'ChildClass'; //true

    //调用静态方法
    BaseClass.static_fn() === 'static'; //true



    //获取属性值
    obj2.p_boolean() === false;    

    //设置属性值
    obj2.p_boolean(true);

    //自动类型转换
    obj2.p_boolean('2');    //true;
    obj2.p_int(3.2);        //3;
    obj2.p_int('3.5');      //3;
    obj2.p_int('3int');     //0
    obj2.p_string(3.2);     //'3.2'

    obj2.p_readonly();      //返回当前时间
    obj2.p_readonly(12);    //无法修改值

    //批量设置属性值
    obj2.sets({

        p_boolean: true,
        p_int: 20
    });


    //注册全局事件(可优先捕获任意对象触发的事件)
    flyingon.on('my_event', function (e, data) {
        
        alert('global event:' + event.type + data);
        
        //停止冒泡
        //e.stopPropagation();
    });

    //注册事件(支持事件冒泡)
    obj2.on('my_event', function (event, data) {

        alert(event.type + data);
    });

    //触发事件
    obj2.trigger('my_event', '+dddddd'); //弹出"my_event+dddddd"

    //注销所有my_event全局事件
    flyingon.off('my_event');

    //注销obj3上的所有my_event事件
    obj2.off('my_event');

    //再次触发事件
    obj2.trigger('my_event', '+dddddd'); //不会弹出对话框

    


更多相关使用方法请参考其它文档或demo示例


