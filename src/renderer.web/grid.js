flyingon.renderer('BaseGrid', function (base) {



    //当前渲染的控件集合
    var controls = [];

    //id
    var id = 1;



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
        control.view_head.firstChild.style[flyingon.rtl ? 'right' : 'left'] = -x + columns.locked_before + 'px';
    };


    flyingon.BaseGrid.resize = function (e) {

        var control = flyingon.findControl(this),
            columns = control.__columns,
            column = columns[this.parentNode.getAttribute('column-index')],
            data = { 
                control: flyingon.findControl(this), 
                column: column,
                width: column.width 
            };

        columns.dirty = true;
        e.style = false;

        flyingon.dom_drag(data, e, null, do_resize, null, 'y');
    };


    function do_resize(e) {

        var control = this.control,
            column = this.column,
            width = this.width + e.distanceX;

        column.width = width > 1 ? width : 1;
        control.renderer.__adjust_columns(control, column.absoluteIndex, true);
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
            locked = storage.locked,
            any;

        //计算列宽度
        if (columns.dirty || columns.width !== width)
        {
            columns.compute(width);
        }

        //控制滚动条
        control.view_body.style.bottom = columns.scroll ? flyingon.hscroll_height + 'px' : '1px';
        control.view_scroll.firstChild.style.width = columns.width + 'px';

        //计算锁定
        if (locked && (locked = locked.match(/\d+/g)))
        {
            columns.before = locked[0] | 0;
            columns.after = locked[1] | 0;
            rows.before = locked[2] | 0;
            rows.after = locked[3] | 0;
        }
        else
        {
            columns.before = rows.before = columns.after = rows.after = 0;
        }

        //计算可见列范围
        columns.visibleRange(x, width);

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

        if (view.firstChild)
        {
            //绘制可见区(仅绘制前面部分)
            for (var i = columns.before, l = columns.end; i < l; i++)
            {
                any = columns[i];

                if (!any.rendered)
                {
                    this.render_header(writer, control, columns, i, height);
                }
            }

            flyingon.dom_html(view.firstChild, writer.join(''));
        }
        else //第一次绘制
        {
            any = columns.before;

            writer.push('<div class="f-grid-center" style="', flyingon.rtl ? 'right:' : 'left:', columns.locked_before, 'px;">');

            //绘制可见区(仅绘制前面部分)
            for (var i = any, l = columns.end; i < l; i++)
            {
                this.render_header(writer, control, columns, i, height);
            }

            writer.push('</div><div class="f-grid-left" style="', any ? 'width:' + columns.locked_before + 'px' : 'display:none', ';">');

            //绘制前锁定
            if (any)
            {
                for (var i = 0, l = columns.before; i < l; i++)
                {
                    this.render_header(writer, control, columns, i, height);
                }

                writer.push('<div class="f-grid-line"></div>');
            }
            
            any = columns.after;

            writer.push('</div><div class="f-grid-right" style="', any ? 'width:' + columns.locked_after + 'px' : 'display:none', ';">');

            //绘制后锁定
            if (any)
            {
                for (var i = columns.length - any, l = columns.length; i < l; i++)
                {
                    this.render_header(writer, control, columns, i, height);
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


    this.render_header = function (writer, control, columns, index, height) {

        var column = columns[index],
            storage = column.__storage || column.__defaults,
            title = storage.title;

        title = column.render_header(title);
        column.rendered = true;

        if (title instanceof Array)
        {
            render_multi(writer, columns, index, title, column.width, height, storage.resizable);
        }
        else
        {
            render_header(writer, column, title, index, 0, column.width, height, storage.resizable);
        }
    };


    function render_multi(writer, columns, index, title, width, height, resizable) {

        var column = columns[index],
            length = title.length,
            y = 0,
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
                    w += column_span(columns, index, span);
                }
            }
            else
            {
                h = height / (length - i) | 0;
                span = 0;
            }

            render_header(writer, column, item, index, y, w, h, span, resizable);

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


    function render_header(writer, column, title, index, y, width, height, span, resizable) {

        var any;

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
            writer.push('<div class="f-grid-resizable" onmousedown="flyingon.BaseGrid.resize.call(this, event);"></div>');
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


    //重新调整列位置
    this.__adjust_columns = function (control, index) {

        var columns = control.__columns,
            name = 'center',
            left = columns[index].left,
            end,
            any;

        if (index < (end = columns.before))
        {
            name = 'left';
        }
        else if (index >= (end = columns.length) - columns.after)
        {
            name = 'right';
        }
        else
        {
            end = columns.end;
        }
        
        for (var i = index; i < end; i++)
        {
            any = columns[i];
            any.left = left;

            left += any.width;
        }

        any = this.__cell_host(control, name);

        for (var i = any.length - 1; i >= 0; i--)
        {
            this.__adjust_size(columns, index, any[i]);
            this.__adjust_position(columns, index + 1, any[i]);
        }
    };


    //获取单元格宿主
    this.__cell_host = function (control, name) {

        var list = [],
            view = control.view_head.firstChild;

        name = 'f-grid-' + name;

        while (view)
        {
            if (view.className.indexOf(name) >= 0)
            {
                if (view.firstChild)
                {
                    list.push(view);
                }

                break;
            }

            view = view.nextSibling;
        }

        view = control.view_body.firstChild;

        while (view)
        {
            var any = view.firstChild;

            while (any)
            {
                if (any.className.indexOf(name) >= 0)
                {
                    if (any.firstChild)
                    {
                        list.push(any);
                    }

                    break;
                }

                any = any.nextSibling;
            }

            view = view.nextSibling;
        }

        return list;
    };


    //调整网格位置
    this.__adjust_position = function (columns, index, dom) {

        var name = flyingon.rtl ? 'right' : 'left',
            start;

        dom = dom.firstChild;

        while (dom)
        {
            start = dom.getAttribute('column-index') | 0;

            if (start >= index)
            {
                dom.style[name] = columns[start].left + 'px';
            }

            dom = dom.nextSibling;
        }
    };
    

    //调整网格大小
    this.__adjust_size = function (columns, index, dom) {

        var start, end, width;

        dom = dom.firstChild;

        while (dom)
        {
            start = dom.getAttribute('column-index') | 0;
            end = dom.getAttribute('column-end') | 0;

            if (start <= index && end >= index)
            {
                width = columns[start].width;

                if ((end -= start) > 0)
                {
                    width += column_span(columns, start, end);
                }

                dom.style.width = width + 'px';
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
             item.isGridHeader = header;
             item.parent = control;

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