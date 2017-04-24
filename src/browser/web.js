
//全局动态执行js, 防止局部执行增加作用域而带来变量冲突的问题
flyingon.globalEval = function (text) {

    if (window.execScript)
    {
        //ie8不支持call, ie9的this必须是window否则会出错
        window.execScript(text);
    }
    else
    {
        window['eval'](text);
    }
};


//转换url为绝对路径
flyingon.absoluteUrl = (function () {

    var dom = document.createElement('a'),
        base = location.href.replace(/[?#][\s\S]*/, ''),
        regex;

    dom.href = '';

    if (!dom.href)
    {
        dom = document.createElement('div');
        regex = /"/g;
    }

    return function (url, path) {

        if (url)
        {
            if (regex)
            {
                dom.innerHTML = '<a href="' + url.replace(regex, '%22') + '"></a>';
                url = dom.firstChild.href;
            }
            else
            {
                dom.href = url;
                url = dom.href;
            }
        }
        else
        {
            url = base;
        }

        return path ? url.substring(0, url.lastIndexOf('/') + 1) : url;
    };

})();


//head兼容处理
document.head || (document.head = document.getElementsByTagName('head')[0]);


//创建脚本标签
flyingon.script = !-[1,] || document.documentMode === 9 ? (function () { //ie8不支持onload, ie9支持但是执行顺序无法保证

    var list = [],
        head = document.head;

    function change() {

        var dom, callback;

        while ((dom = list[0]) && dom.readyState === 'loaded')
        {
            list.shift();

            dom.onreadystatechange = null;
            
            //不使用appendChild防止低版本IE在标签未闭合时出错
            head.insertBefore(dom, head.lastChild || null);

            if (callback = list.shift())
            {
                callback.call(dom);
            }
        }
    };

    return function (src, callback) {

        var dom = document.createElement('script');

        list.push(dom, callback);

        dom.onreadystatechange = change;
        dom.src = src; //会立即发送请求,但只有添加进dom树才会执行

        return dom;
    };

})() : function (src, callback) {

    var dom = document.createElement('script');

    dom.onload = dom.onerror = function () {

        if (callback)
        {
            callback.call(this);
            callback = null;
        }
        
        dom = dom.onload = dom.onerror = null;
    };

    dom.async = false;
    dom.src = src;

    document.head.appendChild(dom);
    return dom;
};



//创建link标签
flyingon.link = function (href, type, rel) {

    var dom = document.createElement('link');

    dom.href = href;
    dom.type = type || 'text/css';
    dom.rel = rel || 'stylesheet';

    document.head.appendChild(dom);

    return dom;
};


//动态添加样式表
flyingon.style = function (cssText) {

    var dom = document.createElement('style');  

    dom.setAttribute('type', 'text/css');  

    if (dom.styleSheet) // IE  
    {
        dom.styleSheet.cssText = cssText;  
    }
    else // w3c  
    {
        dom.appendChild(document.createTextNode(cssText));  
    }

    document.head.appendChild(dom);
    return dom;
};


//dom事件扩展
(function (window, flyingon) {

    

    var fixed = window.Event && Event.prototype,
        on = 'addEventListener';


    
    //以下为通用事件扩展(IE8以下浏览器不支持addEventListener)
    //IE的attachEvent中this为window且执行顺序相反
    if (!window[on])
    {
        on = false;
    }
    else if (fixed && !fixed.__stopPropagation) //修复w3c标准事件不支持cancelBubble的问题
    {
        fixed.__preventDefault = fixed.preventDefault;
        fixed.__stopPropagation = fixed.stopPropagation;
        fixed.__stopImmediatePropagation = fixed.stopImmediatePropagation;
        
        fixed.preventDefault = preventDefault;
        fixed.stopPropagation = stopPropagation;
        fixed.stopImmediatePropagation = stopImmediatePropagation;
    }
    


    //触发dom事件
    function trigger(e) {

        var items = this.__events,
            fn;

        if (items = items && items[e.type])
        {
            if (!e.target)
            {
                e.target = e.srcElement;
                e.preventDefault = preventDefault;
                e.stopPropagation = stopPropagation;
                e.stopImmediatePropagation = stopImmediatePropagation;
            }

            for (var i = 0, l = items.length; i < l; i++)
            {
                if ((fn = items[i]) && !fn.disabled)
                {
                    if (fn.call(this, e) === false && e.returnValue !== false)
                    {
                        e.preventDefault();
                    }

                    if (e.cancelBubble)
                    {
                        break;
                    }
                }
            }
        }
    };
    
    
    //修复attachEvent的this指向不正确的问题
    function trigger_fixed(dom) {
        
        function fn(e) {
          
            trigger.call(fn.dom, e || window.event); 
        };
        
        fn.dom = dom;
        
        //防止IE内存泄露
        dom = null;
        
        return fn;
    };


    function preventDefault() {

        this.returnValue = false;
        this.__preventDefault && this.__preventDefault();
    };

    
    function stopPropagation() {

        this.cancelBubble = true;
        this.__stopPropagation && this.__stopPropagation();
    };

    
    function stopImmediatePropagation() {

        this.cancelBubble = true;
        this.returnValue = false;
        this.__stopImmediatePropagation && this.__stopImmediatePropagation();
    };
        
    
    //挂起函数
    function suspend(e) {
      
        e.stopPropagation(); //有些浏览器不会设置cancelBubble
    };
    

    //只执行一次绑定的事件
    flyingon.dom_once = function (dom, type, fn) {

        function callback() {

            fn.apply(this, arguments);
            flyingon.dom_off(dom, type, callback);
        };

        flyingon.dom_on(dom, type, callback);
    };


    //添加dom事件绑定
    flyingon.dom_on = function (dom, type, fn, capture) {

        if (dom && type && fn)
        {
            var events = dom.__events,
                items;

            if (events)
            {
                if (items = events[type])
                {
                    items.push(fn);
                    return this;
                }
            }
            else
            {
                events = dom.__events = {};
            }

            events[type] = [fn];

            if (on)
            {
                dom[on](type, trigger, capture);
            }
            else
            {
                dom.attachEvent('on' + type, events.trigger || (events.trigger = trigger_fixed(dom)));
            }
        }
    };

    
    //暂停dom事件处理
    flyingon.dom_suspend = function (dom, type) {
        
        var items = dom && dom.__events;

        if (items = items && items[type])
        {
            items.unshift(suspend);
        }
    };
    
    
    //继续dom事件处理
    flyingon.dom_resume = function (dom, type) {
        
        var items = dom && dom.__events;

        if ((items = items && items[type]) && items[0] === suspend)
        {
            items.shift();
        }
    };
    

    //移除dom事件绑定
    flyingon.dom_off = function (dom, type, fn) {

        var events = dom && dom.__events,
            items;

        if (items = events && events[type])
        {
            if (fn)
            {
                for (var i = items.length - 1; i >= 0; i--)
                {
                    if (items[i] === fn)
                    {
                        items.splice(i, 1);
                    }
                }

                if (items.length > 0)
                {
                    return;
                }
            }

            if (on)
            {
                dom.removeEventListener(type, trigger);
            }
            else
            {
                dom.detachEvent('on' + type, events.trigger);
            }

            delete events[type];

            for (type in events)
            {
                return;
            }

            if (fn = events.trigger)
            {
                events.trigger = fn.dom = null;
            }
            
            dom.__events = void 0;
        }
    };

    

})(window, flyingon);




//dom样式扩展
(function (document, flyingon) {
    
    

    var dom = document.documentElement,

        fixed = flyingon.create(null), //css兼容处理

        prefix = 'ms',     //样式前缀

        regex = /^-(\w+)-/, //样式检测

        style,

        any;



    //获取浏览器样式前缀
    if (any = window.getComputedStyle)
    {
        style = any(dom);

        for (var i = style.length - 1; i >= 0; i--)
        {
            if (any = style[i].match(regex))
            {
                prefix = any[1];
                break;
            }
        }
    }


    //测试样式
    style = dom.style;

    //转驼峰命名
    regex = /\-(\w)/g;

    //转换css名为驼峰写法
    function fn(_, x) {

        return x.toUpperCase();
    };


    //自动处理样式
    function css_name(name) {

        var key = name.replace(regex, fn),
            css = name;

        if (!(key in style))
        {
            key = prefix + key.charAt(0).toUpperCase() + key.substring(1);
            
            if (key in style)
            {
                css = '-' + prefix + '-' + name;
            }
            else
            {
                key = css = '';
            }
        }

        return fixed[name] = {

            name: key,
            css: css
        };
    };


    //获取可用样式名
    //name: 要获取的样式名(css样式名, 以'-'分隔的样式名)
    flyingon.css_name = function (name) {

        return (fixed[name] || css_name(name)).name;
    };
    
    
    //设置css样式值
    //dom:      目标dom
    //name:     要获取的样式名(css样式名, 以'-'分隔的样式名)
    //value:    样式值
    flyingon.css_value = function (dom, name, value) {

        var items = fixed[name] || css_name(name),
            any;

        if (any = items.set)
        {
            any(value, dom);
        }
        else if (any = items.name)
        {
            dom.style[any] = value;
        }
    };
    
    
    //获取css样式文本
    flyingon.css_text = function (name, value) {
        
        name = (fixed[name] || css_name(name)).css;
        return name ? name + ':' + value + ';' : '';
    };


    
    //注册样式兼容处理
    //name:     要处理的样式名(css样式名, 以'-'分隔的样式名)
    //set:      转换样式值的方法
    flyingon.css_fixed = function (name, set, style_name) {

        if (name && set && !css_name(name).name)
        {
            fixed[name] = {

                name: style_name || name.replace(regex, fn),
                css: name,
                set: set
            };
        }
    };


    //处理ie允许选中
    flyingon.css_fixed('user-select', (function () {

        function event_false() {

            return false;
        };

        return function (value, dom) {

            if (dom)
            {
                (dom === document.body ? document : dom).onselectstart = value === 'none' ? event_false : null;
            }
        };

    })());
    
    
})(document, flyingon);




//html文档树加载完毕
flyingon.ready = (function () {

    var list, timer;

    function ready() {

        if (list)
        {
            flyingon.dom_off(document, 'DOMContentLoaded', ready);
            flyingon.dom_off(window, 'load', ready);

            for (var i = 0; i < list.length; i++) //执行过程中可能会加入函数，故不能缓存length
            {
                list[i++].call(list[i]);
            }

            list = null;

            if (timer)
            {
                clearTimeout(timer);
            }
        }
    };

    function check() {

        if (document.readyState === 'complete')
        {
            ready();
        }
        else
        {
            if (!list)
            {
                list = [];

                flyingon.dom_on(document, 'DOMContentLoaded', ready);
                flyingon.dom_on(window, 'load', ready);
            }

            timer = setTimeout(check, 0);
        }
    };

    check();

    return function (fn, context) {

        if (typeof fn === 'function')
        {
            if (list)
            {
                list.push(fn, context);
            }
            else
            {
                fn.call(context);
            }
        }
    };

})();




//dom测试
flyingon.dom_test = (function () {

    var dom = document.createElement('div'),
        list;

    dom.id = 'flyingon-dom-test';
    dom.style.cssText = 'position:absolute;overflow:hidden;margin:0;border:0;padding:0;left:-10px;top:0;width:0;height:0;';

    if (document.body)
    {
        document.body.appendChild(dom);
    }
    else
    {
        list = [];

        flyingon.ready(function () {

            var index = 0,
                fn;

            list = null;
            document.body.appendChild(dom);

            while (fn = this[index++])
            {
                fn.call(this[index++], dom);
            }

        }, list);
    }
    
    return function (fn, context) {

        if (list)
        {
            list.push(fn, context);
        }
        else
        {
            fn.call(context, dom);
        }
    };

})();



//在dom元素内插入html片段
flyingon.dom_html = document.head.insertAdjacentHTML ? (function () {
    
    var div;

    //注: script等标签可能不支持insertAdjacentHTML
    function fn(host, dom, type, html) {

        if (dom.insertAdjacentHTML)
        {
            dom.insertAdjacentHTML(type, html);
        }
        else
        {
            dom = div || (div = document.createElement('div'));
            dom.innerHTML = html;

            if (dom = dom.firstChild)
            {
                dom.parentNode.removeChild(dom);
                host.appendChild(dom);
            }
        }
    };

    return function (dom, html, refChild) {
        
        if (dom && html)
        {
            if (refChild)
            {
                fn(dom, refChild, 'beforebegin', html);
            }
            else if (refChild = dom.lastChild)
            {
                fn(dom, refChild, 'afterend', html);
            }
            else
            {
                dom.innerHTML = html;
            }
        }
    }

})() : function (dom, html, refChild) {
        
    var range;

    if (refChild)
    {
        range = document.createRange();
        range.setStartBefore(refChild);
        dom.insertBefore(range.createContextualFragment(html), refChild);
    }
    else if (refChild = dom.lastChild)
    {
        range = document.createRange();
        range.setStartAfter(refChild);
        dom.appendChild(range.createContextualFragment(html));
    }
    else
    {
        dom.innerHTML = html;
    }
};



//拖动基础方法
flyingon.dom_drag = function (context, event, begin, move, end, locked, delay) {

    var dom = event.dom || event.target,
        style = dom.style,
        on = flyingon.dom_on,
        off = flyingon.dom_off,
        x0 = dom.offsetLeft,
        y0 = dom.offsetTop,
        x1 = event.clientX,
        y1 = event.clientY,
        distanceX = 0,
        distanceY = 0;

    function start(e) {
        
        if (begin)
        {
            e.dom = dom;
            begin.call(context, e);
        }
        
        flyingon.dom_suspend(dom, 'click', true);
        flyingon.css_value(document.body, 'user-select', 'none');
        
        if (dom.setCapture)
        {
            dom.setCapture();
        }
        
        start = null;
    };
    
    function mousemove(e) {

        var x = e.clientX - x1,
            y = e.clientY - y1;

        if (!start || (x < -2 || x > 2 || y < -2 || y > 2) && start(e))
        {
            if (move)
            {
                e.dom = dom;
                e.distanceX = x;
                e.distanceY = y;
                
                move.call(context, e);
                
                x = e.distanceX;
                y = e.distanceY;
            }
            
            distanceX = x;
            distanceY = y;
            
            if (locked !== true)
            {
                if (locked !== 'x')
                {
                    style.left = (x0 + x) + 'px';
                }

                if (locked !== 'y')
                {
                    style.top = (y0 + y) + 'px';
                }
            }
            
            e.stopImmediatePropagation();
        }
    };

    function mouseup(e) {

        off(document, 'mousemove', mousemove);
        off(document, 'mouseup', mouseup);

        if (!start)
        {
            flyingon.css_value(document.body, 'user-select', '');
            
            if (dom.setCapture)
            {
                dom.releaseCapture();
            }

            setTimeout(resume, 0);
            
            if (end)
            {
                e.dom = dom;
                e.distanceX = distanceX;
                e.distanceY = distanceY;
                
                end.call(context, e);
            }
        }
    };
    
    function resume() {
      
        flyingon.dom_resume(dom, 'click', true);
    };
    
    if (delay === false)
    {
        start(event);
    }

    on(document, 'mousemove', mousemove);
    on(document, 'mouseup', mouseup);
    
    event.stopImmediatePropagation();
};



//对齐到指定的dom
//dom: 要对齐的dom元素
//rect: 停靠范围
//direction: 停靠方向 bottom:下面 top:上面 right:右边 left:左边
//align: 对齐 left|center|right|top|middle|bottom
//reverse: 空间不足时是否反转方向
flyingon.dom_align = function (dom, rect, direction, align, reverse) {

    var width = dom.offsetWidth,
        height = dom.offsetHeight,
        style = dom.style,
        x = document.body.scrollLeft,
        y = document.body.scrollTop,
        x1 = x + rect.left,
        y1 = y + rect.top,
        x2 = x + rect.right,
        y2 = y + rect.bottom;

    //检测是否需倒转方向
    if (reverse !== false)
    {
        dom = document.documentElement;

        x = window.innerWidth || dom.offsetWidth || 0,
        y = window.innerHeight || dom.offsetHeight || 0;

        switch (direction)
        {
            case 'left':
                if (x1 < width && x - x2 >= width)
                {
                    direction = 'right';
                }
                break;

            case 'top':
                if (y1 < height && y - y2 >= height)
                {
                    direction = 'bottom';
                }
                break;

            case 'right':
                if (x1 >= width && x < x2 + width)
                {
                    direction = 'left';
                }
                break;

            default: 
                if (y1 >= height && y < y2 + height)
                {
                    direction = 'top';
                }
                break;
        }
    }

    if (direction === 'left' || direction === 'right')
    {
        x = direction === 'left' ? x1 - width : x2;

        switch (align)
        {
            case 'middle':
                y = y1 + (y2 - y1 - height >> 1);
                break;

            case 'bottom':
                y = y2 - height;
                break;

            default:
                y = y1;
                break;
        }
    }
    else
    {
        switch (align)
        {
            case 'center':
                x = x1 - (x2 - x1 - width >> 1);
                break;

            case 'right':
                x = x2 - width;
                break;

            default:
                x = x1;
                break;
        }

        y = direction === 'top' ? y1 - height : y2;
    }
    
    style.left = x + 'px';
    style.top = y + 'px';

    return { left: x, top: y };
};



//显示或隐藏摭罩层
flyingon.dom_overlay = (function () {
    
    var list = [],
        overlay = document.createElement('div');

    overlay.className = 'flyingon-overlay';

    return function (dom, visible) {

        if (dom)
        {
            var any;

            if (visible === false)
            {
                if (list[list.length - 1] === dom)
                {
                    dom.flyingon_overlay = false;
                    list.pop();
                    
                    while (dom = list[list.length - 1])
                    {
                        overlay.style.zIndex = dom.style.zIndex;

                        if (any = dom.parentNode)
                        {
                            any.insertBefore(overlay, dom);
                            return;
                        }

                        dom.flyingon_overlay = false;
                        list.pop();
                    }
                    
                    if (any = overlay.parentNode)
                    {
                        any.removeChild(overlay);
                    }
                }
            }
            else if (any = dom.parentNode)
            {
                overlay.style.zIndex = dom.style.zIndex;
                any.insertBefore(overlay, dom);

                dom.flyingon_overlay = true;
                list.push(dom);
            }
        }
    };

})();



//html编码函数
flyingon.html_encode = (function () {
    
    var values = {
        
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\'': '&apos;',
        '"': '&quot;'
    };

    return function (text) {

        if (text)
        {
            var keys = values;

            return text.replace(/([&<>'"])/g, function (_, key) {

                return keys[key];
            });
        }

        return '';
    };

})();