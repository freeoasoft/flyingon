flyingon.renderer('GridColumn', function (base) {



    this.render = function (writer, column, height) {

        var cells = column.cells,
            resizable = (column.__storage || control.__defaults).resizable;

        if (cells._)
        {
            this.unmount(column, cells._);
            cells._ = null;
        }

        if (cells[1])
        {
            render_multi(writer, column, cells, height, resizable);
        }
        else
        {
            render_header(writer, column, cells[0], 0, column.width, height, resizable);
        }
    };



    function render_multi(writer, column, cells, height, resizable) {

        var width = column.width,
            length = cells.length,
            y1 = 0,
            y2,
            cell;

        for (var i = 0; i < length; i++)
        {
            cell = cells[i];

            y2 = cell.size;
            y2 = y2 > 0 ? y2 : (height / (length - i) | 0);
   
            render_header(writer, column, cell, y1, cell.width || column.width, y2, resizable);

            y1 += y2;
            height -= y2;
        }
    };



    function render_header(writer, column, cell, y, width, height, resizable) {

        var index = column.absoluteIndex,
            any = cell.count;

        writer.push('<div class="f-grid-back', cell.className || '', 
            '" style="left:', column.left, 'px;top:', y, 'px;width:', width, 'px;height:', height, 'px;line-height:', height, 'px;', 
            any > 1 ? 'z-index:1;' : '',
            '" column-index="', index, '" column-count="', any, '">',
            '<div class="f-grid-cell">');

        if ((any = cell.text) && typeof any === 'object')
        {
            any = cell.control = flyingon.ui(any);
            any.rowIndex = -1;
            any.columnIndex = index;
            any.__as_html = true;

            any.renderer.render(writer, any);
        }
        else
        {
            writer.push('<span>', flyingon.html_encode(any), '</span>');
        }

        writer.push('</div>',
                '<div class="f-grid-resize"', resizable ? '' : ' style="display:none;"', ' onmousedown="flyingon.Grid.resize.call(this, event);"></div>',
            '</div>');
    };



    this.mount = function (column, node) {

        var cells = column.cells,
            index = 0,
            cell,
            any;

        column.view = true;

        while (cell = cells[index++])
        {
            cell.view = node;
            
            if (any = cell.control)
            {
                any.parent = column.grid;
                any.renderer.mount(any, node.firstChild.firstChild);
            }

            node = node.nextSibling;
        }

        return node;
    };


    this.unmount = function (column, cells) {

        var index = 0,
            cell,
            view,
            any;

        column.view = false;
        cells || (cells = column.cells);

        while (cell = cells[index++])
        {
            if (view = cell.view)
            {
                cell.view = null;

                if (any = view.parentNode)
                {
                    any.removeChild(view);
                }
            }

            if (any = cell.control)
            {
                cell.control = null;

                any.parent = null;
                any.renderer.unmount(any);
            }
        }
    };


    this.resizable = function (column, view, value) {

        var cells = column.cells,
            index = 0,
            cell,
            view;

        while (cell = cells[index++])
        {
            if (view = cell.view)
            {
                view.lastChild.style.display = value ? '' : 'none';
            }
        }
    };


    this.readonly = function (column, readonly) {


    };


    //计算网格高度
    this.__resize_height = function (column, height) {

        var cells = column.cells,
            length = cells.length,
            index,
            cell,
            style,
            size,
            y;

        if (length > 1)
        {
            index = y = 0;

            while (cell = cells[index])
            {
                size = cell.size;
                size = size > 0 ? size : height / (length - index) | 0;

                style = cell.view.style;
                style.top = y + 'px';
                style.height = style.lineHeight = size + 'px';

                y += size;
                height -= size;

                index++;
            }
        }
        else
        {
            style = cells[0].view.style;
            style.height = style.lineHeight = height + 'px';
        }
    };
    

});



