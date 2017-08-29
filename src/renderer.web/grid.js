flyingon.renderer('GridColumn', function (base) {



    this.render = function (writer, column, height) {

        var cells = column.__cells,
            resizable = (column.__storage || grid.__defaults).resizable;

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

            y2 = cell.__column_size;
            y2 = y2 > 0 ? y2 : (height / (length - i) | 0);
   
            render_header(writer, column, cell, y1, cell.__column_width || column.width, y2, resizable);

            y1 += y2;
            height -= y2;
        }
    };



    function render_header(writer, column, cell, y, width, height, resizable) {

        cell.rowIndex = -1;
        cell.columnIndex = column.absoluteIndex;
        cell.__as_html = true;
        
        cell.renderer.render(writer, cell, 'f-grid-cell', ['left:', column.left, 
            'px;top:', y, 
            'px;width:', width, 
            'px;height:', height, 
            'px;line-height:', height, 'px;', 
            cell.__column_count > 1 ? 'z-index:1;' : '', '"'].join(''));

        // writer.push('<div class="f-grid-resize"', resizable ? '' : ' style="display:none;"', ' onmousedown="flyingon.Grid.resize.call(this, event);"></div>',
        //     '</div>');
    };



    this.mount = function (column, node) {

        var cells = column.__cells,
            index = 0,
            cell,
            any;

        column.view = true;

        while (cell = cells[index++])
        {
            cell.parent = column.grid;
            cell.renderer.mount(cell, node);

            node = node.nextSibling;
        }

        return node;
    };


    this.unmount = function (column, cells) {

        var index = 0,
            cell;

        column.view = false;
        cells || (cells = column.__cells);

        while (cell = cells[index++])
        {
            cell.parent = null;

            if (cell.view)
            {
                cell.renderer.unmount(cell);
            }
        }
    };


    this.resizable = function (column, view, value) {

        var cells = column.__cells,
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

        var cells = column.__cells,
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
                    cells = column.__cells;

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

                            cell.columnIndex = start;

                            any = node.style;
                            any.left = column.left + 'px';
                            any.width = (cell.__column_width || column.width) + 'px';
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


    this.show = function (temp, writer, row, columns, start, end, y, height) {

        var cells = row.__cells || (row.__cells = []);

        while (start < end)
        {
            cells[start] = this.render(writer, row, columns[start++], y, height);
        }
    };


    this.render = function (writer, row, column, y, height) {

        var cell = column.__create_control(row),
            width = column.width,
            className = '',
            span,
            fn,
            any;

        //自定义渲染单元格
        if ((fn = column.onrender) && (fn = fn.call(column, row)))
        {
            if (any = fn.className)
            {
                className = any;
            }
            
            if ((any = fn.rowSpan | 0) > 0)
            {
                span = true;
            }

            if ((any = fn.columnSpan | 0) > 0)
            {
                span = true;
                height *= any;
            }
        }

        writer.push('<div class="f-grid-cell', className, 
            '" style="left:', column.left, 'px;top:', y, 'px;width:', width, 'px;height:', height, 'px;line-height:', height, 'px;', 
            span ? 'z-index:1;' : '', '">');

        //cell.rowIndex = index;
        cell.columnIndex = column.absoluteIndex;
        cell.fullClassName += ' f-grid-control'; 
        cell.__as_html = true;

        cell.renderer.render(writer, cell);

        writer.push('</div>');

        return cell;
    };


    this.mount = function (temp, view, row, start, end) {

        var cells = row.__cells,
            cell,
            node;

        while (start < end && (node = view.firstChild))
        {
            temp.appendChild(node);

            cell = cells[start++];
            cell.view_cell = node;
            cell.renderer.mount(cell, node.firstChild);
        }
    };


    this.unmount = function () {

    };


});



flyingon.renderer('GroupGridRow', 'GridRow', function (base) {

});



