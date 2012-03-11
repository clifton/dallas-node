$(function () {
  var socket = io.connect()
    , username;

  socket.on('connect', function () { console.log("connected") });

  socket.on('msg', display_msg);

  socket.on('username', function (_username) { username = _username });

  $('form#chat-form').submit(function () {
    var $this = $(this)
      , $input = $(this).find('input')
      , msg = $input.val();

    socket.emit('msg', msg);
    $input.val('');
    display_msg({username: username || 'me', msg: msg}).addClass('my_msg');
    return false;
  });

  function display_msg (data, my_msg) {
    var msg_html = $('<p />')
        .html($('<span />').html(data.username))
        .append(data.msg);

    $('div#chat-room').prepend(msg_html);
    return msg_html;
  }
});