flyingon.renderer('GridColumns', function (base) {



    //临时节点容器
    var fragment = document.createDocumentFragment();

    //dom容器(生成临时节点用)
    var dom_host = document.createElement('div');



    //显示列头
    this.show = function (view, columns, start, end, height) {

        var temp = fragment,
            column,
            node,
            index,
            cells,
            cell,
            dirty,
            list,
            any;

        while (start < end)
        {
            if ((column = columns[start]).__visible)
            {
                if (column.view)
                {
                    index = 0;
                    dirty = column.dirty;
                    cells = column.cells;

                    while (cell = cells[index++])
                    {
                        if (list)
                        {
                            create_view(temp, list, columns, index, start);
                            list = null;
                        }

                        node = cell.view;

                        if (dirty)
                        {
                            column.dirty = false;

                            node.setAttribute('column-index', '' + start);
                            node.setAttribute('column-count', '' + cell.count);

                            any = node.style;
                            any.left = column.left + 'px';
                            any.width = (cell.width || column.width) + 'px';
                        }

                        temp.appendChild(node);
                    }
                }
                else
                {
                    if (!list)
                    {
                        list = [];
                        list.index = start;
                    }

                    column.renderer.render(list, column, height);
                }
            }

            start++;
        }

        if (list)
        {
            create_view(temp, list, columns, start);
        }

        //移除原来显示的节点
        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(temp);
    };


    //创建列头视图
    function create_view(temp, list, columns, end) {

        var host = dom_host,
            start = list.index,
            node, 
            any;

        host.innerHTML = list.join('');
        node = temp.lastChild;

        while (any = host.firstChild)
        {
            temp.appendChild(any);
        }

        host.innerHTML = '';
        node = node && node.nextSibling || temp.firstChild;

        while (start < end)
        {
            if ((any = columns[start++]) && !any.view && any.__visible)
            {
                node = any.renderer.mount(any, node);
            }
        }
    };


    //隐藏列头
    this.hide = function (columns, index, length) {

        var column;

        while (length-- > 0)
        {
            column = columns[index + length];
            column.__visible = false;
        }
    };



});



flyingon.renderer('GridRow', function (base) {


    this.show = function (temp, writer, row, columns, start, end, rowHeight) {

        var cells = row.cells || (row.cells = []),
            cell;
        
        while (start < end)
        {
            if (cell = cells[start])
            {
                temp.appendChild(cell.view);
            }
            else
            {
                cells[start] = {};
                this.render(writer, row, columns[start++], rowHeight);
            }
        }
    };


    this.render = function (writer, row, column, rowHeight) {

        var index = column.absoluteIndex,
            any;

        //column.format

        writer.push('<div class="f-grid-back', cell.className || '', 
            '" style="left:', column.left, 'px;top:', y, 'px;width:', width, 'px;height:', height, 'px;line-height:', height, 'px;', 
            any > 1 ? 'z-index:1;' : '',
            '" column-index="', index, '" column-count="', any, '">',
            '<div class="f-grid-cell">');

        if ((any = cell.text) && typeof any === 'object')
        {
            any = cell.control = flyingon.ui(any);
            any.rowIndex = -1;
            any.columnIndex = index;
            any.__as_html = true;

            any.renderer.render(writer, any);
        }
        else
        {
            writer.push('<span>', flyingon.html_encode(any), '</span>');
        }

        writer.push('</div>',
                '<div class="f-grid-resize"', resizable ? '' : ' style="display:none;"', ' onmousedown="flyingon.Grid.resize.call(this, event);"></div>',
            '</div>');
    };


    this.mount = function (temp, host, row, start, end) {

        while (start < end)
        {
            
        }
    };


    this.unmount = function () {

    };


});



flyingon.renderer('GroupGridRow', 'GridRow', function (base) {

});



