(function (load) {


    load.__root_path = '';


    load.__start_path = load.__base_path = '';


    load.__load_translate = function (url) {

        require(url);
    };


    load.require = function (list, callback) {

        for (var i = 0, l = list.length; i < l; i++)
        {
            require[list[i]];
        }

        if (callback)
        {
            callback(flyingon);
        }
    };


})(flyingon.load);