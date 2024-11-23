import { TypeDiscount } from '@dtos/enum/status.enum';

export interface ValidateDiscount {
  discount_type: TypeDiscount;
  discount_value: number;
}
export const validateDiscount = (discount: ValidateDiscount): ValidateDiscount => {
  return {
    discount_type: discount.discount_type,
    discount_value:
      discount.discount_type === TypeDiscount.PERCENTAGE && discount.discount_value > 100
        ? 100
        : discount.discount_value,
  };
};
