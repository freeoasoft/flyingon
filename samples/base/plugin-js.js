flyingon.plugin(function (base) {


    this.init = function () {

        this.padding(8).layout('vertical-line');

        this.push(
            { Class: 'Label', text: '继承插件示例', style: 'color:red;' },
            { Class: 'Code' });
    };


});