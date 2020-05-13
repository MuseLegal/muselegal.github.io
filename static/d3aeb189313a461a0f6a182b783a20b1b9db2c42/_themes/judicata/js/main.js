jQuery(document).ready(function($) {
  var $accessForm = $('#form-access');
  if ($accessForm.length !== 0) {
    $accessForm.parsley();
  }

  // performance.now() isn't supported in IE9
  window.sectionBefore = Date.now();
  // when the button is clicked, clone the state
  $('#AddAttr').click(function(e) {
    e.preventDefault();

    // When adding a field we want to validate, we have to
    // reinitialize parsley.
    // http://stackoverflow.com/a/21885466/6481585
    $('#form-access').parsley().destroy();

    var newRow = $('#stateSelector li').first().clone(true).removeAttr('id');
    newRow.find('.select-wrap').val($("#TemplateRow").find('#BoxVal').val());
    newRow.find('*').andSelf().removeAttr('id');
    $('#stateSelector li:last').before(newRow);

    $('#form-access').parsley();
    return false;
  });

  // Reflect errors.
  if (typeof(window.j) !== "undefined" && window.j.errors) {
    for (var n in window.j.errors) {
      $('[name="' + n + '"]').parsley().addError(
        "custom-error-message", {message: "* " + window.j.errors[n]});
    }
  }

  var $inputs = $("input, textarea");
  if ($inputs.length !== 0) {
    $inputs.placeholder();
  }

  // The rest is just for the home page
  if (document.getElementById("startslider") === null) {
      return;
  }

  // Check the window size on load so we know what breakpoint we're looking at.
  checkWindowSize();

  // Monitor the user resizing the window so we can re-init the sliders if the breakpoint changes.
  $(window).resize(function() {
    checkWindowSize();
  });

  //smooth scroll to second section
  $('.cd-scroll-down').on('click', function(event) {
    event.preventDefault();
    $.scrollify.next();
  });

});

// set a couple of variables to declare height/width of viewport
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
if (w < 768) {
  waypoints();
  // because; responsive dev http://stackoverflow.com/questions/24944925/background-image-jumps-when-address-bar-hides-ios-android-mobile-chrome
  var bg = jQuery(".section--home, .section--problem, .section--solution, .section--about");
  jQuery(window).resize("resizeBackground");

  function resizeBackground() {
    bg.height(jQuery(window).height());
  }
  setTimeout(resizeBackground, 500);
}

// Milliseconds to wait before playing the first video.
var LONG_VIDEO_DELAY = 2500;
var videoDelay = LONG_VIDEO_DELAY;

if (w >= 768) {
  if (document.getElementById("section1") != null) {
    $.scrollify({
      section: ".section",
      scrollSpeed: 900,
      scrollbars: false,
      updateHash: false,
      before: function(i, panels) {
        var ref = panels[i].attr("data-section-name");

        $(".jdpager .active").removeClass("active");

        $(".jdpager").find("a[href=#" + ref + "]").addClass("active");

        // Start at the first page every time we scroll to the panel
        // with the slider.
        if (typeof(sliderTarget) !== "undefined" &&
            panels[i].find("#feature-slider").length !== 0) {
          videoDelay = LONG_VIDEO_DELAY;  // Reset the delay
          sliderTarget.gotoPage(1);
        }
      },
      after: function(i, panels) {
        var label = panels[i].attr("data-section-name");
        ga('send', 'event', 'Scroll Section', 'Element', label, 1);
        ga('send', 'timing', 'Scroll Section', 'Element', Date.now() - window.sectionBefore, label);
        window.sectionBefore = Date.now();
      },
      afterRender: function() {
        var pagination = "<ul class=\"jdpager\">";

        $(".section").each(function(i) {
          pagination += "<li><a href=\"#" + $(this).attr("data-section-name") + "\"><span class=\"hover-text\">" + $(this).attr("data-section-name").charAt(0).toUpperCase() + $(this).attr("data-section-name").slice(1) + "</span></a></li>";
        });

        pagination += "</ul>";

        $("#navbar-fixed-top").after(pagination);

        $(".jdpager a").on("click", function(e) {
          e.preventDefault();
          $.scrollify.move($(this).attr("href"));
        });
        $(".jdpager a").first().addClass("active");
      }
    });
    // Prevent the browser from scrolling if the user goes to another
    // page and then clicks the back button.
    // http://stackoverflow.com/a/18633915/6481585
    $(window).on('unload', function() {
      $(window).scrollTop(0);
    });
  }
}

