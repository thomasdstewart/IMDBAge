/*  IMDBAge v2.3 - Greasemonkey script to add actors ages to IMDB pages
    Copyright (C) 2005-2009 Thomas Stewart <thomas@stewarts.org.uk>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

Inspired in 2001, Created on 24/03/2005, Last Changed 15/11/2009
Major bug fixes and improvements by Christopher J. Madsen

This is a Greasemonkey user script, see http://www.greasespot.net/,
https://addons.mozilla.org/firefox/addon/748 and http://userscripts.org/

This script adds the age and other various info onto IMDB pages. Specifically
it adds some details to actor or actresses pages. It adds their age, their
Tropical Zodiac Sign and their Chinese Zodiac Sign. As well as adding how many
years ago and how old they were when they made the listed films. It also adds
how long a go a film was made on a film page.

Any of the above can be turned on or off by commenting or uncommenting any of
the following variables below. Edit this script once it's installed comment and
uncomment as necessary. */

var doNameAge  = true;
var doNameAges = true;
var doSigns    = true;
var doFilmAge  = true;
//var doNameAge  = false;
//var doNameAges = false;
//var doSigns    = false;
//var doFilmAge  = false;

// ==UserScript==
// @name          IMDBAge
// @namespace     http://www.stewarts.org.uk/stuff
// @description	  Adds the age and other various info onto IMDB pages.
// @include       http://*imdb.com/name/*
// @include       http://*imdb.com/title/*
// ==/UserScript==

/*
Test Cases: (In full for completeness)
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

Born 21C -> Died 21C    http://us.imdb.com/name/nm2548643/ (Tabea Block)
Born 21C -> Alive       http://us.imdb.com/name/nm1468628/ (Ben Want)

Born 31 Dec 1969        http://us.imdb.com/name/nm1009503/ (Taylor McCall)
Died 31 Dec 1969        http://us.imdb.com/name/nm0862239/ (Carol Thurston)
Born  1 Jan 1970        http://us.imdb.com/name/nm0231191/ (Fiona Dolman)
Died  1 Jan 1970        http://us.imdb.com/name/nm0902025/ (Eduard von Borsody)

month(s) http://us.imdb.com/OnThisDay?day=1&month={this month - 1}
year(y)  http://us.imdb.com/BornInYear?{this year - 1}
no month or day info http://us.imdb.com/name/nm1289046/

This was the method I used to find some of the people above, eeeeu! 
(If you are crasy enought to run this, expect it to take ages. It takes 30min on a Intel Core Duo 2 CPU 6400 @ 2.13GHz.)
(ftp://ftp.fu-berlin.de/pub/misc/movies/database)
for c in 17 18 19 20; do
        $( cat biographies.list.gz | gunzip -c | egrep "^NM: |^DB: |^DD: " | while read line; do echo -n "$line "; done | sed 's/NM: /\nNM: /g' | grep "$c[0-9][0-9]" | while read line; do if [ `echo $line | awk -F: '{print $3}' | grep "$c[0-9][0-9]" | wc -l | awk '{print $1}'` -eq 1 ]; then echo $line; fi; done > b.$c ) &
        $( cat biographies.list.gz | gunzip -c | egrep "^NM: |^DB: |^DD: " | while read line; do echo -n "$line "; done | sed 's/NM: /\nNM: /g' | grep "$c[0-9][0-9]" | while read line; do if [ `echo $line | awk -F: '{print $4}' | grep "$c[0-9][0-9]" | wc -l | awk '{print $1}'` -eq 1 ]; then echo $line; fi; done > d.$c ) &
done
cat b.17 d.17 | sort | uniq -d
{list of people born and died in 18C}
$ wc -l b.17 d.17 b.18 d.18 b.19 d.19 b.20 d.20 
     209 b.17
      83 d.17
   23700 b.18
     537 d.18
  219135 b.19
   54588 d.19
    1701 b.20
   14066 d.20
  314019 total
$
*/

/*
TODO: inline png's of the signs, wp has some fre svg's http://en.wikipedia.org/wiki/Signs_of_the_Zodiac
TODO: add ages to individual ages of actors to a film page, very hard, http req for each one, and then a xpath on the whole result
TODO: adjust for logged in or logged off page, fix film ages on name page for old layout
TODO: fix year grabbing code to handle year ranges eg Gilmore Girls 2000-2007
TODO: fix year attaching to handle "2007/I", eg http://us.imdb.com/title/tt0292816/
*/

