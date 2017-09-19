describe('oo:', function () {


	it('flyingon.defineModule', function () {
        
        flyingon.defineModule('a.b', function () {
        
            this.c = 1;
        });

        expect(flyingon.use('a.b.c')).toBe(1);

        flyingon.defineModule('a.b');

        flyingon.defineClass('T', function () {});

        expect(flyingon.use('a.b.T')).toBeDefined();

        flyingon.endModule();
    });


    it('flyingon.fragment', function () {

        var target = {};

        flyingon.fragment('test', function () {

            this.a = 1;
        });

        flyingon.fragment('test', target);
        expect(target.a).toBe(1);
    });


    it('flyingon.defineClass', function () {


        //定义基类BaseClass 从Object继承
        var BaseClass = Object.extend(function () {
        
                
            //定义构造函数
            this.init = function (p1, p2) {
    
                this.p1 = p1;
                this.p2 = p2;
            };
    
    
            //定义实例方法
            this.fn = function () {
    
                return 'BaseClass';
            };
    
    
            //定义布尔型属性,默认值为false
            this.defineProperty('p_boolean', false);
    
    
            //定义整数型属性,默认值为0
            this.defineProperty('p_int', 0, {
    
                dataType: 'int'
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
        var ChildClass = BaseClass.extend(function (base) {
    
    
            //定义构造函数
            this.init = function (p1, p2, p3) {
    
                //调用父类构造函数
                base.init.call(this, p1, p2);
                this.p3 = p3;
            };
    
    
            //重载实例方法
            this.fn = function () {
    
                //先调用父类的方法
                base.fn.call(this);
    
                return 'ChildClass';
            };
    
    
        });

            
        //创建对象
        var obj1 = new BaseClass(1, 2);
        var obj2 = new ChildClass(1, 2, 3);

        //类型判断
        expect(obj1.Class).toBe(BaseClass);
        expect(obj2.Class).toBe(ChildClass); //true
        
        //类型检测
        expect(obj2.is(BaseClass)).toBe(true); //true
        expect(obj2.is(ChildClass)).toBe(true); //true

        //调用实例方法
        expect(obj1.fn()).toBe('BaseClass'); //true

        //调用继承的实例方法
        expect(obj2.fn()).toBe('ChildClass'); //true


        //获取属性值
        expect(obj2.p_boolean()).toBe(false);    

        //设置属性值 第二个参数表示是否触发变更事件及数据绑定, 默认触发
        obj2.p_boolean(true)
        expect(obj2.p_boolean()).toBe(true);

        //自动类型转换
        obj2.p_boolean('2');
        expect(obj2.p_boolean()).toBe(true);

        obj2.p_int(3.2);
        expect(obj2.p_int()).toBe(3);

        obj2.p_int('3.5');
        expect(obj2.p_int()).toBe(3);

        obj2.p_int('3int');
        expect(obj2.p_int()).toBe(0);

        obj2.p_string(3.2);
        expect(obj2.p_string()).toBe('3.2');

        expect(obj2.p_readonly() instanceof Date).toBe(true);

        obj2.p_readonly(12);
        expect(obj2.p_readonly() instanceof Date).toBe(true);
        

        var tag;

        flyingon.on('type', function (e) {

            tag = e.type + e.data;
            e.stop();
        });

        obj2.on('type', function (e) {

            tag = e.type + e.data;
        });

        obj2.trigger('type', 'data', '1');
        expect(tag).toBe('type1');

        flyingon.off('type');

        obj2.trigger('type', 'data', '2'); //不会弹出对话框
        expect(tag).toBe('type2');

    });



    it('Object.extend', function () {

        Object.extend('Test1', function () {

            this.key1 = 1;

        }).register();


        flyingon.Test1.extend('Test2', function () {

            this.key2 = 2;
        });


        var obj1 = new flyingon.Test1();
        var obj2 = new flyingon.Test2();

        expect(obj1.key1).toBe(1);
        expect(obj2.key1).toBe(1);
        expect(obj2.key2).toBe(2);

        expect(flyingon.components.Test1).toBe(flyingon.Test1);
    });


});