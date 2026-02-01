// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.documentReady = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return function(controllerLoader, args) {
        var documentReadyNow = function() {
            if (document.readyState !== 'loading') controllerLoader();
            else document.addEventListener("DOMContentLoaded", controllerLoader); 
        }
        var $isotope, $jquery;
        /* jQuery, isotope 링크 작업 */
        if (args) {
            args.forEach(function(arg) {
                $isotope = arg && arg.namespace == "isotope" ? arg : null;
                $masonry = arg && arg.namespace == "masonry" ? arg : null;
                $jquery = arg && arg.prototype && arg.prototype.jquery ? arg : null;
            });
        }
        $isotope && $jquery ?
                require(['jquery-bridget/jquery-bridget'], function(jQB) { 
                    jQB('isotope', $isotope, $jquery); documentReadyNow(); 
                }) : documentReadyNow();
        $masonry && $jquery ?
                require(['jquery-bridget/jquery-bridget'], function(jQB) { 
                    jQB('masonry', $masonry, $jquery); documentReadyNow(); 
                }) : documentReadyNow();
    };
}));