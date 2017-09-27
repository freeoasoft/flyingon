var url_base = 'flyingon/samples/base/';

var url_layout = 'flyingon/samples/layout/';

var url_controls = 'flyingon/samples/controls/';

var url_grid = 'flyingon/samples/grid/';


var menuList = [

    {
        text: 'flyingon基础', 
        children: [
            { text: 'js插件', url: url_base + 'plugin-js.js' },
            { text: 'widget插件', url: url_base + 'plugin-widget.js' },
            { text: 'html插件', url: url_base + 'plugin.html' },
            { text: '序列化', url: url_base + 'serialize.html' },
            { text: '数据绑定', url: url_base + 'data-bind.html' },
            { text: '选择器', url: url_base + 'selector.js' },
            { text: 'widget', url: url_base + 'widget.html' },
            { text: '多级路由', url: url_base + 'route.js' },
            { text: '校验', url: url_base + 'validate.js' }
        ]
    },

    {
        text: '布局', 
        children: [
            { text: '线性布局', url: url_layout + 'line.js' },
            { text: '流式布局', url: url_layout + 'flow.js' },
            { text: '停靠布局', url: url_layout + 'dock.js' },
            { text: '表格布局', url: url_layout + 'table.js' },
            { text: '自适应', url: url_layout + 'adaption.js' },
            { text: '子布局', url: url_layout + 'sublayout.js' }
        ]
    },

    {
        text: '控件', 
        children: [
            { text: '标签', url: url_controls + 'label.js' },
            { text: '按钮', url: url_controls + 'button.js' },
            { text: '链接', url: url_controls + 'linkbutton.js' },
            { text: '图片', url: url_controls + 'image.js' },
            { text: '滑块', url: url_controls + 'slider.js' },
            { text: '进度条', url: url_controls + 'progressbar.js' },
            { text: '单选框', url: url_controls + 'radiobutton.js' },
            { text: '检查框', url: url_controls + 'checkbox.js' },
            { text: '文本框', url: url_controls + 'textbox.js' },
            { text: '多行文本', url: url_controls + 'memo.js' },
            { text: '文本按钮', url: url_controls + 'textbutton.js' },
            { text: '列表框', url: url_controls + 'listbox.js' },
            { text: '下拉框', url: url_controls + 'combobox.js' },
            { text: '数字编辑框', url: url_controls + 'number.js' },
            { text: '日历', url: url_controls + 'calendar.js' },
            { text: '日期选择', url: url_controls + 'date.js' },
            { text: '时间选择', url: url_controls + 'time.js' },
            { text: '年月选择', url: url_controls + 'month.js' },
            { text: '面板', url: url_controls + 'panel.js' },
            { text: '分组框', url: url_controls + 'groupbox.js' },
            { text: '页签', url: url_controls + 'tab.js' },
            { text: '树', url: url_controls + 'tree.js' },
            { text: '弹出层', url: url_controls + 'popup.js' },
            { text: '提示框', url: url_controls + 'tooltip.js' },
            { text: '弹出窗口', url: url_controls + 'dialog.js' },
            { text: '消息框', url: url_controls + 'showmessage.js' },
            { text: '菜单', url: url_controls + 'menu.js' },
            { text: '工具条', url: url_controls + 'toolbar.js' }
        ]
    },

    {
        text: '表格控件', 
        children: [
            { text: '多行列头', url: url_grid + 'multi-title.js' },
            { text: '自定义列头', url: url_grid + 'custom-title.js' },
            { text: '自定义渲染', url: url_grid + 'custom-render.js' },
            { text: '单元格合并', url: url_grid + 'cell-merge.js' },
            { text: '分页', url: url_grid + 'pagination.js' },
            { text: '锁定', url: url_grid + 'locked.js' },
            { text: '分组', url: url_grid + 'group.js' },
            { text: '树表', url: url_grid + 'tree-grid.js' },
            { text: '一万列测试', url: url_grid + 'demo1.js' },
            { text: '十万行测试', url: url_grid + 'demo2.js' },
            { text: '行号列', url: url_grid + 'column-no.js' },
            { text: '选择列', url: url_grid + 'column-check.js' },
            { text: '编辑列', url: url_grid + 'column-edit.js' }
        ]
    }

];

