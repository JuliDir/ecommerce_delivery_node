import { Tracking } from "@models/entities/tracking";
import { Status } from "./enum/status.enum";

export interface DeliveryDTO {
    delivery_id: string;
    tracking_number: string;
    tracking_details: Tracking[];
}

export interface UpdateDelivery {
    status: Status;    
    updated_at: Date;
}