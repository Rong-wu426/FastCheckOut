if ('WebSocket' in window){
    console.log('WebSocket is supported');
}
var socket = io();
socket.on('connect', function() {
    socket.emit('connect_event', {data: 'yes, I connect successfully'});
});

socket.on('server_response', function(msg) {
    $('#log').append('<div>Received #' + ': ' + $('<div/>').text(msg.data).html() + '</div>');
});

$('form#emit').submit(function(event) {
    socket.emit('client_event', {data: $('#emit_data').val()});
    return false;
});