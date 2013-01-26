var smoother = new Smoother(0.85, [0, 0, 0, 0, 0]);
  
$(window).load(function() {

  var read_from = $('p')[0];
  var not_paying_attention = 0;
  var attention_threshold = 5;

  $('p').mouseover(function(e){
    read_from = e.currentTarget;
  });

  function read(el){
    $('.reading').removeClass('reading');
    $(el).addClass('reading');
    speak($(el).text());
  }



  var video = $("#video").get(0);
  try {
    compatibility.getUserMedia({video: true}, function(stream) {
      try {
        video.src = compatibility.URL.createObjectURL(stream);
      } catch (error) {
        console.log(stream);
        video.src = stream;
      }
      video.play();
      compatibility.requestAnimationFrame(tick);
    }, function (error) {
      alert("WebRTC not available");
    });
  } catch (error) {
    alert(error);
  }
  
  function tick() {
    compatibility.requestAnimationFrame(tick);
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      $(video).objectdetect("all", {scaleMin: 3, scaleFactor: 1.1, classifier: objectdetect.frontalface}, function(coords) {
        if (coords[0]) {
          coords = smoother.smooth(coords[0]);
          $("#face").css({
            "left":    ~~(coords[0] + coords[2] * 1.0/8 + $(video).offset().left) + "px",
            "top":     ~~(coords[1] + coords[3] * 0.8/8 + $(video).offset().top) + "px",
            "width":   ~~(coords[2] * 6/8) + "px",
            "height":  ~~(coords[3] * 6/8) + "px",
            "display": "block"
          });

          not_paying_attention--;
          console.log(not_paying_attention);
          if (not_paying_attention < attention_threshold){
            if (not_paying_attention < 0){
              not_paying_attention = 0;
            }
            speak("");
          }

        } else {
          $("#face").css("display", "none");

          not_paying_attention++;
          console.log(not_paying_attention);
          if (not_paying_attention > attention_threshold + 10){
            not_paying_attention--;
          }
          if (not_paying_attention == attention_threshold){
            read(read_from);
          }
        }
      });
    }
  }
  
  $("#list img").click(function () {
    $("#glasses").attr("src", $(this).attr("src"));
  });
});