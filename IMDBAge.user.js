/*
IMDBAge - 1.3 24/03/2005
Copyright (c) 2005, Thomas Stewart <thomas@stewarts.org.uk>
Released under the GPL http://www.gnu.org/copyleft/gpl.html

This is a Greasemonkey user script, see http://greasemonkey.mozdev.org/.

It adds the age of an actor or actress on their IMDB page.

TODO:
-place age as sibling of a, not child of it
*/

// ==UserScript==
// @name          IMDBAge
// @namespace     http://www.stewarts.org.uk/stuff
// @description	  Puts the age of an actor or actrees on their IMDB page.
// @include       http://*imdb.com/name/*
// ==/UserScript==

(function() {
        var born = new Date(0); var died = new Date(0);
        var link;

        /* loop over all the a tags */
        var links = document.getElementsByTagName("a"); 
        for(i=0; i < links.length; i++) {
                var href = new String( links[i].getAttribute("href") );
                /* extract day and month */
                if(href.indexOf('OnThisDay') != -1) {
                        var dayindex   = href.indexOf('day='); 
                        var monthindex = href.indexOf('month=');
                        var day = href.substring(dayindex + 4, monthindex - 1); 
                        var month = href.substring(monthindex + 6); 

                        switch (month) {
                        case 'January':
                                month = 0;
                                break;
                        case 'February':
                                month = 1;
                                break;
                        case 'March':
                                month = 2;
                                break;
                        case 'April':
                                month = 3;
                                break;
                        case 'May':
                                month = 4;
                                break;
                        case 'June':
                                month = 5;
                                break;
                        case 'July':
                                month = 6;
                                break;
                        case 'August':
                                month = 7;
                                break;
                        case 'September':
                                month = 8;
                                break;
                        case 'October':
                                month = 9;
                                break;
                        case 'November':
                                month = 10;
                                break;
                        case 'December':
                                month = 11;
                                break;
                        }

                        /* if died is as of yet blank, fill in born info */
                        if(died.getTime() == 0) {
                                born.setDate(day);
                                born.setMonth(month);
                        } else { /* fill in died info */
                                died.setDate(day);
                                died.setMonth(month);
                        }
                }
                /* extract the year, and keep link */
                if(href.indexOf('BornInYear') != -1) {
                        born.setFullYear( href.substring(href.length - 4) );
                        link =  links[i];
                }
                if(href.indexOf('DiedInYear') != -1) {
                        died.setFullYear( href.substring(href.length - 4) );
                        link =  links[i];
                }
        }

        /* alert("Born: " + born + "\nDied: " + died); */

        /* find the differance between two times */
        var age = new String();
        if(died.getTime() == 0) {
                var age = new Date() - born.getTime();
        } else {
                var age = died.getTime() - born.getTime();
        }

        /* convert difference into days */
        age = age / (1000*60*60*24*365.25);

        var years =  Math.floor( age );
        var months = Math.floor( (age - years) * 12 );
        
        /* atatch age to dom */
        var container = document.createTextNode(" (Aged: " 
                + years + " years, " + months + " months)");
        link.appendChild(container);
        
/*
        var i=0;
        while (links[i] != link.parentnode){
                i++;
        }
        i++;
        links[i].appendchildcontainer);
*/
        
})();

