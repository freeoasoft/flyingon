flyingon.renderer('BaseGrid', function (base) {



    //当前渲染的控件集合
    var controls = [];

    //id
    var id = 1;

    //调整列宽时的辅助线
    var dom_resize;



    this.__no_padding = this.padding = 0;


    this.render = function (writer, control) {

        var header = control.header();

        writer.push('<div');

        this.renderDefault(writer, control, 'f-grid', 'overflow:hidden;');

        writer.push('>',
            '<div class="f-grid-head" style="height:', header, 'px;"></div>',
            '<div class="f-grid-scroll" style="top:', header, 'px;" onscroll="flyingon.BaseGrid.onscroll(this, event)">',
                this.__scroll_html,
            '</div>',
            '<div class="f-grid-body" style="top:', header, 'px;" tabindex="0">',
                '<div class="f-grid-top"></div>',
                '<div class="f-grid-middle"></div>',
                '<div class="f-grid-bottom"></div>',
            '</div>',
        '</div>');
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        control.view_head = view.firstChild;
        control.view_body = view = view.lastChild;
        control.view_scroll = view = view.previousSibling;
    };


    this.unmount = function (control) {

        var view = control.view.lastChild;

        control.view_head = control.view_body = control.view_scroll = null;

        base.unmount.call(this, control);
    };



    flyingon.BaseGrid.onscroll = function (dom) {

        var control = flyingon.findControl(dom),
            renderer = control.renderer,
            storage = control.__storage || control.__defaults,
            columns = control.__columns,
            x = dom.scrollLeft,
            any;

        //计算可见列范围
        columns.visibleRange(x, dom.offsetWidth);

        //绘制列头
        if ((any = storage.header) && any > 0)
        {
            renderer.__render_header(control, columns, any);
        }

        //绘制内容
        renderer.__render_body(control, columns);

        //控制滚动位置
        control.view_head.firstChild.style[flyingon.rtl ? 'right' : 'left'] = -x + columns.locked1 + 'px';
    };


    flyingon.BaseGrid.resize = function (e) {

        var control = flyingon.findControl(this),
            columns = control.__columns,
            column = columns[this.parentNode.getAttribute('column-index')],
            view = control.view,
            dom = this,
            left = 0,
            data = { 
                control: flyingon.findControl(this), 
                column: column,
                width: column.width 
            };

        columns.dirty = true;
        control.view.appendChild(e.dom = dom_resize || (dom_resize = init_resize()));

        while (dom !== view)
        {
            left += dom.offsetLeft;
            dom = dom.parentNode;
        }

        e.dom.style.left = left + 'px';

        flyingon.dom_drag(data, e, null, do_resize, resize_end, 'y');
    };


    function init_resize() {

        var dom = dom_resize = document.createElement('div');

        dom.className = 'f-grid-resize-thumb';
        
        return dom;
    };


    function do_resize(e) {

        var width = this.column.width;

        if (width + e.distanceX < 1)
        {
            e.distanceX = -width + 1;
        }
    };

        
    function resize_end(e) {

        var control = this.control,
            storage = this.column.storage(),
            width = this.width + e.distanceX;

        control.view.removeChild(dom_resize);

        if (storage.size !== width)
        {
            storage.size = width;
            storage.persent = false;

            control.renderer.__column_size(control, control.view);
        }
    };



    this.locate = function (control) {

        base.locate.call(this, control);
        this.refresh(control, control.view);
    };


    this.locate_html = function (control) {


    };


    //更新指定
    this.__update = function (control, x, y, width, height) {

        var storage = control.__storage || control.__defaults,
            columns = control.__columns,
            rows = control.__rows,
            any;

        //计算列宽度
        if (columns.dirty || columns.arrangeWidth !== width)
        {
            columns.compute(width);
            columns.visibleRange(x, width);
        }
        else if (columns.arrangeLeft !== x)
        {
            columns.visibleRange(x, width);
        }

        //控制滚动条
        control.view_body.style.bottom = columns.scroll ? flyingon.hscroll_height + 'px' : '1px';
        control.view_scroll.firstChild.style.width = columns.width + 'px';

        //绘制列头
        if ((any = storage.header) && any > 0)
        {
            this.__render_header(control, columns, any);
        }

        //绘制内容
        this.__render_body(control, columns);
    };


    this.__render_header = function (control, columns, height) {

        var writer = [],
            view = control.view_head,
            any;

        if (any = view.firstChild)
        {
            view = any;

            //绘制可见区(仅绘制前面部分)
            for (var i = columns.start, l = columns.end; i < l; i++)
            {
                any = columns[i];

                if (!any.rendered)
                {
                    this.render_header(writer, control, columns[i], height);
                }
            }

            writer[0] && flyingon.dom_html(view, writer.join(''));

            view.style.left = (view = view.nextSibling).style.width = columns.locked1 + 'px';
            view.nextSibling.style.width = columns.locked2 + 'px';
        }
        else //第一次绘制
        {
            any = control.__locked;

            writer.push('<div class="f-grid-center" style="', flyingon.rtl ? 'right:' : 'left:', columns.locked1, 'px;">');

            //绘制可见区(仅绘制前面部分)
            for (var i = columns.start, l = columns.end; i < l; i++)
            {
                this.render_header(writer, control, columns[i], height);
            }

            writer.push('</div><div class="f-grid-left" style="', any[0] ? 'width:' + columns.locked1 + 'px' : 'display:none', ';">');

            //绘制前锁定
            if (any[0])
            {
                for (var i = 0, l = any[0]; i < l; i++)
                {
                    this.render_header(writer, control, columns[i], height);
                }

                writer.push('<div class="f-grid-line"></div>');
            }
            
            writer.push('</div><div class="f-grid-right" style="', any[1] ? 'width:' + columns.locked2 + 'px' : 'display:none', ';">');

            //绘制后锁定
            if (any[1])
            {
                for (var i = columns.length - any[1], l = columns.length; i < l; i++)
                {
                    this.render_header(writer, control, columns[i], height);
                }

                writer.push('<div class="f-grid-line"></div>');
            }

            writer.push('</div>');

            view.innerHTML = writer.join('');
        }

        if (controls[0])
        {
            this.__mount_controls(control, true);
        }
    };


    this.render_header = function (writer, control, column, height) {

        var storage = column.__storage || column.__defaults,
            title = storage.title;

        title = column.render_header(title);
        column.rendered = true;

        if (title instanceof Array)
        {
            render_multi(writer, control, column, title, height, storage.resizable);
        }
        else
        {
            render_header(writer, control, column, title, 0, column.width, height, 0, storage.resizable);
        }
    };


    function render_multi(writer, control, column, title, height, resizable) {

        var y = 0,
            width = column.width,
            length = title.length,
            item,
            span,
            w,
            h;

        for (var i = 0; i < length; i++)
        {
            item = title[i];
            w = width;

            if (item && typeof item === 'object')
            {
                h = item.height | 0;
                h = h > 0 ? h : (height / (length - i) | 0);

                if ((span = item.span | 0) > 0)
                {
                    w += column_span(control.__columns, column.absoluteIndex, span);
                }
            }
            else
            {
                h = height / (length - i) | 0;
                span = 0;
            }

            render_header(writer, control, column, item, y, w, h, span, resizable);

            y += h;
            height -= h;
        }
    };


    //获取跨列的宽度
    function column_span(columns, index, length) {

        var width = 0,
            item;

        for (var i = 1; i <= length; i++)
        {
            if (item = columns[index + i])
            {
                width += item.width;
            }
            else
            {
                break;
            }
        }

        return width;
    };


    function render_header(writer, control, column, title, y, width, height, span, resizable) {

        var index = column.absoluteIndex,
            any;

        writer.push('<div class="f-grid-back" style="left:', column.left, 'px;top:', y, 
            'px;width:', width, 'px;height:', height, 'px;', span ? 'z-index:1;' : '',
            '" column-index="', index, 
            '" column-end="', index + span, '">',
            '<div class="f-grid-cell" style="line-height:', height, 'px;">');

        if (title && typeof title === 'object')
        {
            if (any = title.control)
            {
                any = render_control(writer, any);

                any.parent = control;
                any.rowIndex = -1;
                any.columnIndex = index;

                (column.controls || (column.controls = [])).push(any);
            }
            else
            {
                writer.push('<span>', title.text, '</span>');
            }
        }
        else
        {
            writer.push('<span>', title, '</span>');
        }
                
        writer.push('</div>');

        if (resizable)
        {
            writer.push('<div class="f-grid-resize" onmousedown="flyingon.BaseGrid.resize.call(this, event);"></div>');
        }
        
        writer.push('</div>');
    };


    //渲染控件
    function render_control(writer, control) {

        var renderer = control.renderer;

        if (!renderer)
        {
            control = flyingon.ui(control);
            renderer = control.renderer;
        }

        //编写唯一id
        control.__id = '__f_grid_' + id++;
        control.__as_html = true;

        //渲染
        renderer.render(writer, control);

        //添加到渲染控件集合
        controls.push(control);

        return control;
    };


    //渲染控件
    this.render_control = render_control;



    this.__render_body = function (control, columns) {

    };



    this.__remove_column = function () {


    };


    this.__column_size = function (control, view) {

        var columns = control.__columns,
            any;

        columns.compute(columns.arrangeWidth);
        columns.visibleRange(columns.arrangeLeft);

        //调整列头
        any = control.view_head.firstChild;

        while (any)
        {
            if (any.firstChild)
            {
                this.__adjust_size(columns, any);
            }

            any = any.nextSibling;
        }

        //调整内容


        this.refresh(control, view);
    };


    //调整网格位置
    this.__adjust_size = function (columns, dom) {

        var name = flyingon.rtl ? 'right' : 'left',
            column,
            style,
            width,
            index,
            end;

        dom = dom.firstChild;

        while (dom)
        {
            if (index = dom.getAttribute('column-index'))
            {
                end = dom.getAttribute('column-end');

                column = columns[index];
                style = dom.style;

                width = column.width;
                
                if (end !== index)
                {
                    width += column_span(columns, +index, end - index);
                }
                
                style[name] = column.left + 'px';
                style.width = width + 'px';
            }

            dom = dom.nextSibling;
        }
    };
    

    //挂载渲染的控件
    this.__mount_controls = function (control, header) {

        var list = controls,
            doc = document,
            item,
            view,
            any;

        for (var i = 0, l = list.length; i < l; i++)
        {
             item = list[i];

             if (view = doc.getElementById(item.__id))
             {
                 if ((any = item.__storage) && (any = any.id))
                 {
                     item.__id = '';
                     view.id = id;
                 }

                 item.renderer.mount(item, view);
             }
        }

        controls.length = 0;
    };


    this.refresh = function (control, view) {

        this.__update(control,
            0,
            0,
            control.offsetWidth - control.borderLeft - control.borderRight,
            control.offsetHeight - control.borderTop - control.borderBottom);
    };



});



flyingon.renderer('DataGrid', 'BaseGrid', function (base) {


    this.render_columns = function (control, start, end) {

    };


    this.render_rows = function (control, column, start, end) {

    };


});