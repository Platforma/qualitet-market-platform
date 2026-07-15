/* 
 * FIX PAGINACJI - QUALITET-MARKET.COM
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        console.log("System naprawy paginacji: Inicjalizacja...");

        const selectors = ['a.next', '.pagination a', 'a.page-numbers', '.next-page'];
        
        selectors.forEach(selector => {
            const links = document.querySelectorAll(selector);
            
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href && href !== '#' && href.length > 1) {
                        console.log("Naprawa kliknięcia: Przekierowanie do " + href);
                        window.location.href = href;
                    }
                });
            });
        });
    });
})();
