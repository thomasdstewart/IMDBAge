/* IMDBAge - 1.6
Created 24/03/2005, Last Changed 21/07/2005
Copyright (c) 2005, Released under the GPL http://www.gnu.org/copyleft/gpl.html
Created by Thomas Stewart, thomas@stewarts.org.uk>
Major bug fixes and improvments by Christopher J. Madsen

This is a Greasemonkey user script, see http://greasemonkey.mozdev.org/.

It adds the age of an actor or actress on their IMDB page.

Test Cases: (In full for completness)
Born 18C -> Died 18C    http://us.imdb.com/name/nm1038177/ (Laurence Sterne)
Born 18C -> Died 19C    http://us.imdb.com/name/nm0308075/ (Almeida Garrett)
Born 18C -> Died 20C    None
Born 18C -> Died 21C    None
Born 18C -> Alive       None

Born 19C -> Died 19C    http://us.imdb.com/name/nm0786564/ (Anna Sewell)
Born 19C -> Died 20C    http://us.imdb.com/name/nm0186440/ (Ward Crane)
Born 19C -> Died 21C    http://us.imdb.com/name/nm0041807/ (Germaine Auger)
Born 19C -> Alive       http://us.imdb.com/name/nm0008724/ (Dawlad Abiad 100+)

Born 20C -> Died 20C    http://us.imdb.com/name/nm0001006/ (John Candy)
Born 20C -> Died 21C    http://us.imdb.com/name/nm0670239/ (John Peel)
Born 20C -> Alive       http://us.imdb.com/name/nm0088127/ (Alexis Bledel)

Born 21C -> Died 21C    None
Born 21C -> Alive       http://us.imdb.com/name/nm1468628/ (Ben Want)

Born 31 Dec 1969        http://us.imdb.com/name/nm1701067/ (Claudia Nero)
Died 31 Dec 1969        http://us.imdb.com/name/nm0862239/ (Carol Thurston)
Born  1 Jan 1970        http://us.imdb.com/name/nm0467846/ (Maka Kotto)
Died  1 Jan 1970        http://us.imdb.com/name/nm0902025/ (Eduard von Borsody)

month(s) http://us.imdb.com/OnThisDay?day=1&month={this month - 1}
year(y)  http://us.imdb.com/BornInYear?{this year - 1}
no month or day info http://us.imdb.com/name/nm1289046/

This was the method I used to find some of the people above, eeeeu!
(If you are crasy enought to run this, expect it to take ages)
(ftp://ftp.fu-berlin.de/pub/misc/movies/database)
for c in 17 18 19 20; do
        $( cat /usr/local/imdbdata/biographies.list.gz | gunzip -c | egrep "^NM: |^DB: |^DD: " | while read line; do echo -n "$line "; done | sed 's/NM: /\nNM: /g' | grep "$c[0-9][0-9]" | while read line; do if [ `echo $line | awk -F: '{print $3}' | grep "$c[0-9][0-9]" | wc -l | awk '{print $1}'` -eq 1 ]; then echo $line; fi; done > b.$c ) &
        $( cat /usr/local/imdbdata/biographies.list.gz | gunzip -c | egrep "^NM: |^DB: |^DD: " | while read line; do echo -n "$line "; done | sed 's/NM: /\nNM: /g' | grep "$c[0-9][0-9]" | while read line; do if [ `echo $line | awk -F: '{print $4}' | grep "$c[0-9][0-9]" | wc -l | awk '{print $1}'` -eq 1 ]; then echo $line; fi; done > d.$c ) &
done
cat b.17 d.17 | sort | uniq -d
{list of people born and died in 18C}
$ wc -l b.17 d.17 b.18 d.18 b.19 d.19 b.20 d.20 all
     196 b.17
      81 d.17
   20563 b.18
     488 d.18
  158992 b.19
   47781 d.19
    1045 b.20
    8549 d.20
  347549 all
$
*/

// ==UserScript==
// @name          IMDBAge
// @namespace     http://www.stewarts.org.uk/stuff
// @description	  Puts the age of an actor or actrees on their IMDB page.
// @include       http://*imdb.com/name/*
// ==/UserScript==

var born, died, link, foundDay;
var day   = 1;
var month = 0;

/* loop over all the a tags involving dates */
var links = document.evaluate(
        "//a[contains(@href,'OnThisDay')] | //a[contains(@href,'BornInYear')] | //a[contains(@href,'DiedInYear')]",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, // must process in order
        null);

/* loop over all dates */
for (var i = 0; i < links.snapshotLength; i++) {
        link = links.snapshotItem(i);

        var href = new String( link.getAttribute("href") );
        /* extract day and month */
        if (href.indexOf('OnThisDay') != -1) {
                /* search href= string for vars */
                var dayindex   = href.indexOf('day=');
                var monthindex = href.indexOf('month=');

                /* use results to extract actual data */
                day = href.substring(dayindex + 4, monthindex - 1);
                month = href.substring(monthindex + 6);

                foundDay = 1;

                /* convert month into a number */
                switch (month) {
                        case 'January':         month = 0;      break;
                        case 'February':        month = 1;      break;
                        case 'March':           month = 2;      break;
                        case 'April':           month = 3;      break;
                        case 'May':             month = 4;      break;
                        case 'June':            month = 5;      break;
                        case 'July':            month = 6;      break;
                        case 'August':          month = 7;      break;
                        case 'September':       month = 8;      break;
                        case 'October':         month = 9;      break;
                        case 'November':        month = 10;     break;
                        case 'December':        month = 11;     break;
                }
        }
        /* extract the year */
        else if (href.indexOf('BornInYear') != -1) {
                born = new Date(href.substring(href.length - 4), month, day);
        }
        else if (href.indexOf('DiedInYear') != -1) {
                died = new Date(href.substring(href.length - 4), month, day);
        }
}

// alert("Born: " + born + "\nDied: " + died);

/* if we found a birth date */
if (born != undefined) {
        /* find the differance between two times */
        var age;
        if(died == undefined) {
                age = new Date() - born.getTime();
        } else {
                age = died.getTime() - born.getTime();
        }

        /* convert difference into years */
        age = age / (1000 * 60 * 60 * 24 * 365.242199);

        /* get nice values */
        var years =  Math.floor( age );
        var months = Math.floor( (age - years) * 12 );

        /* atatch age to last link in dom we found */
        /* only count months if we found month & day info */
        var container = document.createTextNode(" (Age: " +
                years + " year" + (years == 1 ? '' : 's') +
                (foundDay ? ", " + 
                        months + " month" + (months == 1 ? '' : 's')
                : '')
                + ")");
        link.parentNode.insertBefore(container, link.nextSibling);
}
