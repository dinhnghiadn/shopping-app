function renderOrder(e) {
    var order = JSON.parse(document.getElementById('order').value)
    console.log(order)
    document.getElementById('order-id').value = order.id
    document.getElementById('order-paymentMethod').value = order.paymentMethod
    document.getElementById('order-totalAmount').value = order.totalAmount
    document.getElementById('order-status').value = order.status
    document.getElementById('order-orderDate').value = new Date(
        order.orderDate
    ).toLocaleString()
    if (order.paymentDate) {
        document.getElementById('order-paymentDate').value =
            order.paymentDate.toLocaleString()
    }
    if (order.completedDate) {
        document.getElementById('order-completedDate').value =
            order.completedDate.toLocaleString()
    }
    document.getElementById('order-paymentStatus').value = order.paymentStatus
}
