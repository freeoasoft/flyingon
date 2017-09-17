/**
 * @class flyingon.Store
 * @description 数据存储器
 */
flyingon.Store = Object.extend._(function () {



    //所有存储器
    var all = flyingon.create(null);


    //注册的存储器
    var register = flyingon.create(null);



    this.init = function (data) {

        var id;

        this.data = data;

        do
        {
            id = '' + (Math.random() * 100000000 | 0);
        }
        while (all[id]);

        all[this.uniqueId = id] = this;
    };


    //封装只读存储器, 只开放get方法
    function to_readonly(store) {

        return {

            get: function (path) {

                return store.get(path);
            }
        };
    };



    this.get = function (path) {

    };


    this.set = function (path, value) {

    };


    this.push = function (path, item) {

    };


    this.pop = function (path) {

    };


    this.unshift = function (path, item) {

    };


    this.shift = function (path, item) {

    };


    this.splice = function (path, index, length, item) {

    };


    this.sort = function (path, fn) {

    };



    //注册当前存储器
    this.register = function (name, readonly) {
        
        if (name)
        {
            if (register[name])
            {
                throw 'store name "' + name + '" has exist!';
            }

            register[this.name = name] = readonly ? to_readonly(this) : this;
        }
    };
        

            
    /**
     * @method flyingon.store
     * @description 获取注册的存储器
     */
    flyingon.store = function (name) {

        return register[name];
    };


    /**
     * @method all
     * @static
     * @description 获取所有存储器(注: 此方法仅用于跟踪调试, 需限制避免未授权用户访问)
     */
    flyingon.Store.all = function () {

        return all;
    };


});