/*
calculates tropical zodiac sign
input:  month and day
output: tropical zodiac sign as string, includes comma and label
see http://en.wikipedia.org/wiki/Signs_of_the_Zodiac
*/
function tropicalZodiac(month, day) {
        var sign;
        /* link the month and day to the sign */
        if     (month ==  3 && day >= 21 ||
                month ==  4 && day <= 19) {sign = "Aries";}
        else if(month ==  4 && day >= 20 ||
                month ==  5 && day <= 20) {sign = "Taurus";}
        else if(month ==  5 && day >= 21 ||
                month ==  6 && day <= 20) {sign = "Gemini";}
        else if(month ==  6 && day >= 21 ||
                month ==  7 && day <= 22) {sign = "Cancer";}
        else if(month ==  7 && day >= 23 ||
                month ==  8 && day <= 22) {sign = "Leo";}
        else if(month ==  8 && day >= 23 ||
                month ==  9 && day <= 22) {sign = "Virgo";}
        else if(month ==  9 && day >= 23 ||
                month == 10 && day <= 22) {sign = "Libra";}
        else if(month == 10 && day >= 23 ||
                month == 11 && day <= 21) {sign = "Scorpio";}
        else if(month == 11 && day >= 22 ||
                month == 12 && day <= 21) {sign = "Sagittarius";}
        else if(month == 12 && day >= 22 ||
                month ==  1 && day <= 19) {sign = "Capricorn";}
        else if(month ==  1 && day >= 20 ||
                month ==  2 && day <= 18) {sign = "Aquarius";}
        else if(month ==  2 && day >= 19 ||
                month ==  3 && day <= 20) {sign = "Pisces";}
        else {return "";} /* unknown also catches odd dates */
        /* return text with comma and label */
        return ", Tropical Zodiac Sign: " + sign;
}

/*
calculates chinese zodiac sign
input:  full year
output: chinese zodiac sign as string, includes comma and label
see http://en.wikipedia.org/wiki/Chinese_astrology
*/
function chineseZodiac(year) {
        /* no idea how to work out signes before 20C */
        if (year < 1900) { return ""; }
        /* theres 12 signs that go round in a rotation */
        /* find years since 1900, find modulus of that, get rid of the */
        /* sign(sic) and round it */
        var nsign = Math.round(Math.abs((year - 1900) % 12));
        var sign;
        /* next link the two together*/
        if      (nsign ==  0) { sign = "Rat (Metal)"; }
        else if (nsign ==  1) { sign = "Ox (Metal)"; }
        else if (nsign ==  2) { sign = "Tiger (Water)"; }
        else if (nsign ==  3) { sign = "Rabbit/Cat (Water)"; }
        else if (nsign ==  4) { sign = "Dragon (wood)"; }
        else if (nsign ==  5) { sign = "Snake (Wood)"; }
        else if (nsign ==  6) { sign = "Horse (Fire)"; }
        else if (nsign ==  7) { sign = "Goat (Fire)"; }
        else if (nsign ==  8) { sign = "Monkey (Earth)"; }
        else if (nsign ==  9) { sign = "Rooster (Earth)"; }
        else if (nsign == 10) { sign = "Dog (Metal)"; }
        else if (nsign == 11) { sign = "Pig/Wild Boar (Metal)"; }
        else {return "";}  /* unknown also catches odd dates */
        /* return text with comma and label */
        return ", Chinese Zodiac Sign: " + sign;
}

