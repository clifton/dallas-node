$(function () {
  var socket = io.connect();

  socket.on('connect', function () { console.log("connected") });

  socket.on('msg', display_msg);

  $('form#chat-form').submit(function () {
    var $this = $(this)
      , $input = $(this).find('input')
      , msg = $input.val();

    socket.emit('msg', msg);
    $input.val('');
    display_msg({username: 'me', msg: msg}).addClass('my_msg');
    return false;
  });

  function display_msg (data) {
    var $chat_room = $("#chat-room")
      , $username = $('<span />').html(data.username)
      , $chat_message = $('<p />').html($username).append(data.msg);

    $chat_room.prepend($chat_message);
    return $chat_message;
  }
});
