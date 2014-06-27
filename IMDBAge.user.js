/* IMDBAge - 1.5
Created 24/03/2005, Last Changed 18/05/2005
Copyright (c) 2005, Thomas Stewart <thomas@stewarts.org.uk>
Released under the GPL http://www.gnu.org/copyleft/gpl.html

This is a Greasemonkey user script, see http://greasemonkey.mozdev.org/.

It adds the age of an actor or actress on their IMDB page.

Test Cases: (In full for completness)
Born 18C -> Died 18C    ???
Born 18C -> Died 19C    http://us.imdb.com/name/nm0308075/ (Almeida Garrett)
Born 18C -> Died 20C    ???
Born 18C -> Died 21C    ???
Born 19C -> Alive       ???

Born 19C -> Died 19C    http://us.imdb.com/name/nm0786564/ (Anna Sewell)
Born 19C -> Died 20C    http://us.imdb.com/name/nm0186440/ (Ward Crane)
Born 19C -> Died 21C    ???
Born 19C -> Alive       ???

Born 20C -> Died 20C    http://us.imdb.com/name/nm0001006/ (John Candy)
Born 20C -> Died 21C    http://us.imdb.com/name/nm0670239/ (John Peel)
Born 20C -> Alive       http://us.imdb.com/name/nm0088127/ (Alexis Bledel)

Born 21C -> Died 21C    ???
Born 21C -> Alive       http://us.imdb.com/name/nm1468628/ (Ben Want)
*/

// ==UserScript==
// @name          IMDBAge
// @namespace     http://www.stewarts.org.uk/stuff
// @description	  Puts the age of an actor or actrees on their IMDB page.
// @include       http://*imdb.com/name/*
// ==/UserScript==

var born = new Date(0);
var died = new Date(0);
var link;

/* loop over all the a tags */
var links = document.getElementsByTagName("a"); 
for(i=0; i < links.length; i++) {
        var href = new String( links[i].getAttribute("href") );
        /* extract day and month */
        if(href.indexOf('OnThisDay') != -1) {
                /* search href= string for vars */
                var dayindex   = href.indexOf('day='); 
                var monthindex = href.indexOf('month=');

                /* use results to extract actual data */
                var day = href.substring(dayindex + 4, monthindex - 1); 
                var month = href.substring(monthindex + 6); 

                /* convert month into a number */
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

                /* if born is 0, fill in born info */
                if(born.getTime() == 0) {
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

// alert("Born: " + born + "\nDied: " + died);

/* find the differance between two times */
var age = new String();
if(died.getTime() == 0) {
        var age = new Date() - born.getTime();
} else {
        var age = died.getTime() - born.getTime();
}

/* convert difference into days */
age = age / (1000*60*60*24*365.25);

/* get nice values */
var years =  Math.floor( age );
var months = Math.floor( (age - years) * 12 );

/* atatch age to dom */
var container = document.createTextNode(" (Age: " 
        + years + " years, " + months + " months)");
link.parentNode.insertBefore(container, link.nextSibling);

