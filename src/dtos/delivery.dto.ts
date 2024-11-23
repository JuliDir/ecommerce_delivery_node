import { Tracking } from "@models/entities/tracking";
import { Status } from "./enum/status.enum";

export interface DeliveryDTO {
    deliveryId: string;
    trackingNumber: string;
    trackingDetails: Tracking[];
}

export interface UpdateDelivery {
    status: Status;    
    updated_at: Date;
}