flyingon.renderer('Grid', function (base) {



    //调整列宽时的辅助线
    var resize_thumb;

    //拖动列时的辅助线
    var drag_thumb;

    //textContent || innerText
    var text_name = this.__text_name;

    //是否禁止列头点击事件
    var click_disabled = false;

    //可输入标签
    var input_tag = 'input,select,textarea'.toUpperCase().split(',');

    //临时节点
    var fragment = document.createDocumentFragment();



    this.__no_padding = this.padding = 0;

    //滚动时是否可复用表格行视图
    this.__reuse_row = true;



    this.render = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            group = storage.group,
            header = storage.header,
            top = group + header,
            block = '<div class="f-grid-center"></div>' 
                + '<div class="f-grid-left"></div>'
                + '<div class="f-grid-right"></div>';

        writer.push('<div');

        this.renderDefault(writer, control, 'f-grid', 'overflow:hidden;');

        writer.push(' onclick="flyingon.Grid.onclick.call(this)">',
            '<div class="f-grid-head" onmousedown="flyingon.Grid.onmousedown.call(this, event)">',
                '<div class="f-grid-group" style="height:', group, 'px;line-height:', group, 'px;"></div>',
                '<div class="f-grid-column-head" style="height:', header, 'px;">', block, '<div class="f-grid-line"></div></div>',
                '<div class="f-grid-filter">', block, '<div class="f-grid-line"></div></div>',
            '</div>',
            '<div class="f-grid-scroll" style="top:', top, 'px;" onscroll="flyingon.Grid.onscroll.call(this)">',
                this.__scroll_html,
            '</div>',
            '<div class="f-grid-body" style="top:', top, 'px;" tabindex="0">',
                '<div class="f-grid-middle">', block, '</div>',
                '<div class="f-grid-top">', block, '</div>',
                '<div class="f-grid-bottom">', block, '</div>',
            '</div>',
        '</div>');
    };



    this.mount = function (control, view) {

        var any;

        base.mount.call(this, control, view);

        view = view.firstChild;

        control.view_group = any = view.firstChild;
        control.view_head = any.nextSibling;
        control.view_scroll = any = view.nextSibling;
        control.view_body = any.nextSibling;
    };


    this.unmount = function (control) {

        var view = control.view.lastChild;

        flyingon.dom_off(control.view_head);

        control.view_group = control.view_head = control.view_scroll = control.view_body = null;

        base.unmount.call(this, control);
    };


    flyingon.Grid.onclick = function (e) {

        if (click_disabled)
        {
            click_disabled = false;
        }
        else
        {

        }
    };



    flyingon.Grid.onmousedown = function (e) {

        var dom = e.target || e.srcElement;

        if (input_tag.indexOf(dom.tagName) >= 0)
        {
            return;
        }

        var control = flyingon.findControl(this),
            columns = control.__columns,
            column,
            name,
            index;

        while (dom && dom !== this)
        {
            if (index = dom.getAttribute('column-index'))
            {
                column = columns[index |= 0];
            }
            else if (name = dom.getAttribute('column-name'))
            {
                column = columns.find(name);
            }
            
            if (column)
            {
                column.draggable() && flyingon.dom_drag({

                        control: control,
                        dom: dom, 
                        name: name || column.name(),
                        index: name ? column.absoluteIndex : index, 
                        from: !!name  //标记从分组框拖出
                    },
                    event,
                    start_drag,
                    do_drag,
                    end_drag);

                click_disabled = true;
                break;
            }

            dom = dom.parentNode;
        }
    };


    function start_drag(e) {

        var control = this.control,
            storage = control.__storage || control.__defaults,
            dom = this.dom,
            thumb = this.thumb = drag_thumb || init_drag_thumb(),
            count = this.count = this.from ? 1 : dom.getAttribute('column-count') | 0,
            style,
            any;

        this.group = any = storage.group;
        this.groups = storage.groups;
        this.header = storage.header;

        any = control.view.firstChild.getBoundingClientRect();

        this.left = any.left;
        this.top = any.top;

        any = dom.cloneNode(true);

        //从分组框拖出
        if (this.from)
        {
            any.style.cssText = 'position:absolute;z-index:2;left:' 
                + dom.offsetLeft + 'px;top:' 
                + dom.offsetTop + 'px;';

            dom = any;

            any =  this.groups.replace(this.name, '').replace('  ', ' ');
            control.renderer.__render_group(control, this.groups = storage.groups = any);
        }
        else //拖动列
        {
            style = any.firstChild.style;
            style.left = style.top = '1px';

            style = any.style;
            style.left = dom.offsetLeft + dom.parentNode.offsetLeft + 'px';
            style.top = dom.offsetTop + dom.parentNode.parentNode.offsetTop + 'px';

            dom = any;

            any = control.__columns;
            any.renderer.hide(any, this.index, count);

            control.update(true);
        }

        e.dom = dom;
        dom.style.zIndex = 2;

        any = control.view.firstChild;
        any.appendChild(thumb);
        any.appendChild(dom);
    };


    function do_drag(event) {

        var control = this.control,
            style = this.thumb.style,
            x = event.clientX - this.left,
            y = event.clientY - this.top,
            view,
            height;

        //拖动到分组框
        if (this.to = this.name && y < this.group)
        {
            y = 4;
            height = this.group - 8;

            if (this.groups)
            {
                x = group_index(this, control.view_group, x);
            }
            else
            {
                this.at = 0;
                x = 8;
            }
        }
        else //拖到列区
        {
            x = column_index(this, control, x);
            y = this.group;
            height = this.header;
        }

        style.left = x - 11 + 'px';
        style.top = y + 'px';
        style.height = height + 'px';
    };


    function group_index(context, dom, x) {

        var last = dom.lastChild,
            index = 0,
            left = 0,
            width = 0;

        dom = dom.firstChild;

        while (dom && dom !== last)
        {
            left = dom.offsetLeft;
            width = dom.offsetWidth;

            if (left + (width >> 1) > x)
            {
                context.at = index;
                return left - 4;
            }

            if (left + width > x)
            {
                break;
            }

            index++;
            dom = dom.nextSibling;
        }

        context.at = index;
        return left + width + 4;
    };


    function column_index(context, control, x) {

        var columns = control.__columns,
            locked = columns.locked,
            start = locked[0],
            end = columns.length,
            scroll = 0,
            offset = 0,
            left = 0,
            width = 0,
            column;

        //在左锁定区
        if (start && locked[2] > x)
        {
            end = start;
            start = 0;
        }
        else if (locked[1] && x > (offset = columns.arrangeWidth - locked[3])) //在右锁定区
        {
            start = end - locked[1];
        }
        else //滚动区域
        {
            offset = locked[2];
            scroll = control.scrollLeft | 0;
            x += scroll;
        }

        x -= offset;
        offset -= scroll;

        while (start < end)
        {
            column = columns[start++];

            if (column.__visible)
            {
                left = column.left;
                width = column.width;

                if (left + (width >> 1) > x)
                {
                    context.at = start - 1;
                    return left + offset;
                }

                if (left + width > x)
                {
                    break;
                }
            }
        }

        context.at = start;
        return left + width + offset;
    };

    
    function end_drag(event) {

        var control = this.control,
            columns = control.__columns,
            index = this.index,
            count = this.count,
            list = [],
            any;

        if (any = this.thumb)
        {
            any.parentNode.removeChild(any);
        }

        if (any = event.dom)
        {
            any.parentNode.removeChild(any);
        }

        //拖到分组框
        if (this.to)
        {
            for (var i = 0; i < count; i++)
            {
                list.push(columns[index + i].name());
            }

            if ((any = this.groups) && (any = any.match(/\w+/g)))
            {
                any.splice(this.at, 0, list.join(' '));
                any = any.join(' ');
            }
            else
            {
                any = list.join(' ');
            }

            control.groups(any);
        }
        else 
        {
            any = this.at;

            if (any > index)
            {
                any--;
            }

            list.push(any, 0);

            for (var i = 0; i < count; i++)
            {
                any = columns[index + i];
                any.__visible = true;

                list.push(any);
            }

            list.splice.call(columns, index, count);
            list.splice.apply(columns, list);

            control.update(true);
        }
    };


    function init_drag_thumb() {

        var dom = drag_thumb = document.createElement('div'),
            name = 'f-grid-column-thumb';

        dom.innerHTML = '<div class="' + name + '-body"><div></div></div>';
        dom.className = name;
        dom.style.width = '20px';

        return dom;
    };



    flyingon.Grid.onscroll = function () {

        var control = flyingon.findControl(this),
            x = this.scrollLeft,
            y = this.scrollTop;

        if (control.scrollLeft !== x)
        {
            control.renderer.__do_hscroll(control, control.scrollLeft = x);
        }

        if (control.scrollTop !== y)
        {
            control.renderer.__do_vscroll(control, control.scrollTop = y);
        }
    };


    flyingon.Grid.resize = function (e) {

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

        control.__column_dirty = true;
        control.view.appendChild(e.dom = resize_thumb || (resize_thumb = init_resize_thumb()));

        while (dom !== view)
        {
            left += dom.offsetLeft;
            dom = dom.parentNode;
        }

        e.dom.style.left = left + 'px';
        control.view_head.style.cursor = 'ew-resize';

        flyingon.dom_drag(data, e, null, do_resize, resize_end, 'y', false);
        click_disabled = true;
    };


    function init_resize_thumb() {

        var dom = resize_thumb = document.createElement('div');

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
            columns = control.__columns,
            storage = this.column.storage(),
            width = this.width + e.distanceX;

        control.view_head.style.cursor = '';
        control.view.removeChild(resize_thumb);

        if (storage.size !== width)
        {
            storage.size = width;
            control.update(true);
        }
    };



    this.locate = function (control) {

        base.locate.call(this, control);
        this.content(control, control.view);
    };


    this.locate_html = function (control) {


    };



    //列头大小发生变化
    this.header = function (control, view, value) {

        var columns = control.__columns,
            storage = control.__storage || control.__defaults,
            group = storage.group,
            header = storage.header;

        control.view_body.style.top = control.view_scroll.style.top = group + header + 'px';

        if (value > 1)
        {
            control.view_head.style.height = header + 'px';

            for (var i = columns.length - 1; i >= 0; i--)
            {
                var column = columns[i];

                if (column.view)
                {
                    column.renderer.__resize_height(column, header);
                }
            }
        }
        else
        {
            view = control.view_group;
            view.style.height = view.style.lineHeight = group + 'px';
        }
    };


    //内容发生变化
    this.content = function (control, view) {

        this.show(control,
            control.scrollLeft | 0,
            control.scrollTop | 0,
            control.offsetWidth - control.borderLeft - control.borderRight,
            control.offsetHeight - control.borderTop - control.borderBottom);
    };



    //显示指定范围的表格内容
    this.show = function (control, x, y, width, height) {

        var storage = control.__storage || control.__defaults,
            columns = control.__columns,
            rows = control.__rows,
            height = control.offsetWidth - control.borderTop - control.borderBottom,
            any;

        //显示分组
        if ((any = storage.group) > 0 && control.__group_dirty)
        {
            height -= any;

            control.__group_dirty = false;
            control.__column_dirty = true;

            this.__render_group(control, storage.groups);
        }

        //计算列宽度
        if ((any = control.__column_dirty) || columns.arrangeWidth !== width)
        {
            control.__column_dirty = false;
            
            columns.__compute_size(width);
            columns.__compute_visible(x);
        }
        else if (columns.arrangeLeft !== x)
        {
            columns.__compute_visible(x);
        }

        //控制滚动条
        if (columns.width > width)
        {
            any = flyingon.hscroll_height;
            height -= any;
        }
        else
        {
            any = 1;
        }

        control.view_body.style.bottom = any + 'px';
        control.view_scroll.firstChild.style.width = columns.width - 1 + 'px';

        //显示列头
        if ((any = storage.header) > 0)
        {
            height -= any;
            this.__show_header(control, columns, any);
        }

        //显示过滤栏
        if ((any = storage.filter) > 0)
        {
            height -= any;
            this.__show_filter(control, columns, any);
        }

        //显示内容
        this.__show_body(control, control.__view.current(), height);
    };



    //显示列头
    this.__show_header = function (control, columns, height) {

        var view = control.view_head,
            locked = columns.locked,
            style,
            any;

        //显示前锁定
        view = view.firstChild.nextSibling;
        style = view.style;
        
        if (any = locked[0])
        {
            style.display = '';
            style.width = locked[2] + 'px';

            columns.renderer.show(view, columns, 0, any, height);
        }
        else
        {
            style.display = 'none';
        }

        //显示后锁定
        view = view.nextSibling;
        style = view.style;

        if (any = locked[1])
        {
            style.display = '';
            style.width = locked[3] + 'px';

            columns.renderer.show(view, columns, columns.length - any, columns.length, height);
        }
        else
        {
            style.display = 'none';
        }

        //显示可见区(仅显示前面部分)
        view = control.view_head.firstChild;
        style = view.style;

        any = locked[2] - (control.scrollLeft | 0) + 'px';

        if (flyingon.rtl)
        {
            style.left = '0';
            style.right = any;
        }
        else
        {
            style.left = any;
            style.right = '0';
        }

        any = columns.start;
        any -= columns[any].offset; //处理跨列偏移
        columns.renderer.show(view, columns, any, columns.end, height);
    };


    //显示内容
    this.__show_body = function (control, rows, height) {

        var view = control.view_body,
            top = view.firstChild,
            scroll = top.nextSibling,
            bottom = scroll.nextSibling,
            storage = control.__storage || control.__defaults,
            rowHeight = storage.rowHeight,
            start = control.__locked_top | 0,
            end = rows.length,
            size = end * rowHeight,
            any;

        control.view_scroll.firstChild.style.height = size + 'px';
        control.view_body.style[flyingon.rtl ? 'left' : 'right'] = (size > height ? flyingon.vscroll_width : 0) + 'px';

        //显示顶部锁定
        if (start > 0)
        {
            top.style.display = '';
            top.style.height = (size = start * rowHeight) + 'px';

            height -= size;

            this.__show_rows(control, view, rows, 0, start, rowHeight);
        }
        else
        {
            size = 0;
            top.style.display = 'none';
        }

        //调整滚动区位置
        scroll.style.top = size - (control.scrollTop | 0) + 'px';

        //显示底部锁定
        if ((any = this.__locked_bottom) > 0)
        {
            bottom.style.display = '';
            bottom.style.height = (size = any * rowHeight) + 'px';

            height -= size;

            this.__show_rows(control, view, rows, end - any, any, rowHeight);
        }
        else
        {
            bottom.style.display = 'none';
        }

        //显示滚动区
        rows.arrangeHeight = height;

        //计算可见范围

        this.__show_rows(control, view, rows, rows.start, rows.end, rowHeight);
    };


    //显示过滤栏
    this.__show_filter = function (control, column, height) {

    };


    //显示数据行集
    this.__show_rows = function (control, view, rows, start, end, rowHeight) {

        var columns = control.__columns,
            locked = columns.locked,
            y1 = locked[0],
            y2 = columns.length,
            any;

        //记录下渲染行范围
        control.__row_start = start;
        control.__row_end = end;

        if (y1)
        {
            show_rows(view, rows, start, end, columns, 0, y1, rowHeight);
        }

        if (any = locked[1])
        {
            show_rows(view, rows, start, end, columns, y2 - any, y2, rowHeight);
            y2 -= any;
        }

        show_rows(view, rows, start, end, columns, y1, y2, rowHeight);
    };


    function show_rows(view, rows, x1, x2, columns, y1, y2, rowHeight) {

        var writer = [], 
            temp = fragment, 
            row, 
            any;

        for (var i = x1; i < x2; i++)
        {
            (row = rows[i]).renderer.show(temp, writer, row, columns, y1, y2, rowHeight);
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            writer.length = 0;

            for (var i = x1; i < x2; i++)
            {
                (row = rows[i]).renderer.mount(temp, any, row, columns, y1, y2);
            }
        }

        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(temp);
    };



    //渲染分组
    this.__render_group = function (control, groups) {

        var writer = [],
            columns = control.__columns,
            column,
            cells,
            name,
            any;

        if (groups && (groups = groups.match(/\w+/g)))
        {
            for (var i = 0, l = groups.length; i < l; i++)
            {
                if (column = columns.find(name = groups[i]))
                {
                    column.__visible = false;
                    cells = column.cells;

                    if (any = cells[cells.length - 1])
                    {
                        any = any.span ? cells[0].text : any.text;
                    }

                    writer.push('<span class="f-grid-group-cell" column-name="', name, '">', any || name, '</span>');
                }
            }
        }
        else
        {
            writer.push('<span class="f-information">', flyingon.i18ntext('grid.group'), '</span>');
        }

        writer.push('<div class="f-grid-line"></div>');

        control.view_group.innerHTML = writer.join('');
    };



    //处理水平滚动
    this.__do_hscroll = function (control, left) {

        var columns = control.__columns,
            view = control.view_head.firstChild,
            height = (control.__storage || control.__defaults).header,
            any;

        //计算可见列范围
        columns.__compute_visible(left);

        //重渲染列头
        if (height > 0)
        {
            //控制滚动位置
            view.style[flyingon.rtl ? 'right' : 'left'] = -left + columns.locked[2] + 'px';

            any = columns.start;
            any -= columns[any].offset; //处理跨列偏移

            columns.renderer.show(view, columns, any, columns.end, height);
        }
    };


    //处理竖直滚动
    this.__do_vscroll = function (control, top) {

        
    };


});