var $slider = $('.slider');
if ($slider.length !== 0) {
  $slider.slick({
    autoplay: false,
    dots: true,
    arrows: false,
    autoplaySpeed: 5000,
  });

  // After small/mobile slider change send GA event
  $slider.on('afterChange', function(event, slick, currentSlide, nextSlide){
    ga('send', 'event', 'Video Slider', 'static-view', $(slick.$slides.get(currentSlide)).find('h2').text(), 1);
  });

  // Check the current window size and determine what breakpoint we're at.
  var currentBreakpoint = 0;

  function checkWindowSize() {
    var winWidth = $(window).width();

    var newBreakpoint = currentBreakpoint;
    if (winWidth < 768) newBreakpoint = 1;
    else if (winWidth < 900) newBreakpoint = 768;
    else if (winWidth < 1024) newBreakpoint = 1170;
    else newBreakpoint = 9999;

    if (newBreakpoint != currentBreakpoint) {
      if (newBreakpoint == 9999) {
        startSlider();
      }

      currentBreakpoint = newBreakpoint;
    }

    if (currentBreakpoint === 0) {
      currentBreakpoint = newBreakpoint;
    }
  }

  var sliderTarget;

  function startSlider() {
    var waypoint = new Waypoint({
      element: document.getElementById('startslider'),
      handler: function(direction) {
        var playvid = function(slider) {
          var vid = slider.$currentPage.find('video');
          if (vid.length) {
            // autoplay.  "Play" the video at 0 playback rate so that
            // it's effectively paused but isVideoPlaying returns true.
            vid[0].playbackRate = 0;
            // IE sets playbackRate to defaultPlaybackRate when
            // `play()` is called, so set defaultPlaybackRate to 0,
            // also.
            // https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/WebAudio_playbackRate_explained#Notes
            vid[0].defaultPlaybackRate = 0;
            vid[0].play();

            // Speed up the video after a delay.
            setTimeout(function() { vid[0].playbackRate = 1.2; }, videoDelay);
            videoDelay = 250;  // Shorten the delay after the first video.
          }
        };
        $('#feature-slider')
          .anythingSlider({
            animationTime: 0,
            resumeDelay: 0,
            delay: 1500,
            delayBeforeAnimate: 0,
            appendControlsTo: $('.anythingWindow'),
            hashTags: false,
            autoPlay: true,
            buildStartStop: false,
            buildArrows: false,
            pauseOnHover: false,
            autoPlayLocked: true,
            // Autoplay video in initial panel, if one exists
            onInitialized: function(e, slider) {
              sliderTarget = slider;
              playvid(sliderTarget);

              // If the window is smaller, hide this slider and we'll use CSS to display the mobile versions.
              if ($(window).width() < 1170) $('#feature-slider').hide();
            },
            // stop video when out of view
            onSlideInit: function(e, slider) {
              var vid = slider.$lastPage.find('video');
              if (vid.length && typeof(vid[0].load) !== 'undefined') {
                vid[0].load();
              }
            },
            // play video
            onSlideComplete: function(slider) {
              ga('send', 'event', 'Video Slider', 'watch', slider.$currentPage.find('h2').text(), 1);
              playvid(slider);
            },
            // pause slideshow if video is playing
            isVideoPlaying: function(slider) {
              var vid = slider.$currentPage.find('video');
              return (vid.length && typeof(vid[0].load) !== 'undefined' && !vid[0].paused && !vid[0].ended);
            },
            navigationFormatter: function(i, panel) {
              return {
                'class': 'pager-item',
                'html': '<a href="#" title="' + panel.find('h2').text() + '"><span class="icon icon' + i + '"></span></a><div class="feature-name">' + panel.find('h2').text() + '</div>'
              };
            }

          })
          .anythingSliderFx({}, { dataAnimate: 'data-animate' });
      },
      offset: 69
    });
  }
}

function waypoints() {
  var waypoint = new Waypoint({
    element: document.getElementById('section2'),
    handler: function(direction) {
      if (direction === 'down') {
        $('#header__requestAccess').addClass('js--show');
        $('#header__login').addClass('js--hide');
      } else {
        $('#header__requestAccess').removeClass('js--show');
        $('#header__login').removeClass('js--hide');
      }
    },
    offset: 69
  });
}
