if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.srcObject = stream;
        video.play();
    });
}

if ('WebSocket' in window){
    console.log('WebSocket is supported');
}
var socket = io();
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var video = document.getElementById('video');
var detect_image = document.getElementById("detect_image");

socket.on('object_detection_event', function(msg){    
    console.log('got object_detection_event');
    detect_image.src = 'data:image/png;base64,' + msg;
});

document.getElementById("snap").addEventListener("click", function() {
    context.drawImage(video, 0, 0, 640, 480);    
    var data = canvas.toDataURL();    
    var base64 = data.replace(/^data:image\/(png|jpg);base64,/, "");
    socket.emit('capture_event', base64);
});

socket.on('connect', function() {
    console.log('I connect successfully');
});

socket.on('new_item_event', function(msg){    
    console.log('got new_item_event');
    var itemlist = JSON.parse(msg['data']);
    console.log(itemlist);
    add_item(itemlist);
});

socket.on('detected_objects', function(msg){    
    console.log('got detected_objects');
    var itemlist = JSON.parse(msg['objs']);
    console.log(itemlist);
    add_item(itemlist);
});

update_amount();

$(document).on('click', ".delete-me", function() {
    $(this).closest('tr').remove();
    update_amount();
});

$("#add").on('click', function() {
    socket.emit('new_item_event', '');
    update_amount();
});

$("#getall").on('click', function() {
    socket.emit('get_allitem_event', '');
});

$(document).on('click', ".add-me", function() {
    var qtyInput = $(this).closest('tr').find('.item-quantity');
    qtyInput.val(parseInt(qtyInput.val()) + 1);
    update_amount();
});

$(document).on('click', ".decrease-qty", function() {
    var qtyInput = $(this).closest('tr').find('.item-quantity');
    var currentQty = parseInt(qtyInput.val());
    if (currentQty > 1) {
        qtyInput.val(currentQty - 1);
    } else if (currentQty == 1) {
        $(this).closest('tr').remove();
    }
    update_amount();
});

$("#checkout").on('click', function() {
    var items = [];
    $('#item-table tbody tr').each(function() {
        var productId = $(this).find("td:eq(0) a").text().trim();
        var name = $(this).find("td:eq(1)").text().trim();
        var quantity = parseInt($(this).find('.item-quantity').val().trim(), 10);
        var price = parseFloat($(this).find("td:eq(3)").text().trim());
        
        items.push({
            productId: productId,
            name: name,
            quantity: quantity,
            price: price
        });
    });
    console.log(items);
    socket.emit('checkout_event', {items: items});
});

socket.on('order_saved', function(msg) {
    console.log('接收到order_saved事件');
    console.log(msg.status);
    var orderStatus = document.getElementById('order-status');
    orderStatus.textContent = msg.status;
    orderStatus.style.display = 'block';
});

function add_item(itemlist) {
    for (var i in itemlist) {
        var item = itemlist[i];
        var row = `<tr>
            <td><a href='#'>${item['p_id']}</a></td>
            <td>${item['p_name']}</td>
            <td><input type='number' class='item-quantity form-control' value='1' min='1' style='width: 80px;'></td>
            <td>${item['p_price']}</td>
            <td>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary add-me">+</button>
                    <button type="button" class="btn btn-outline-secondary decrease-qty">-</button>
                    <button type="button" class="btn btn-outline-danger delete-me">Del</button>
                </div>
            </td>
        </tr>`;
        $("#item-table tbody").append(row);
    }
    update_amount();
}

function update_amount() {
    var total = 0;
    $('#item-table tbody tr').each(function() {
        var price = parseFloat($(this).find("td:eq(3)").text());
        var quantity = parseInt($(this).find('.item-quantity').val());
        if (!isNaN(price) && !isNaN(quantity)) {
            total += price * quantity;
        }
    });
    $("#amount").text(total);
}