flyingon.renderer('Grid', function (base) {



    //调整列宽辅助dom
    var dom_resize;

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

    var dom_host = document.createElement('div');



    this.padding = 0;



    this.render = function (writer, grid, className, cssText) {

        var storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header,
            top = group + header,
            block = '<div class="f-grid-center"></div>' 
                + '<div class="f-grid-left" style="display:none;"></div>'
                + '<div class="f-grid-right" style="display:none;"></div>';

        writer.push('<div');

        this.renderDefault(writer, grid, className, cssText);

        writer.push(' onclick="flyingon.Grid.onclick.call(this)">',
            '<div class="f-grid-head" onmousedown="flyingon.Grid.onmousedown.call(this, event)">',
                '<div class="f-grid-group" style="height:', group, 'px;line-height:', group, 'px;"></div>',
                '<div class="f-grid-column-head" style="height:', header, 'px;" onmouseover="flyingon.Grid.onmouseover.call(this, event)">', 
                    block, '<div class="f-grid-line"></div>',
                '</div>',
                '<div class="f-grid-filter">', block, '<div class="f-grid-line"></div></div>',
            '</div>',
            '<div class="f-grid-scroll" style="top:', top, 'px;" onscroll="flyingon.Grid.onscroll.call(this)">',
                this.__scroll_html,
            '</div>',
            '<div class="f-grid-body" style="top:', top, 'px;" tabindex="0">',
                '<div class="f-grid-middle">', block, '</div>',
                '<div class="f-grid-top" style="display:none;">', block, '</div>',
                '<div class="f-grid-bottom" style="display:none;">', block, '</div>',
            '</div>',
        '</div>');
    };



    this.mount = function (grid, view) {

        var any;

        base.mount.call(this, grid, view);

        view = view.firstChild;

        grid.view_group = any = view.firstChild;
        grid.view_head = any.nextSibling;
        grid.view_scroll = any = view.nextSibling;
        grid.view_body = any.nextSibling;
    };


    this.unmount = function (grid) {

        var view = grid.view.lastChild;

        flyingon.dom_off(grid.view_head);

        grid.view_group = grid.view_head = grid.view_scroll = grid.view_body = null;

        base.unmount.call(this, grid);
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



    flyingon.Grid.onmouseover = function (e) {

        var target = e.target || e.srcElement,
            grid,
            column,
            cell;

        if (target.className.indexOf('f-grid-cell') >= 0 && 
            (cell = flyingon.findControl(target)) &&
            (grid = flyingon.findControl(this)) &&
            (column = grid.__columns[cell.columnIndex]) && column.resizable())
        {
            var dom = dom_resize || init_resize(),
                style = dom.style;

            dom.column = column;

            style.left = target.offsetLeft + target.offsetWidth - 2 + 'px';
            style.top = target.offsetTop + 'px';
            style.height = target.offsetHeight + 'px';

            target.parentNode.appendChild(dom);
        }
    };


    flyingon.Grid.resize = function (e) {

        var grid = flyingon.findControl(this),
            view = grid.view,
            column = this.column,
            dom = this,
            left = 0,
            data = { 
                grid: grid, 
                column: column,
                width: column.width 
            };

        grid.__column_dirty = true;
        grid.view.appendChild(e.dom = resize_thumb);

        while (dom !== view)
        {
            left += dom.offsetLeft;
            dom = dom.parentNode;
        }

        e.dom.style.left = left + 'px';
        grid.view_head.style.cursor = 'ew-resize';

        flyingon.dom_drag(data, e, null, do_resize, resize_end, 'y', false);
        click_disabled = true;
    };


    function init_resize() {

        var dom = resize_thumb = document.createElement('div');

        dom.className = 'f-grid-resize-thumb';
        
        dom = dom_resize = document.createElement('div');
        dom.className = 'f-grid-resize';
        dom.onmousedown = flyingon.Grid.resize;

        return dom;
    };


    function do_resize(e) {

        var width = this.width;

        if (width + e.distanceX < 1)
        {
            e.distanceX = -width + 1;
        }
    };


    function resize_end(e) {

        var grid = this.grid,
            storage = this.column.storage(),
            width = this.width + e.distanceX;

        grid.view_head.style.cursor = '';
        grid.view.removeChild(resize_thumb);

        if (storage.size !== width)
        {
            storage.size = width;
            grid.update(true);
        }
    };



    flyingon.Grid.onmousedown = function (e) {

        var dom = e.target || e.srcElement,
            cell,
            any;

        if (input_tag.indexOf(dom.tagName) < 0)
        {
            if (any = dom.getAttribute('column-name'))
            {
                check_drag(this, dom, -1, any, 1);
            }
            else
            {
                cell = flyingon.findControl(dom);

                while (cell)
                {
                    if ((any = cell.columnIndex) != null)
                    {
                        check_drag(this, dom, any | 0, '', cell.__column_count || 1);
                        break;
                    }

                    cell = cell.parent;
                }
            }
        }
    };


    function check_drag(view, dom, index, name, count) {

        var grid = flyingon.findControl(view),
            columns = grid.__columns,
            column,
            from;

        if (index >= 0)
        {
            if (column = columns[index])
            {
                name = column.name();
            }
        }
        else if (name && (column = columns.find(name)))
        {
            index = column.absoluteIndex;
            from = true;
        }
    
        column && column.draggable() && flyingon.dom_drag({

                grid: grid,
                dom: dom, 
                name: name,
                index: index, 
                count: count,
                from: from  //标记从分组框拖出
            },
            event,
            start_drag,
            do_drag,
            end_drag);

        click_disabled = true;
    };


    function start_drag(e) {

        var grid = this.grid,
            storage = grid.__storage || grid.__defaults,
            dom = this.dom,
            thumb = this.thumb = drag_thumb || init_drag_thumb(),
            count = this.count,
            style,
            any;

        this.group = any = storage.group;
        this.groups = storage.groups;
        this.header = storage.header;

        any = grid.view.firstChild.getBoundingClientRect();

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
            grid.renderer.__render_group(grid, this.groups = storage.groups = any);
        }
        else //拖动列
        {
            style = any.style;
            style.borderWidth = '1px';
            style.left = dom.offsetLeft + dom.parentNode.offsetLeft + 'px';
            style.top = dom.offsetTop + dom.parentNode.parentNode.offsetTop + 'px';

            dom = any;

            any = grid.__columns;
            any.renderer.hide(any, this.index, count);

            grid.update(true);
        }

        e.dom = dom;
        dom.style.zIndex = 2;

        any = grid.view.firstChild;
        any.appendChild(thumb);
        any.appendChild(dom);
    };


    function do_drag(event) {

        var grid = this.grid,
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
                x = group_index(this, grid.view_group, x);
            }
            else
            {
                this.at = 0;
                x = 8;
            }
        }
        else //拖到列区
        {
            x = column_index(this, grid, x);
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


    function column_index(context, grid, x) {

        var columns = grid.__columns,
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
            scroll = grid.scrollLeft | 0;
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

        var grid = this.grid,
            columns = grid.__columns,
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

            grid.groups(any);
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

            grid.update(true);
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

        var grid = flyingon.findControl(this),
            x = this.scrollLeft,
            y = this.scrollTop;

        if (grid.scrollLeft !== x)
        {
            grid.renderer.__do_hscroll(grid, grid.scrollLeft = x);
        }

        if (grid.scrollTop !== y)
        {
            grid.renderer.__do_vscroll(grid, grid.scrollTop = y);
        }
    };



    this.locate = function (grid) {

        base.locate.call(this, grid);
        this.content(grid, grid.view);
    };


    this.locate_html = function (grid) {


    };



    //列头大小发生变化
    this.header = function (grid, view, value) {

        var columns = grid.__columns,
            storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header;

        grid.view_body.style.top = grid.view_scroll.style.top = group + header + 'px';

        if (value > 1)
        {
            grid.view_head.style.height = header + 'px';

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
            view = grid.view_group;
            view.style.height = view.style.lineHeight = group + 'px';
        }
    };


    //内容发生变化
    this.content = function (grid, view) {

        this.show(grid,
            grid.scrollLeft | 0,
            grid.scrollTop | 0,
            grid.offsetWidth - grid.borderLeft - grid.borderRight,
            grid.offsetHeight - grid.borderTop - grid.borderBottom);
    };



    //显示指定范围的表格内容
    this.show = function (grid, x, y, width, height) {

        var storage = grid.__storage || grid.__defaults,
            columns = grid.__columns,
            rows = grid.__rows,
            height = grid.offsetWidth - grid.borderTop - grid.borderBottom,
            any;

        //显示分组
        if ((any = storage.group) > 0 && grid.__group_dirty)
        {
            height -= any;

            grid.__group_dirty = false;
            grid.__column_dirty = true;

            this.__render_group(grid, storage.groups);
        }

        //计算列宽度
        if ((any = grid.__column_dirty) || columns.arrangeWidth !== width)
        {
            grid.__column_dirty = false;
            
            columns.__compute_size(width);
            columns.__compute_visible(x);
        }
        else if (columns.arrangeLeft !== x)
        {
            columns.__compute_visible(x);
        }

        //控制水平滚动条
        if (columns.width > width)
        {
            any = flyingon.hscroll_height;
            height -= any;
        }
        else
        {
            any = 1;
        }

        grid.view_body.style.bottom = any + 'px';
        grid.view_scroll.firstChild.style.width = columns.width - 1 + 'px';

        //显示列头
        if ((any = storage.header) > 0)
        {
            height -= any;
            this.__show_header(grid, columns, any);
        }

        //显示过滤栏
        if ((any = storage.filter) > 0)
        {
            height -= any;
            this.__show_filter(grid, columns, any);
        }

        //显示内容
        //any = this.__show_body(grid, grid.__view.current(), height);

        //排列横向锁定区域
        this.__layout_locked(grid, columns.locked, any);
    };



    //显示列头
    this.__show_header = function (grid, columns, height) {

        var view = grid.view_head.firstChild,
            dom = view.nextSibling,
            locked = columns.locked,
            any;

        //显示前锁定
        if (any = locked[0])
        {
            columns.renderer.show(dom, columns, 0, any, height);
        }

        //显示后锁定
        if (any = locked[1])
        {
            columns.renderer.show(dom.nextSibling, columns, columns.length - any, columns.length, height);
        }

        //显示可见区
        any = columns.start;
        any -= columns[any].offset; //处理跨列偏移
        columns.renderer.show(view, columns, any, columns.end, height);
    };


    //显示内容
    this.__show_body = function (grid, rows, height) {

        var view = grid.view_body,
            top = view.firstChild,
            scroll = top.nextSibling,
            bottom = scroll.nextSibling,
            storage = grid.__storage || grid.__defaults,
            rowHeight = storage.rowHeight,
            start = grid.__locked_top | 0,
            end = rows.length,
            size = end * rowHeight,
            vscroll = size > height,
            any;

        grid.view_scroll.firstChild.style.height = size + 'px';
        grid.view_body.style[flyingon.rtl ? 'left' : 'right'] = (vscroll ? flyingon.vscroll_width : 0) + 'px';

        //显示顶部锁定
        if (start > 0)
        {
            top.style.display = '';
            top.style.height = (size = start * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, top, rows, 0, start, rowHeight);
        }
        else
        {
            size = 0;
            top.style.display = 'none';
        }

        //调整滚动区位置
        scroll.style.top = size - (grid.scrollTop | 0) + 'px';

        //显示底部锁定
        if ((any = this.__locked_bottom) > 0)
        {
            bottom.style.display = '';
            bottom.style.height = (size = any * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, bottom, rows, end - any, any, rowHeight);
        }
        else
        {
            bottom.style.display = 'none';
        }

        //显示滚动区
        rows.arrangeHeight = height;

        //计算可见范围
        this.__show_rows(grid, scroll, rows, rows.start, rows.end, rowHeight);

        return vscroll;
    };


    //显示过滤栏
    this.__show_filter = function (grid, column, height) {

    };


    //排列横向锁定区域
    this.__layout_locked = function (grid, locked, vscroll) {

        var view = grid.view_head,
            left = locked[2],
            right = locked[3],
            scroll = grid.scrollLeft | 0;

        layout_locked(view, left, right > 0 && vscroll ? right + flyingon.vscroll_width : right, scroll);

        view = grid.view_body.firstChild;

        layout_locked(view, left, right, scroll);
        layout_locked(view = view.nextSibling, left, right, scroll);
        layout_locked(view, left, right, scroll);
    };


    function layout_locked(view, left, right, scroll) {

        var dom = view.firstChild,
            style = dom.style;

        style[flyingon.rtl ? 'right' : 'left'] = -scroll + left + 'px';

        dom = dom.nextSibling;
        style = dom.style;

        if (left > 0)
        {
            style.width = left + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }

        style = dom.nextSibling.style;

        if (right > 0)
        {
            style.width = right + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }
    };


    //显示数据行集
    this.__show_rows = function (grid, view, rows, start, end, rowHeight) {

        var columns = grid.__columns,
            locked = columns.locked,
            c1 = locked[0],
            c2 = columns.length,
            any;

        //记录下渲染行范围
        grid.__row_start = start;
        grid.__row_end = end;

        if (c1)
        {
            show_rows(view.firstChild.nextSibling, rows, start, end, columns, 0, c1, 0, rowHeight);
        }

        if (any = locked[1])
        {
            show_rows(view.lastChild, rows, start, end, columns, c2 - any, c2, 0, rowHeight);
            c2 -= any;
        }

        show_rows(view.firstChild, rows, start, end, columns, columns.start, columns.end, 0, rowHeight);
    };


    function show_rows(view, rows, r1, r2, columns, c1, c2, top, height) {

        var writer = [], 
            temp = fragment, 
            row, 
            any;

        for (var i = r1; i < r2; i++)
        {
            (row = rows[i]).renderer.show(temp, writer, row, columns, c1, c2, top, height);
            top += height;
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            writer.length = 0;

            for (var i = r1; i < r2; i++)
            {
                (row = rows[i]).renderer.mount(temp, any, row, c1, c2);
            }
        }

        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(temp);
    };



    //渲染分组
    this.__render_group = function (grid, groups) {

        var writer = [],
            columns = grid.__columns,
            column,
            cells,
            name;

        if (groups && (groups = groups.match(/\w+/g)))
        {
            for (var i = 0, l = groups.length; i < l; i++)
            {
                if (column = columns.find(name = groups[i]))
                {
                    column.__visible = false;
                    cells = column.__cells;

                    writer.push('<span class="f-grid-group-cell" column-name="', name, '">', 
                            column.__find_text() || name, 
                        '</span>');
                }
            }
        }
        else
        {
            writer.push('<span class="f-information">', flyingon.i18ntext('grid.group'), '</span>');
        }

        writer.push('<div class="f-grid-line"></div>');

        grid.view_group.innerHTML = writer.join('');
    };



    //处理水平滚动
    this.__do_hscroll = function (grid, left) {

        var columns = grid.__columns,
            view = grid.view_head.firstChild,
            height = (grid.__storage || grid.__defaults).header,
            name = flyingon.rtl ? 'right' : 'left',
            scroll = -left + columns.locked[2] + 'px',
            any;

        //计算可见列范围
        columns.__compute_visible(left);

        //重渲染列头
        if (height > 0)
        {
            //控制滚动位置
            view.style[name] = scroll;

            any = columns.start;
            any -= columns[any].offset; //处理跨列偏移

            columns.renderer.show(view, columns, any, columns.end, height);
        }

        view = grid.view_body.firstChild;
        view.firstChild.style[name] = scroll;

        view = view.nextSibling;
        view.firstChild.style[name] = scroll;

        view.nextSibling.firstChild.style[name] = scroll;
    };


    //处理竖直滚动
    this.__do_vscroll = function (grid, top) {

        
    };


});