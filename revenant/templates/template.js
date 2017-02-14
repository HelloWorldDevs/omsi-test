var templateModule = (function(module){
    function getCompiledTemplate(name){
<<<<<<< HEAD
        // console.log('inside of getCompiledTemplate');
=======
        console.log('inside of getCompiledTemplate');
>>>>>>> 679910d9fac19addd079a0edc6d654b8e950a700
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
