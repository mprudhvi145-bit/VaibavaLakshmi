import NotificationService from "../services/notification";

class OrderWorkflowSubscriber {
  private notificationService: NotificationService;
  private orderService: any;

  constructor({ eventBusService, notificationService, orderService }) {
    this.notificationService = notificationService;
    this.orderService = orderService;

    eventBusService.subscribe("order.placed", this.handleOrderPlaced);
    eventBusService.subscribe("order.shipment_created", this.handleOrderShipped);
    eventBusService.subscribe("order.canceled", this.handleOrderCanceled);
  }

  handleOrderPlaced = async (data) => {
    const order = await this.orderService.retrieve(data.id);
    await this.notificationService.sendWhatsApp(
      order.shipping_address.phone, 
      "order_confirmed", 
      [order.display_id.toString(), (order.total / 100).toString()]
    );
  };

  handleOrderShipped = async (data) => {
    const order = await this.orderService.retrieve(data.id, { relations: ["fulfillments"] });
    const tracking = order.fulfillments[0]?.tracking_numbers[0] || "Pending";
    
    await this.notificationService.sendWhatsApp(
      order.shipping_address.phone, 
      "order_shipped", 
      [order.display_id.toString(), tracking]
    );
  };
  
  handleOrderCanceled = async (data) => {
     // Handle restock logic if custom needed
     console.log(`Order ${data.id} canceled`);
  };
}

export default OrderWorkflowSubscriber;