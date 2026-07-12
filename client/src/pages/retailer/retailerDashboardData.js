const buildRetailerFallbackData = () => ({
  orders: [
    {
      _id: "fallback-order-1",
      orderNumber: "ORD-FALLBACK-001",
      purchaseOrderNumber: "PO-1001",
      status: "Confirmed",
      totalAmount: 1250,
      createdAt: new Date().toISOString(),
      items: [{ name: "Paracetamol 500mg", quantity: 20 }],
    },
  ],
  shipments: [
    {
      _id: "fallback-shipment-1",
      trackingNumber: "SHP-FALLBACK-001",
      status: "Shipped",
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: 1250,
      bleId: "BLE123456",
      currentCheckpoint: "dispatched",
      currentResponsibleOrganization: "warehouse",
      delayDurationMinutes: 0,
      timeline: [
        {
          checkpoint: "created",
          status: "created",
          organization: "warehouse",
          timestamp: new Date().toISOString(),
        },
        {
          checkpoint: "dispatched",
          status: "in_transit",
          organization: "warehouse",
          timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      ],
      items: [{ drug: { name: "Paracetamol 500mg" }, quantity: 20 }],
      order: { orderNumber: "ORD-FALLBACK-001" },
      supplier: { name: "Northwind Pharma", contactPerson: "Asha Rao", email: "asha@northwind.example", phone: "+91-9876543210" },
      destination: {
        address: "7th Floor, Retail Hub",
        city: "Mumbai",
        state: "MH",
        country: "India",
        zipCode: "400001",
      },
    },
  ],
});

const shouldSeedRetailerFallbackData = (orders = [], shipments = [], token = "") => {
  const hasRealOrders = Array.isArray(orders) && orders.length > 0;
  const hasRealShipments = Array.isArray(shipments) && shipments.length > 0;

  return {
    shouldSeed: !token ? false : !hasRealOrders && !hasRealShipments,
    orders: Array.isArray(orders) ? orders : [],
    shipments: Array.isArray(shipments) ? shipments : [],
  };
};

export { buildRetailerFallbackData, shouldSeedRetailerFallbackData };
