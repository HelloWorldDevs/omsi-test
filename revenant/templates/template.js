var templateModule = (function(module){
    function getCompiledTemplate(name){
        // console.log('inside of getCompiledTemplate');
        return $.ajax({
            type: 'GET',
            url: '/revenant/templates/' + name + '.hbs'
        })
            .then(function(text){
                return Handlebars.compile(text);
            });
    }
    return {
        getCompiledTemplate : getCompiledTemplate
    }
})();