/*
get dates from a name page
input: born and died called by ref, they are filled with dates from the page
output: whether they are dead of alive
*/
function getNameDates(born, died) {
        var date = 1; var month = 0; /* initially set to 1st of Jan */
        var alive;

        /* loop over all the a tags involving dates */
        var links = document.evaluate(
                "//a[contains(@href,'OnThisDay')] | //a[contains(@href,'BornInYear')] | //a[contains(@href,'DiedInYear')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        /* loop over all dates */
        for (var i = 0; i < links.snapshotLength; i++) {
                var link = links.snapshotItem(i);

                var href = new String( link.getAttribute("href") );
                /* extract date and month */
                if (href.indexOf('OnThisDay') != -1) {
                        /* search href= string for vars */
                        var dateindex   = href.indexOf('day=');
                        var monthindex = href.indexOf('month=');

                        /* use results to extract actual data */
                        date = href.substring(dateindex + 4, monthindex - 1);
                        month = href.substring(monthindex + 6);

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
                        born.setFullYear(href.substring(href.length - 4));
                        born.setMonth(month);
                        born.setDate(date);
                        alive = true;
                }
                else if (href.indexOf('DiedInYear') != -1) {
                        died.setFullYear(href.substring(href.length - 4));
                        died.setMonth(month);
                        died.setDate(date);
                        alive = false;
                }
        }
        //alert("Born: " + born + "\nDied: " + died + "\nAlive: " + alive);
        return alive;
}

/*
get dates from a title page
returns: year of title
*/
function getTitleDates() {
        var links = document.evaluate(
                "//a[contains(@href,'Years')]/text()",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        year = new Date();
        year.setFullYear(links.snapshotItem(0).data);
        return year;
}

/*
add age of person to page
input: alive status, and dates
*/
function addAge(alive, born, died) {
        var justyear;

        /* find the difference between two times */
        var age;
        if (died == undefined) {
                age = new Date() - born.getTime();
        } else {
                age = died.getTime() - born.getTime();
        }

        /* convert difference into years */
        age = age / (1000 * 60 * 60 * 24 * 365.242199);

        /* get nice values */
        var years =  Math.floor( age );
        var months = Math.floor( (age - years) * 12 );

        var links = document.evaluate(
                "//a[contains(@href,'OnThisDay')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        if ((alive == true && links.snapshotLength == 1) || 
            (alive == false && links.snapshotLength == 2)) {
                justyear = false;
        } else {
                justyear = true;
        }

        /* loop over all the a tags involving dates */
        var links = document.evaluate(
                "//a[contains(@href,'BornInYear')] | //a[contains(@href,'DiedInYear')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        /* only count months if we found month & day info */
        var container = document.createTextNode(
                        " (Age: " + 
                        years + 
                        " year" +
                        (years == 1 ? '' : 's') +
                                (!justyear ? ", " + 
                                months + 
                                " month" +
                                (months == 1 ? '' : 's')
                                : '') +
                ")");

        /* loop over all dates */
        if (alive == true) {
                link = links.snapshotItem(0);
        } else {
                link = links.snapshotItem(1);
        }
        link.parentNode.insertBefore(container, link.nextSibling);
}

/*
add age of film and the age of the actor when they were in the film
input: full year or birth
*/
function addAges(born) {
        //find all the films, this in includes things like producer and writer
        var links = document.evaluate(
                "//div[contains(@class,'filmo')]/ol/li",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        //loop round each film
        for (var i = 0; i < links.snapshotLength; i++) {
                var link = links.snapshotItem(i);
                //extract the year of the film
                yearindex = link.innerHTML.search("\\([0-9]{4}\\)")
                var filmborn = link.innerHTML.substring(yearindex + 1,
                        yearindex + 5);

                //calculate ages
                var filmage = new Date().getFullYear() - filmborn;
                var age = filmborn - born;
                age = new String(age +
                        " year" + (age == 1 ? '' : 's') + " old");

                //get them in a nice format
                if (filmage < 0) {
                        var agetxt = new String(
                                "in " +
                                Math.abs(filmage) + " year" +
                                (Math.abs(filmage) == 1 ? '' : 's') +
                                " will be " + age);
                }
                if (filmage == 0) {
                        var agetxt = new String(
                                "this year while " + age);
                }
                if (filmage > 0) {
                        var agetxt = new String(
                                Math.abs(filmage) + " year" +
                                (Math.abs(filmage) == 1 ? '' : 's') +
                                " ago while " + age);
                }

                link.innerHTML =
                        link.innerHTML.substring(0, yearindex + 5)
                        + ", " + agetxt
                        + link.innerHTML.substring(yearindex + 5);
        }
}

/*
adds signs to page
input: date person is born
*/
function addSigns(born) {
        /* find place to stick the info */
        var links = document.evaluate(
                // next to "Date of birth (location)" on old layout
                // "//div[contains(@class,'ch')]",
                "//a[contains(@href,'BornInYear')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        /* make a node with info in */
        var container = document.createTextNode(
                tropicalZodiac(born.getMonth() + 1, born.getDate()) +
                chineseZodiac(born.getFullYear())
                );
        /* should be the first occurance of the latter */
        var link = links.snapshotItem(0);
        /* attach it */
        //link.insertBefore(container, link.nextSibling);
        link.parentNode.insertBefore(container, link.nextSibling);
}

/*
add the age of the film to the page
input: date of film
*/
function addFilmAge(filmAge) {
        /* calc age */
        var age = new Date().getFullYear() - filmAge.getFullYear();
        /* only print if age is 1 or over */
        if (age >= 1) {
                /* make a node with info in */
                var container = document.createTextNode(", " +
                        age + 
                        " year" + (age == 1 ? '' : 's') +
                        " ago");
        }
        if (age == 0) {
                var container = document.createTextNode(", This year");
        }
        if (age <= -1) {
                var container = document.createTextNode(", in " +
                        Math.abs(age) + 
                        " year" + (Math.abs(age) == 1 ? '' : 's'));

        }

        /* find place to stick the info */
        var links = document.evaluate(
                "//a[contains(@href,'Years')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        /* should be the first occurrence of the latter */
        var link = links.snapshotItem(0);
        /* attach it */
        link.parentNode.insertBefore(container, link.nextSibling);
}

/* two options, either is a name page */
if (window.location.href.indexOf('name') != -1) {
        born = new Date();
        died = new Date();
        /* get needed dates */
        var alive = getNameDates(born, died);

        /* add wanted bits */
        if(doSigns == true) {
                addSigns(born);
        }
        if(doNameAge == true) {
                addAge(alive, born, died);
        }
        if(doNameAges == true) {
                addAges(born.getFullYear());
        }

/* or a title page */
} else if (window.location.href.indexOf('title') != -1) {
        /* get needed dates */
        filmAge = getTitleDates();

        /* add wanted bits */
        if(doFilmAge == true) {
                addFilmAge(filmAge);
        }
}
