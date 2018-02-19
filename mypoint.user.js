// ==UserScript==
// @name        Chronos - MyPoint
// @namespace   https://github.com/rtpaulino/chronosx
// @version     0.6
// @description Exibe o horário do ponto de batida da saída para completar as 8:00 de trabalho diário
// @author      Rafael Paulino <rafael_paulino@atlantico.com.br>
// @include     http://10.101.40.105/Pages/MyPoint
// @supportURL  https://github.com/rtpaulino/chronosx/issues
// @downloadURL https://raw.githubusercontent.com/rtpaulino/chronosx/master/mypoint.user.js
// @require     http://underscorejs.org/underscore-min.js
// @require     https://raw.githubusercontent.com/epeli/underscore.string/master/dist/underscore.string.min.js
// @grant       none
// ==/UserScript==

var makeString = function(object) {
    if (object == null || typeof object === 'undefined') return '';
    return '' + object;
};

var getCurrentDate = function() {
  var d = new Date();
  var day = d.getDate();
  var mon = d.getMonth()+1;
  return s.lpad(makeString(day), 2, "0") + "/" + s.lpad(makeString(mon), 2, "0");
};

var toMin = function(hora) {
  var q = hora.match(/(\d{2}):(\d{2})/);
  var h = parseInt(q[1]);
  var m = parseInt(q[2]);

  return h*60+m;
};

var incrMin = function(hora, mins) {
  mins = mins || 1;
  var q = hora.match(/(\d{2}):(\d{2})/);
  var h = parseInt(q[1]);
  var m = parseInt(q[2]);

  m = m + mins;

  h = (h + Math.floor(m / 60)) % 24;
  m = m % 60;

  return s.lpad(makeString(h), 2, "0") + ":" + s.lpad(makeString(m), 2, "0");
};

var incrHora = function(hora, i) {
  i = i || 1;
  return incrMin(hora, i*60);
};

var diff = function(hora1, hora2) {
  var m1 = toMin(hora1);
  var m2 = toMin(hora2);
  return m2 - m1;
};

var horaAtual = function() {
  var d = new Date();
  return s.lpad(makeString(d.getHours()), 2, "0") + ":" + s.lpad(makeString(d.getMinutes()), 2, "0");
};

$(function() {
   setInterval(function () {
       var date = getCurrentDate();
       var tabela = $(".semana");
       var trs = tabela.find("tr");
       var colIndex = $(".semana").find("th:contains('"+date+"')").index();

       var horaEntrada1 = trs.eq(2).find("td").eq(colIndex).text();
       var horaSaida1   = trs.eq(3).find("td").eq(colIndex).text();
       var horaEntrada2 = trs.eq(4).find("td").eq(colIndex).text();
       var horaSaida2   = trs.eq(5).find("td").eq(colIndex).text();

       if (!s.isBlank(horaEntrada1) && !s.isBlank(horaSaida1)) {
           if (s.isBlank(horaEntrada2)) {
               var td = trs.eq(4).find("td").eq(colIndex);
               td.html("<i style='color:#999'>"+incrHora(horaEntrada2)+"</i>");
           } else {
               var td = trs.eq(5).find("td").eq(colIndex);

               var horaFinal = incrMin(horaEntrada2, 8 * 60 - diff(horaEntrada1, horaSaida1));

               if (td.text() === '') {
                   td.html("<b style='color:blue'>" + horaFinal + "</b>");
               } else {
                   var faltam = diff(horaSaida1, horaEntrada1) + diff(horaSaida2, horaEntrada2);
                   if (faltam > 0) {
                       td.css('color', 'red').css('font-weight', 'bold');
                   } else {
                       td.css('color', 'green').css('font-weight', 'bold');
                   }
               }
           }
       }
   }, 1000);

    var iframe = $("<iframe></iframe>").attr('src', 'http://10.101.40.105/Pages/Home');
    iframe.css('position', 'fixed');
    iframe.css('right', '5px');
    iframe.css('top', '5px');
    iframe.css('width', '120px');
    iframe.css('height', '78px');
    iframe.css('border', '1px solid #DDDDDD');
    iframe.css('z-index', '10000');
    iframe.appendTo($("body"));
    iframe.on('load', function () {
        if (!s.endsWith(this.contentWindow.location.href, 'Home')) {
            window.location.reload();
        } else {
            $("header, footer", iframe.contents()).remove();
            $(".widgets li:not(:first)", iframe.contents()).remove();
            $(".widgets", iframe.contents()).removeClass('widgets').removeClass('sortable').css('padding', '0');
            $('#interface', iframe.contents()).css('padding-top', '0');
            $("#pageContent", iframe.contents()).css('padding', '0');
            $("input[type=submit]", iframe.contents()).removeClass('big').css('margin-top', '0');
            $("li[draggable] div", iframe.contents()).css('text-align', 'center');
            $("li[draggable] div span", iframe.contents()).css('font-size', '35px');
        }
    });

});
