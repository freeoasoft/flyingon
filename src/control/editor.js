flyingon.Control.extend('Editor', function (base) {


    this.defineProperty('name', '');
    

    //编辑类型
    //CheckBox
    //TextBox
    //DatePicker
    //TimePicker
    //MonthPicker
    //ComboBox
    //NumberPicker
    this.defineProperty('type', 'TextBox');


    this.defineProperty('label', '');


    this.defineProperty('placehodler', '');


    this.defineProperty('required', false);


    this.defineProperty('validator', '');


    this.defineProperty('message', '');

    
    this.defineProperty('value', '');


    this.defineProperty('checked', '');

    
    this.defineProperty('format', '');

    
    this.defineProperty('min', '');

    
    this.defineProperty('max', '');


    this['max-length'] = this.defineProperty('maxLength', '');



    //排列顺序
    //r: required
    //l: label
    //t: type
    //v: validator
    this.layout = 'rltv';


});