## Microservicio de Delivery

## Modelo de datos

### Entidades

**Delivery**
- id: `string`
- status: `Status` 
- orderId: `number`
- shippingAddress: `string` 
- trackingNumber: `string`
- createdAt: `Date` 
- updatedAt: `Date` 

**Tracking**
- id: `string`
- deliveryId: `string` 
- status: `Status`
- location: { "latitude": `number`, "longitude": `number` }
- carrierId: `number`
- timestamp: `Date` 

### Enumeraciones

**Status**
- name: `string` (`IN_PREPARATION`, `IN_TRANSIT`, `NEAR_DESTIN`, `COMPLETED`, `FAILED`)

## API

### CU Iniciar entrega

**Interfaz asincronica (rabbit)** 

Recibe para crear la entrega en direct `order_request_queue`

*body*
```json
{
	"orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
}
```

*Response*  
Si la creacion del delivery fue exitosa responde en fanout `delivery_notification_queue`

```json
{
  "orderId": "123456",
  "status": "IN_PREPARATION",  
  "message": "Delivery started successfully"
}
```

Si la creacion del delivery no fue exitosa responde en fanout `delivery_notification_queue`

```json
{
  "orderId": "123456",
  "status": "FAILED",  
  "message": "Delivery failed"
}
```

### CU: Actualización de tracking de una entrega

**Interfaz REST**  
`POST /v1/trackings`

*Headers*  
Authorization: Bearer token

*Request*
 ```json
{
  "deliveryId": "123456",
  "location": { 
    "latitude": -32.889458, 
    "longitude": -68.845838 
  },
  "status": {
     "name": "IN_TRANSIT"
  }
}
```

*Response*  
`201 CREATED` si la actualización del tracking fue éxitosa.  
```json
{
  "id": "123456",
  "deliveryId": "123456", 
  "status": {
     "name": "IN_TRANSIT"
  },
  "carrierId": "123456", 
  "location": { 
    "latitude": -32.889458, 
    "longitude": -68.845838 
  }, 
  "timestamp": "2024-11-02 16:00:00.000"
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId

`400 BAD REQUEST` Si location es nulo 

`400 BAD REQUEST` Si se envía un status `IN_TRANSIT` y el último Tracking del delivery no se encuentra en estado `IN_PREPARATION` o `IN_TRANSIT`

`400 BAD REQUEST` Si se envía un status `NEAR_DESTIN` y el último Tracking del delivery no se encuentra en estado `IN_TRANSIT`

### CU: Completar entrega 

**Interfaz REST**  
`PUT /v1/deliveries/{deliveryId}/complete`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si la actualización del delivery fue éxitoso.  
```json
{
  "id": "123456",
  "orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
  "trackingNumber": "TN-123456",
  "status": {
     "name": "COMPLETED"
  },
  "createdAt": "2024-11-02 16:00:00.000",
  "updatedAt": "2024-12-02 16:00:00.000"
}
```

`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId

`400 NOT FOUND` si estado del delivery no se encuentra en `NEAR_DESTIN`

**Interfaz asincronica (rabbit)** 

Responde con la entrega del delivery en fanout `delivery_notification_queue`

*body*
```json
{
  "orderId": "123456",
  "status": "COMPLETED",  
  "message": "Delivery completed"
}
```

### CU: Entrega fallida 

**Interfaz REST**  
`PUT /v1/deliveries/{deliveryId}/failed`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si la actualización del delivery fue éxitoso.  
```json
{
  "id": "123456",
  "orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
  "trackingNumber": "TN-123456",
  "status": {
     "name": "FAILED"
  },
  "createdAt": "2024-11-02 16:00:00.000",
  "updatedAt": "2024-12-02 16:00:00.000"
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId

`400 BAD REQUEST` si el estado de la entrega se encuentra en `COMPLETED` o `FAILED`

**Interfaz asincronica (rabbit)** 

Responde con el fallo del delivery en fanout `delivery_notification_queue`
*body*
```json
{
  "orderId": "123456",
  "status": "FAILED",  
  "message": "Delivery failed"
}
```

### CU: Consultar Delivery

**Interfaz REST**  
`GET /v1/deliveries/{deliveryId | trackingNumber}`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si el Delivery fue encontrado exitosamente.
```json
{
  "id": "123456",
  "orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
  "trackingNumber": "TN-123456",
  "status": {
      "name": "IN_TRANSIT"
  },
  "createdAt": "2024-11-02 16:00:00.000",
  "updatedAt": "2024-12-02 16:00:00.000"
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId o trackingNumber

### CU: Consultar Tracking de un Delivery

**Interfaz REST**  
`GET /v1/trackings/{deliveryId}`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si el Delivery y su historial de Tracking fueron encontrados exitosamente.
```json
{
  "deliveryId": "123456",
  "trackingNumber": "TN-123456",
  "trackingDetails": [
    {
      "id": "1",
      "status": {
          "name": "IN_PREPARATION"
      },
      "location": { 
        "latitude": -32.889458, 
        "longitude": -68.845838 
      }, 
      "carrierId": null,
      "timestamp": "2024-11-02 16:00:00.000"
    },
    {
      "id": "2",
      "status": {
         "name": "IN_TRANSIT"
      },
      "location": { 
        "latitude": -32.889458, 
        "longitude": -68.845838 
      }, 
      "carrierId": "987654",
      "timestamp": "2024-11-03 10:30:00.000"
    }
  ]
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId o trackingNumber