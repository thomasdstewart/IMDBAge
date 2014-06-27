/*  IMDBAge v2.7 - Greasemonkey script to add actors ages to IMDB pages
    Copyright (C) 2005-2011 Thomas Stewart <thomas@stewarts.org.uk>

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

Inspired in 2001, Created on 24/03/2005, Last Changed 24/09/2011
Major bug fixes and improvements by Christopher J. Madsen

This is a Greasemonkey user script, see http://www.greasespot.net/,
https://addons.mozilla.org/firefox/addon/748 and http://userscripts.org/

New versions can be found either on my site or on the userscripts site:
http://www.stewarts.org.uk/tomsweb/IMDBAge
http://userscripts.org/scripts/show/1060

This script adds the age and other various info onto IMDB pages. Specifically
it adds some details to actor or actresses pages. It adds their age, their
Tropical Zodiac Sign and their Chinese Zodiac Sign. As well as adding how many
years ago and how old they were when they made the listed films. It also adds
how long a go a film was made on a film page.

Any of the above can be turned on or off by setting the following settings in about:config:
greasemonkey.scriptvals.http://www.stewarts.org.uk/IMDBAge.doFilmAge
greasemonkey.scriptvals.http://www.stewarts.org.uk/IMDBAge.doNameAge
greasemonkey.scriptvals.http://www.stewarts.org.uk/IMDBAge.doNameAges
greasemonkey.scriptvals.http://www.stewarts.org.uk/IMDBAge.doSigns
*/

var doNameAge  = GM_getValue("doNameAge",  true);
var doNameAges = GM_getValue("doNameAges", true);
var doSigns    = GM_getValue("doSigns",    true);
var doFilmAge  = GM_getValue("doFilmAge",  true);

GM_setValue("doNameAge",  doNameAge)
GM_setValue("doNameAges", doNameAges)
GM_setValue("doSigns",    doSigns)
GM_setValue("doFilmAge",  doFilmAge)

// ==UserScript==
// @name        IMDBAge
// @description Adds the age and other various info onto IMDB pages.
// @version     2.7
// @namespace   http://www.stewarts.org.uk
// @include     http://*imdb.com/name/*
// @include     http://*imdb.com/title/*
// @icon        http://www.stewarts.org.uk/tomsweb/IMDBAge?action=AttachFile&do=get&target=icon.png  
// ==/UserScript==

/*
Test Cases: (In full for completeness)
Born 18C -> Died 18C    http://us.imdb.com/name/nm1038177/ (Laurence Sterne 54)
Born 18C -> Died 19C    http://us.imdb.com/name/nm0308075/ (Almeida Garrett 55)
Born 18C -> Died 20C    None
Born 18C -> Died 21C    None
Born 18C -> Alive       None

Born 19C -> Died 19C    http://us.imdb.com/name/nm0786564/ (Anna Sewell 58)
Born 19C -> Died 20C    http://us.imdb.com/name/nm0186440/ (Ward Crane 38)
Born 19C -> Died 21C    http://us.imdb.com/name/nm0041807/ (Germaine Auger 112)
Born 19C -> Alive       http://us.imdb.com/name/nm0008724/ (Dawlad Abiad 114)

Born 20C -> Died 20C    http://us.imdb.com/name/nm0001006/ (John Candy 43)
Born 20C -> Died 21C    http://us.imdb.com/name/nm0670239/ (John Peel 65)
Born 20C -> Alive       http://us.imdb.com/name/nm0088127/ (Alexis Bledel 28)

Born 21C -> Died 21C    http://us.imdb.com/name/nm2548643/ (Tabea Block 1)
Born 21C -> Alive       http://us.imdb.com/name/nm1468628/ (Ben Want 7)

Born 31 Dec 1969        http://us.imdb.com/name/nm1009503/ (Taylor McCall 40)
Died 31 Dec 1969        http://us.imdb.com/name/nm0862239/ (Carol Thurston 46)
Born  1 Jan 1970        http://us.imdb.com/name/nm0231191/ (Fiona Dolman 40)
Died  1 Jan 1970        http://us.imdb.com/name/nm0902025/ (Eduard von Borsody 71)

http://us.imdb.com/date/{month}-{day}
http://us.imdb.com/search/name?birth_year={year}

This was the method I used to find some of the people above, eeeeu! 
(If you are crazy enough to run this, expect it to take ages. It takes 30min on a Intel Core Duo 2 CPU 6400 @ 2.13GHz.)
(ftp://ftp.fu-berlin.de/pub/misc/movies/database)
for c in 17 18 19 20; do
        $( cat biographies.list.gz | gunzip -c | egrep "^NM: |^DB: |^DD: " | while read line; do echo -n "$line "; done | sed 's/NM: /\nNM: /g' | grep "$c[0-9][0-9]" | while read line; do if [ `echo $line | awk -F: '{print $3}' | grep "$c[0-9][0-9]" | wc -l | awk '{print $1}'` -eq 1 ]; then echo $line; fi; done > b.$c ) &
        $( cat biographies.list.gz | gunzip -c | egrep "^NM: |^DB: |^DD: " | while read line; do echo -n "$line "; done | sed 's/NM: /\nNM: /g' | grep "$c[0-9][0-9]" | while read line; do if [ `echo $line | awk -F: '{print $4}' | grep "$c[0-9][0-9]" | wc -l | awk '{print $1}'` -eq 1 ]; then echo $line; fi; done > d.$c ) &
done
cat b.17 d.17 | sort | uniq -d
{list of people born and died in 18C}
$ wc -l b.17 d.17 b.18 d.18 b.19 d.19 b.20 d.20 
     235 b.17
      91 d.17
   26449 b.18
     586 d.18
  282661 b.19
   61817 d.19
    2477 b.20
   22461 d.20
  396777 total
$
*/

