$(document).ready(function () {

    /***************** Countdown ******************/

    CountDownTimer('2021-11-28T19:30:00Z', 'countdown');

    function CountDownTimer(dt, id) {
        var end = new Date(dt);

        var _second = 1000;
        var _minute = _second * 60;
        var _hour = _minute * 60;
        var _day = _hour * 24;
        var timer;

        function showRemaining() {
            var now = new Date();
            var distance = end - now;
            if (distance < 0) {

                clearInterval(timer);
                document.getElementById(id).innerHTML = 'CHEGOU!!';

                return;
            }

            var days = Math.floor(distance / _day);
            var hours = Math.floor((distance % _day) / _hour);
            var minutes = Math.floor((distance % _hour) / _minute);
            var seconds = Math.floor((distance % _minute) / _second);

            document.getElementById('cd-days').innerHTML = ("00" + days).slice(-2);
            document.getElementById('cd-hours').innerHTML = ("00" + hours).slice(-2);
            document.getElementById('cd-minutes').innerHTML = ("00" + minutes).slice(-2);
            document.getElementById('cd-seconds').innerHTML = ("00" + seconds).slice(-2);
        }

        timer = setInterval(showRemaining, 1000);
    }

    /***************** Timeline *******************/

    timeline(document.querySelectorAll('.timeline'));

    function timeline(collection, options) {
        const timelines = [];
        const warningLabel = 'Timeline:';
        let winWidth = window.innerWidth;
        let resizeTimer;
        let currentIndex = 0;
        // Set default settings
        const defaultSettings = {
            forceVerticalMode: {
                type: 'integer',
                defaultValue: 600
            },
            horizontalStartPosition: {
                type: 'string',
                acceptedValues: ['bottom', 'top'],
                defaultValue: 'top'
            },
            mode: {
                type: 'string',
                acceptedValues: ['horizontal', 'vertical'],
                defaultValue: 'vertical'
            },
            moveItems: {
                type: 'integer',
                defaultValue: 1
            },
            rtlMode: {
                type: 'boolean',
                acceptedValues: [true, false],
                defaultValue: false
            },
            startIndex: {
                type: 'integer',
                defaultValue: 0
            },
            verticalStartPosition: {
                type: 'string',
                acceptedValues: ['left', 'right'],
                defaultValue: 'left'
            },
            verticalTrigger: {
                type: 'string',
                defaultValue: '15%'
            },
            visibleItems: {
                type: 'integer',
                defaultValue: 3
            }
        };

        // Helper function to test whether values are an integer
        function testValues(value, settingName) {
            if (typeof value !== 'number' && value % 1 !== 0) {
                console.warn(`${warningLabel} The value "${value}" entered for the setting "${settingName}" is not an integer.`);
                return false;
            }
            return true;
        }

        // Helper function to wrap an element in another HTML element
        function itemWrap(el, wrapper, classes) {
            wrapper.classList.add(classes);
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
        }

        // Helper function to wrap each element in a group with other HTML elements
        function wrapElements(items) {
            items.forEach((item) => {
                itemWrap(item.querySelector('.timeline__content'), document.createElement('div'), 'timeline__content__wrap');
                itemWrap(item.querySelector('.timeline__content__wrap'), document.createElement('div'), 'timeline__item__inner');
            });
        }

        // Helper function to check if an element is partially in the viewport
        function isElementInViewport(el, triggerPosition) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const defaultTrigger = defaultSettings.verticalTrigger.defaultValue.match(/(\d*\.?\d*)(.*)/);
            let triggerUnit = triggerPosition.unit;
            let triggerValue = triggerPosition.value;
            let trigger = windowHeight;
            if (triggerUnit === 'px' && triggerValue >= windowHeight) {
                console.warn('The value entered for the setting "verticalTrigger" is larger than the window height. The default value will be used instead.');
                [, triggerValue, triggerUnit] = defaultTrigger;
            }
            if (triggerUnit === 'px') {
                trigger = parseInt(trigger - triggerValue, 10);
            } else if (triggerUnit === '%') {
                trigger = parseInt(trigger * ((100 - triggerValue) / 100), 10);
            }
            return (
                rect.top <= trigger
                && rect.left <= (window.innerWidth || document.documentElement.clientWidth)
                && (rect.top + rect.height) >= 0
                && (rect.left + rect.width) >= 0
            );
        }

        // Helper function to add transform styles
        function addTransforms(el, transform) {
            el.style.webkitTransform = transform;
            el.style.msTransform = transform;
            el.style.transform = transform;
        }

        // Create timelines
        function createTimelines(timelineEl) {
            const timelineName = timelineEl.id ? `#${timelineEl.id}` : `.${timelineEl.className}`;
            const errorPart = 'could not be found as a direct descendant of';
            const data = timelineEl.dataset;
            let wrap;
            let scroller;
            let items;
            const settings = {};

            // Test for correct HTML structure
            try {
                wrap = timelineEl.querySelector('.timeline__wrap');
                if (!wrap) {
                    throw new Error(`${warningLabel} .timeline__wrap ${errorPart} ${timelineName}`);
                } else {
                    scroller = wrap.querySelector('.timeline__items');
                    if (!scroller) {
                        throw new Error(`${warningLabel} .timeline__items ${errorPart} .timeline__wrap`);
                    } else {
                        items = [].slice.call(scroller.children, 0);
                    }
                }
            } catch (e) {
                console.warn(e.message);
                return false;
            }

            // Test setting input values
            Object.keys(defaultSettings).forEach((key) => {
                settings[key] = defaultSettings[key].defaultValue;

                if (data[key]) {
                    settings[key] = data[key];
                } else if (options && options[key]) {
                    settings[key] = options[key];
                }

                if (defaultSettings[key].type === 'integer') {
                    if (!settings[key] || !testValues(settings[key], key)) {
                        settings[key] = defaultSettings[key].defaultValue;
                    }
                } else if (defaultSettings[key].type === 'string') {
                    if (defaultSettings[key].acceptedValues && defaultSettings[key].acceptedValues.indexOf(settings[key]) === -1) {
                        console.warn(`${warningLabel} The value "${settings[key]}" entered for the setting "${key}" was not recognised.`);
                        settings[key] = defaultSettings[key].defaultValue;
                    }
                }
            });

            // Further specific testing of input values
            const defaultTrigger = defaultSettings.verticalTrigger.defaultValue.match(/(\d*\.?\d*)(.*)/);
            const triggerArray = settings.verticalTrigger.match(/(\d*\.?\d*)(.*)/);
            let [, triggerValue, triggerUnit] = triggerArray;
            let triggerValid = true;
            if (!triggerValue) {
                console.warn(`${warningLabel} No numercial value entered for the 'verticalTrigger' setting.`);
                triggerValid = false;
            }
            if (triggerUnit !== 'px' && triggerUnit !== '%') {
                console.warn(`${warningLabel} The setting 'verticalTrigger' must be a percentage or pixel value.`);
                triggerValid = false;
            }
            if (triggerUnit === '%' && (triggerValue > 100 || triggerValue < 0)) {
                console.warn(`${warningLabel} The 'verticalTrigger' setting value must be between 0 and 100 if using a percentage value.`);
                triggerValid = false;
            } else if (triggerUnit === 'px' && triggerValue < 0) {
                console.warn(`${warningLabel} The 'verticalTrigger' setting value must be above 0 if using a pixel value.`);
                triggerValid = false;
            }

            if (triggerValid === false) {
                [, triggerValue, triggerUnit] = defaultTrigger;
            }

            settings.verticalTrigger = {
                unit: triggerUnit,
                value: triggerValue
            };

            if (settings.moveItems > settings.visibleItems) {
                console.warn(`${warningLabel} The value of "moveItems" (${settings.moveItems}) is larger than the number of "visibleItems" (${settings.visibleItems}). The value of "visibleItems" has been used instead.`);
                settings.moveItems = settings.visibleItems;
            }

            if (settings.startIndex > (items.length - settings.visibleItems) && items.length > settings.visibleItems) {
                console.warn(`${warningLabel} The 'startIndex' setting must be between 0 and ${items.length - settings.visibleItems} for this timeline. The value of ${items.length - settings.visibleItems} has been used instead.`);
                settings.startIndex = items.length - settings.visibleItems;
            } else if (items.length <= settings.visibleItems) {
                console.warn(`${warningLabel} The number of items in the timeline must exceed the number of visible items to use the 'startIndex' option.`);
                settings.startIndex = 0;
            } else if (settings.startIndex < 0) {
                console.warn(`${warningLabel} The 'startIndex' setting must be between 0 and ${items.length - settings.visibleItems} for this timeline. The value of 0 has been used instead.`);
                settings.startIndex = 0;
            }

            timelines.push({
                timelineEl,
                wrap,
                scroller,
                items,
                settings
            });
        }

        if (collection.length) {
            [].forEach.call(collection, createTimelines);
        }

        // Set height and widths of timeline elements and viewport
        function setHeightandWidths(tl) {
            // Set widths of items and viewport
            function setWidths() {
                tl.itemWidth = tl.wrap.offsetWidth / tl.settings.visibleItems;
                tl.items.forEach((item) => {
                    item.style.width = `${tl.itemWidth}px`;
                });
                tl.scrollerWidth = tl.itemWidth * tl.items.length;
                tl.scroller.style.width = `${tl.scrollerWidth}px`;
            }

            // Set height of items and viewport
            function setHeights() {
                let oddIndexTallest = 0;
                let evenIndexTallest = 0;
                tl.items.forEach((item, i) => {
                    item.style.height = 'auto';
                    const height = item.offsetHeight;
                    if (i % 2 === 0) {
                        evenIndexTallest = height > evenIndexTallest ? height : evenIndexTallest;
                    } else {
                        oddIndexTallest = height > oddIndexTallest ? height : oddIndexTallest;
                    }
                });

                const transformString = `translateY(${evenIndexTallest}px)`;
                tl.items.forEach((item, i) => {
                    if (i % 2 === 0) {
                        item.style.height = `${evenIndexTallest}px`;
                        if (tl.settings.horizontalStartPosition === 'bottom') {
                            item.classList.add('timeline__item--bottom');
                            addTransforms(item, transformString);
                        } else {
                            item.classList.add('timeline__item--top');
                        }
                    } else {
                        item.style.height = `${oddIndexTallest}px`;
                        if (tl.settings.horizontalStartPosition !== 'bottom') {
                            item.classList.add('timeline__item--bottom');
                            addTransforms(item, transformString);
                        } else {
                            item.classList.add('timeline__item--top');
                        }
                    }
                });
                tl.scroller.style.height = `${evenIndexTallest + oddIndexTallest}px`;
            }

            if (window.innerWidth > tl.settings.forceVerticalMode) {
                setWidths();
                setHeights();
            }
        }

        // Create and add arrow controls to horizontal timeline
        function addNavigation(tl) {
            if (tl.items.length > tl.settings.visibleItems) {
                const prevArrow = document.createElement('button');
                const nextArrow = document.createElement('button');
                const topPosition = tl.items[0].offsetHeight;
                prevArrow.className = 'timeline-nav-button timeline-nav-button--prev';
                nextArrow.className = 'timeline-nav-button timeline-nav-button--next';
                prevArrow.textContent = 'Previous';
                nextArrow.textContent = 'Next';
                prevArrow.style.top = `${topPosition}px`;
                nextArrow.style.top = `${topPosition}px`;
                if (currentIndex === 0) {
                    prevArrow.disabled = true;
                } else if (currentIndex === (tl.items.length - tl.settings.visibleItems)) {
                    nextArrow.disabled = true;
                }
                tl.timelineEl.appendChild(prevArrow);
                tl.timelineEl.appendChild(nextArrow);
            }
        }

        // Add the centre line to the horizontal timeline
        function addHorizontalDivider(tl) {
            const divider = tl.timelineEl.querySelector('.timeline-divider');
            if (divider) {
                tl.timelineEl.removeChild(divider);
            }
            const topPosition = tl.items[0].offsetHeight;
            const horizontalDivider = document.createElement('span');
            horizontalDivider.className = 'timeline-divider';
            horizontalDivider.style.top = `${topPosition}px`;
            tl.timelineEl.appendChild(horizontalDivider);
        }

        // Calculate the new position of the horizontal timeline
        function timelinePosition(tl) {
            const position = tl.items[currentIndex].offsetLeft;
            const str = `translate3d(-${position}px, 0, 0)`;
            addTransforms(tl.scroller, str);
        }

        // Make the horizontal timeline slide
        function slideTimeline(tl) {
            const navArrows = tl.timelineEl.querySelectorAll('.timeline-nav-button');
            const arrowPrev = tl.timelineEl.querySelector('.timeline-nav-button--prev');
            const arrowNext = tl.timelineEl.querySelector('.timeline-nav-button--next');
            const maxIndex = tl.items.length - tl.settings.visibleItems;
            const moveItems = parseInt(tl.settings.moveItems, 10);
            [].forEach.call(navArrows, (arrow) => {
                arrow.addEventListener('click', function (e) {
                    e.preventDefault();
                    currentIndex = this.classList.contains('timeline-nav-button--next') ? (currentIndex += moveItems) : (currentIndex -= moveItems);
                    if (currentIndex === 0 || currentIndex < 0) {
                        currentIndex = 0;
                        arrowPrev.disabled = true;
                        arrowNext.disabled = false;
                    } else if (currentIndex === maxIndex || currentIndex > maxIndex) {
                        currentIndex = maxIndex;
                        arrowPrev.disabled = false;
                        arrowNext.disabled = true;
                    } else {
                        arrowPrev.disabled = false;
                        arrowNext.disabled = false;
                    }
                    timelinePosition(tl);
                });
            });
        }

        // Set up horizontal timeline
        function setUpHorinzontalTimeline(tl) {
            if (tl.settings.rtlMode) {
                currentIndex = tl.items.length > tl.settings.visibleItems ? tl.items.length - tl.settings.visibleItems : 0;
            } else {
                currentIndex = tl.settings.startIndex;
            }
            tl.timelineEl.classList.add('timeline--horizontal');
            setHeightandWidths(tl);
            timelinePosition(tl);
            addNavigation(tl);
            addHorizontalDivider(tl);
            slideTimeline(tl);
        }

        // Set up vertical timeline
        function setUpVerticalTimeline(tl) {
            let lastVisibleIndex = 0;
            tl.items.forEach((item, i) => {
                item.classList.remove('animated', 'fadeIn');
                if (!isElementInViewport(item, tl.settings.verticalTrigger) && i > 0) {
                    item.classList.add('animated');
                } else {
                    lastVisibleIndex = i;
                }
                const divider = tl.settings.verticalStartPosition === 'left' ? 1 : 0;
                if (i % 2 === divider && window.innerWidth > tl.settings.forceVerticalMode) {
                    item.classList.add('timeline__item--right');
                } else {
                    item.classList.add('timeline__item--left');
                }
            });
            for (let i = 0; i < lastVisibleIndex; i += 1) {
                tl.items[i].classList.remove('animated', 'fadeIn');
            }
            // Bring elements into view as the page is scrolled
            window.addEventListener('scroll', () => {
                tl.items.forEach((item) => {
                    if (isElementInViewport(item, tl.settings.verticalTrigger)) {
                        item.classList.add('fadeIn');
                    }
                });
            });
        }

        // Reset timelines
        function resetTimelines(tl) {
            tl.timelineEl.classList.remove('timeline--horizontal', 'timeline--mobile');
            tl.scroller.removeAttribute('style');
            tl.items.forEach((item) => {
                item.removeAttribute('style');
                item.classList.remove('animated', 'fadeIn', 'timeline__item--left', 'timeline__item--right');
            });
            const navArrows = tl.timelineEl.querySelectorAll('.timeline-nav-button');
            [].forEach.call(navArrows, (arrow) => {
                arrow.parentNode.removeChild(arrow);
            });
        }

        // Set up the timelines
        function setUpTimelines() {
            timelines.forEach((tl) => {
                tl.timelineEl.style.opacity = 0;
                if (!tl.timelineEl.classList.contains('timeline--loaded')) {
                    wrapElements(tl.items);
                }
                resetTimelines(tl);
                if (window.innerWidth <= tl.settings.forceVerticalMode) {
                    tl.timelineEl.classList.add('timeline--mobile');
                }
                if (tl.settings.mode === 'horizontal' && window.innerWidth > tl.settings.forceVerticalMode) {
                    setUpHorinzontalTimeline(tl);
                } else {
                    setUpVerticalTimeline(tl);
                }
                tl.timelineEl.classList.add('timeline--loaded');
                setTimeout(() => {
                    tl.timelineEl.style.opacity = 1;
                }, 500);
            });
        }

        // Initialise the timelines on the page
        setUpTimelines();

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newWinWidth = window.innerWidth;
                if (newWinWidth !== winWidth) {
                    setUpTimelines();
                    winWidth = newWinWidth;
                }
            }, 250);
        });
    }

    // Register as a jQuery plugin if the jQuery library is present
    if (window.jQuery) {
        (($) => {
            $.fn.timeline = function (opts) {
                timeline(this, opts);
                return this;
            };
        })(window.jQuery);
    }


    /***************** Waypoints ******************/

    $('.wp1').waypoint(function () {
        $('.wp1').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp2').waypoint(function () {
        $('.wp2').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp3').waypoint(function () {
        $('.wp3').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp4').waypoint(function () {
        $('.wp4').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp5').waypoint(function () {
        $('.wp5').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp6').waypoint(function () {
        $('.wp6').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp7').waypoint(function () {
        $('.wp7').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp8').waypoint(function () {
        $('.wp8').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp9').waypoint(function () {
        $('.wp9').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });

    /***************** Initiate Flexslider ******************/
    $('.flexslider').flexslider({
        animation: "slide"
    });

    /***************** Initiate Fancybox ******************/

    $('.single_image').fancybox({
        padding: 4
    });

    $('.fancybox').fancybox({
        padding: 4,
        width: 1000,
        height: 800
    });

    /***************** Tooltips ******************/
    $('[data-toggle="tooltip"]').tooltip();

    /***************** Nav Transformicon ******************/

    /* When user clicks the Icon */
    $('.nav-toggle').click(function () {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function () {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');

    });

    /***************** Header BG Scroll ******************/

    $(function () {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();

            if (scroll >= 20) {
                $('section.navigation').addClass('fixed');
                $('header').css({
                    "border-bottom": "none",
                    "padding": "35px 0"
                });
                $('header .member-actions').css({
                    "top": "26px",
                });
                $('header .navicon').css({
                    "top": "34px",
                });
            } else {
                $('section.navigation').removeClass('fixed');
                $('header').css({
                    "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                    "padding": "50px 0"
                });
                $('header .member-actions').css({
                    "top": "41px",
                });
                $('header .navicon').css({
                    "top": "48px",
                });
            }
        });
    });
    /***************** Smooth Scrolling ******************/

    $(function () {

        $('a[href*=#]:not([href=#])').click(function () {
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 90
                    }, 2000);
                    return false;
                }
            }
        });

    });

    /********************** Social Share buttons ***********************/
    var share_bar = document.getElementsByClassName('share-bar');
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/platform.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);

    for (var i = 0; i < share_bar.length; i++) {
        var html = '<iframe allowtransparency="true" frameborder="0" scrolling="no"' +
            'src="https://platform.twitter.com/widgets/tweet_button.html?url=' + encodeURIComponent(window.location) + '&amp;text=' + encodeURIComponent(document.title) + '&amp;via=ramswarooppatra&amp;hashtags=ramandantara&amp;count=horizontal"' +
            'style="width:105px; height:21px;">' +
            '</iframe>' +

            '<iframe src="//www.facebook.com/plugins/like.php?href=' + encodeURIComponent(window.location) + '&amp;width&amp;layout=button_count&amp;action=like&amp;show_faces=false&amp;share=true&amp;height=21&amp;appId=101094500229731&amp;width=150" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:150px; height:21px;" allowTransparency="true"></iframe>' +

            '<div class="g-plusone" data-size="medium"></div>';

        // '<iframe src="https://plusone.google.com/_/+1/fastbutton?bsv&amp;size=medium&amp;url=' + encodeURIComponent(window.location) + '" allowtransparency="true" frameborder="0" scrolling="no" title="+1" style="width:105px; height:21px;"></iframe>';

        share_bar[i].innerHTML = html;
        share_bar[i].style.display = 'inline-block';
    }

    /********************** Embed youtube video *********************/
    $('.player').YTPlayer();


    /********************** Toggle Map Content **********************/
    $('#btn-show-map').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });
    $('#btn-show-content').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });

    /********************** Add to Calendar **********************/
    var myCalendar = createCalendar({
        options: {
            class: '',
            // You can pass an ID. If you don't, one will be generated for you
            id: ''
        },
        data: {
            // Event title
            title: "Casamento Sara e Alan",

            // Event start date
            start: new Date('2021-11-28T19:30:00Z'),

            // Event duration (IN MINUTES)
            // duration: 120,

            // You can also choose to set an end time
            // If an end time is set, this will take precedence over duration
            end: new Date('2021-11-28T03:00:00Z'),

            // Event Address
            address: 'Chácara dos Amadinhos, Araçoiaba da Serra',

            // Event Description
            description: "Nós te esperamos para comemorar este grande dia conosco! Quaisquer dúvidas, por favor entre em contato pelo (15)98812-6736."
        }
    });

    $('#add-to-cal').html(myCalendar);


    /********************** RSVP **********************/
    $('#rsvp-form').on('submit', function (e) {
        e.preventDefault();
        var data = $(this).serialize();

        $('#alert-wrapper').html(alert_markup('info', '<strong>Aguarde um instante!</strong> Nós estamos salvando as suas informações.'));

        if (MD5($('#invite_code').val()) !== '664dfc780c0218b93e9726502c1bf446') {
            $('#alert-wrapper').html(alert_markup('danger', '<strong>Desculpe!</strong> O seu código do convite está inválido.'));
        } else {
            $.post('https://script.google.com/macros/s/AKfycbwWrEALCN1p3OjHd_9OjBBA4P2e8ixk5JON9ZAtPAVvIfR1Lt75LSUCGRxWkK_qJr3l/exec', data)
                .done(function (data) {
                    if (data.result === "error") {
                        $('#alert-wrapper').html(alert_markup('danger', data.message));
                    } else {
                        $('#alert-wrapper').html('');
                        $('#rsvp-modal').modal('show');
                    }
                })
                .fail(function (data) {
                    console.log(data);
                    $('#alert-wrapper').html(alert_markup('danger', '<strong>Desculpe!</strong> Houve algum problema com o nosso servidor. '));
                });
        }
    });

});

/********************** Extras **********************/

// Google map
function initMap() {
    var location = { lat: -23.573686, lng: -47.708942 };
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 15,
        center: location,
        scrollwheel: false
    });

    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
}

// function initBBSRMap() {
//     var la_fiesta = {lat: 20.305826, lng: 85.85480189999998};
//     var map = new google.maps.Map(document.getElementById('map-canvas'), {
//         zoom: 15,
//         center: la_fiesta,
//         scrollwheel: false
//     });

//     var marker = new google.maps.Marker({
//         position: la_fiesta,
//         map: map
//     });
// }

// alert_markup
function alert_markup(alert_type, msg) {
    return '<div class="alert alert-' + alert_type + '" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span>&times;</span></button></div>';
}

// MD5 Encoding
var MD5 = function (string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
        return (x ^ y ^ z);
    }

    function I(x, y, z) {
        return (y ^ (x | (~z)));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
};