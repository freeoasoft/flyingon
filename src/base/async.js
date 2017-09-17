/**
 * @class flyingon.Async
 * @description 异步处理类
 */
flyingon.Async = Object.extend(function () {


    
    /**
     * @method sleep
     * @description 延时
     * @param {int} time 延时时间
     * @param {function} [done] 延时成功后调用方法
     * @param {function} [fail] 延时失败后调用方法
     * @return {object} 当前实例对象
     */
    this.sleep = function (time, done, fail) {
        
        if (done !== false || fail !== false)
        {
            var fn = function (value) {

                var as = new flyingon.Async();

                setTimeout(function () {

                    as.resolve(value);
                    as = null;

                }, time | 0);

                return as;
            };
            
            done = done !== false ? 1 : 0;
            
            if (fail !== false)
            {
                done += 2;
            }

            return registry(this, false, fn, done);
        }
                            
        return this;
    };
    
       
    /**
     * @method done
     * @description 注册成功执行函数或异步通知
     * @param {boolean} [asyn] 是否异步
     * @param {function} fn 调用方法
     * @return {object} 当前实例对象
     */
    this.done = function (asyn, fn) {

        return registry(this, asyn, fn, 1);
    };


    /**
     * @method fail
     * @description 注册执行失败函数或异步通知
     * @param {boolean} [asyn] 是否异步
     * @param {function} fn 调用方法
     * @return {object} 当前实例对象
     */
    this.fail = function (asyn, fn) {

        return registry(this, asyn, fn, 2);
    };
    
    
    /**
     * @method complete
     * @description 注册执行完毕函数或异步通知
     * @param {boolean} [asyn] 是否异步
     * @param {function} fn 调用方法
     * @return {object} 当前实例对象
     */
    this.complete = function (asyn, fn) {
        
        return registry(this, asyn, fn, 3);
    };


    //注册回调函数
    function registry(self, asyn, fn, state) {

        if (!fn)
        {
            fn = asyn;
            asyn = false;
        }
        
        if (fn)
        {
            var list = self.__list || (self.__list = []);

            list.push([asyn, fn, state, 0]);

            if (self.__state)
            {
                check_done(self);
            }
        }
        
        return self;
    };
    
    
    /**
     * @method resolve
     * @description 成功执行通知
     * @param {any} value 自定义通知参数
     * @return {object} 当前实例对象
     */
    this.resolve = function (value) {

        return complete(this, 1, value);
    };


    /**
     * @method reject
     * @description 失败执行通知
     * @param {string} error 错误信息
     * @param {boolean} [bubble] 是否向上冒泡
     * @return {object} 当前实例对象
     */
    this.reject = function (error, bubble) {
        
        this.bubble = bubble; //是否向上冒泡
        return complete(this, 2, void 0, error);
    };
    
        
    function complete(self, state, value, error) {
        
        var list = self.__list;
        
        self.__state = state;
        self.__value = value;
        self.__error = error;
        
        check_done(self);

        return self;
    };
        

    //检测是否完结
    function check_done(self) {
      
        var list = self.__list,
            index = 0,
            item,
            as;

        if (list)
        {
            while (item = list[index++])
            {
                //同步阻塞则退出
                if (!item[0] && (index > 1 || item[3]))
                {
                    return;
                }
                
                //异步等待且正在等待异步返回则继续处理下一条
                if (item[3])
                {
                    continue;
                }
                
                //执行
                if (typeof (as = item[1]) === 'function')
                {
                    try
                    {
                        switch (item[2])
                        {
                            case 1:
                                as = self.__state === 1 && as.call(self, self.__value);
                                break;
                                
                            case 2:
                                as = self.__state === 2 && as.call(self, self.__error);
                                break;
                                
                            case 3:
                                as = as.call(self, self.__value, self.__error);
                                break;
                        }
                    }
                    catch (e) //执行出错先移除当前项然后继续错误处理
                    {
                        self.__state = 2;
                        self.__error = e;
                        
                        //清除出错前的所有项
                        list.splice(0, index);
                        index = 0;
                        
                        continue;
                    }
                }
                
                //如果执行结果是异步
                if (as && as['flyingon.Async'] && !as.__state)
                {
                    //标记正在等待异步返回
                    item[3] = 1;
                    (as.__back_list || (as.__back_list = [])).push(list, item, self);
                }
                else
                {
                    list.splice(--index, 1);
                }
            }
            
            if (list.length > 0)
            {
                return;
            }
            
            index = 0;
        }
        
        //回溯检测
        if (list = self.__back_list)
        {
            while (item = list[index++])
            {
                item.splice(item.indexOf(list[index++]), 1);
                item = list[index++];
                
                //如果失败且未停止冒泡则向上传递错误信息
                if (self.__error && self.bubble)
                {
                    item.__state = 2;
                    item.__error = self.__error;
                }
                
                check_done(item);
            }
            
            list.length = 0;
            self.__back_list = null;
        }
    };
    


     /**
     * @method progress
     * @description 注册执行进度函数
     * @param {function} fn 执行函数
     * @return {object} 当前实例对象
     */
    this.progress = function (fn) {

        if (typeof fn === 'function')
        {
            (this.__progress || (this.__progress = [])).push(fn);
        }
        
        return this;
    };


     /**
     * @method notify
     * @description 执行进度通知
     * @param {any} value 自定义参数
     * @return {object} 当前实例对象
     */
    this.notify = function (value) {

        var list = this.__progress;
        
        if (list)
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                list[i].call(this, value);
            }
        }
        
        return this;
    };
    
    
}, false);

    

/**
 * @method delay
 * @for flyingon
 * @description 异步延时处理
 * @param {int} [delay] 指定延时时间
 * @param {function} fn 执行函数
 * @return {object} 当前实例对象
 */
flyingon.delay = function (delay, fn) {

    var as = new flyingon.Async();

    setTimeout(function () {

        if (typeof fn === 'function')
        {
            fn.call(as);
            fn = null;
        }
        else
        {
            as.resolve();
        }

        as = null;

    }, delay | 0);

    return as;
};