/*
TODO: add ages to individual ages of actors to a film page, very hard,
        http req for each one, and then a xpath on the whole result
TODO: fix year attaching to handle "2007/I"
TODO: fix year attachiog to handle "(TV Series 2000-2007)" better
TODO: add script updater support
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
                month ==  4 && day <= 19) {sign = "Aries - ♈";}
        else if(month ==  4 && day >= 20 ||
                month ==  5 && day <= 20) {sign = "Taurus - ♉";}
        else if(month ==  5 && day >= 21 ||
                month ==  6 && day <= 20) {sign = "Gemini - ♊";}
        else if(month ==  6 && day >= 21 ||
                month ==  7 && day <= 22) {sign = "Cancer - ♋";}
        else if(month ==  7 && day >= 23 ||
                month ==  8 && day <= 22) {sign = "Leo - ♌";}
        else if(month ==  8 && day >= 23 ||
                month ==  9 && day <= 22) {sign = "Virgo - ♍";}
        else if(month ==  9 && day >= 23 ||
                month == 10 && day <= 22) {sign = "Libra - ♎";}
        else if(month == 10 && day >= 23 ||
                month == 11 && day <= 21) {sign = "Scorpio - ♏";}
        else if(month == 11 && day >= 22 ||
                month == 12 && day <= 21) {sign = "Sagittarius - ♐";}
        else if(month == 12 && day >= 22 ||
                month ==  1 && day <= 19) {sign = "Capricorn - ♑";}
        else if(month ==  1 && day >= 20 ||
                month ==  2 && day <= 18) {sign = "Aquarius - ♒";}
        else if(month ==  2 && day >= 19 ||
                month ==  3 && day <= 20) {sign = "Pisces - ♓";}
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
        var day = 1; var month = 0; /* initially set to 1st of Jan */
        var alive;

        /* loop over all the a tags involving dates */
        var links = document.evaluate(
                "//a[contains(@href,'birth_monthday')] | //a[contains(@href,'birth_year')] | //a[contains(@href,'deaths')] | //a[contains(@href,'death_date')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        /* loop over all dates */
        for (var i = 0; i < links.snapshotLength; i++) {
                var link = links.snapshotItem(i);

                var href = new String( link.getAttribute("href") );
                /* extract date and month */
                if (href.indexOf('birth_monthday') > 0) {
                        /* extract actual data */
                        month = parseFloat(href.substring(28, 30)) - 1;
                        day = href.substring(31, 33);
                }
                else if (href.indexOf('deaths') > 0) {
                        /* extract actual data */
                        month = parseFloat(href.substring(6, 8)) - 1;
                        day = href.substring(9, 11);
                }
                /* extract the year */
                else if (href.indexOf('birth_year') > 0) {
                        born.setFullYear(href.substring(href.length - 4));
                        born.setMonth(month);
                        born.setDate(day);
                        alive = true;
                }
                else if (href.indexOf('death_date') > 0) {
                        died.setFullYear(href.substring(href.length - 4));
                        died.setMonth(month);
                        died.setDate(day);
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
                "//a[contains(@href,'year')]/text()",
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
                "//a[contains(@href,'/date')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);
        
        /* only print the year if there arn't dates */
        if ((alive == true && links.snapshotLength == 1) || 
            (alive == false && links.snapshotLength == 2)) {
                justyear = false;
        } else {
                justyear = true;
        }

        /* loop over all the a tags involving dates */
        var links = document.evaluate(
                "//a[contains(@href,'birth_year')] | //a[contains(@href,'death_date')]",
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
                "//span[contains(@class,'year_column')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null);

        //loop round each film
        for (var i = 0; i < links.snapshotLength; i++) {
                var link = links.snapshotItem(i);
                //extract the year of the film
                yearindex = link.innerHTML.search("[0-9]{4}")
                var filmborn = link.innerHTML.substring(yearindex,
                        yearindex + 4);

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

                link.innerHTML = agetxt + ", " + link.innerHTML;
        }
}

/*
adds signs to page
input: date person is born
*/
function addSigns(born) {
        /* find place to stick the info */
        var links = document.evaluate(
                "//a[contains(@href,'birth_year')]",
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
                "//a[contains(@href,'year')]",
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
