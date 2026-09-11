// lib/checkout/queries.ts

export type PaymentGateway = {
  id: string;
  title: string | null;
  description: string | null;
};

export type ShippingRate = {
  id: string;
  label: string | null;
  cost: string | null;
};

export type CountryState = { code: string; name: string };

export type CheckoutOptions = {
  gateways: PaymentGateway[];
  states: CountryState[];
  rates: ShippingRate[];
  cartIsEmpty: boolean;
  cartTotal: string | null;
  needsShippingAddress: boolean;
};

export type CheckoutOptionsResponse = {
  paymentGateways: { nodes: PaymentGateway[] } | null;
  countryStates: CountryState[] | null;
  cart: {
    isEmpty: boolean | null;
    total: string | null;
    needsShippingAddress: boolean | null;
    availableShippingMethods: { rates: ShippingRate[] | null }[] | null;
  } | null;
};

export type PlacedOrder = {
  databaseId: number;
  orderNumber: string | null;
  status: string | null;
  total: string | null;
  paymentMethodTitle: string | null;
};

export type CheckoutResponse = {
  checkout: {
    result: string | null;
    redirect: string | null;
    order: PlacedOrder | null;
  } | null;
};

export const CHECKOUT_OPTIONS_QUERY = /* GraphQL */ `
  query CheckoutOptions($country: CountriesEnum!) {
    paymentGateways {
      nodes {
        id
        title
        description
      }
    }
    countryStates(country: $country) {
      code
      name
    }
    cart {
      isEmpty
      total
      needsShippingAddress
      availableShippingMethods {
        rates {
          id
          label
          cost
        }
      }
    }
  }
`;

export const CHECKOUT_MUTATION = /* GraphQL */ `
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      result
      redirect
      order {
        databaseId
        orderNumber
        status
        total
        paymentMethodTitle
      }
    }
  }
`;

export type ShippingRatesResponse = {
  cart: {
    needsShippingAddress: boolean | null;
    availableShippingMethods: { rates: ShippingRate[] | null }[] | null;
  } | null;
};

/** Menyimpan alamat pembeli ke sesi supaya ongkir dihitung untuk tujuan itu. */
export const UPDATE_CUSTOMER_MUTATION = /* GraphQL */ `
  mutation UpdateCustomerAddress($address: CustomerAddressInput) {
    updateCustomer(input: { billing: $address, shipping: $address }) {
      customer {
        billing {
          country
          state
        }
      }
    }
  }
`;

export const SHIPPING_RATES_QUERY = /* GraphQL */ `
  query ShippingRates {
    cart {
      needsShippingAddress
      availableShippingMethods {
        rates {
          id
          label
          cost
        }
      }
    }
  }
`;

export const UPDATE_SHIPPING_METHOD_MUTATION = /* GraphQL */ `
  mutation UpdateShippingMethod($methods: [String]) {
    updateShippingMethod(input: { shippingMethods: $methods }) {
      cart {
        chosenShippingMethods
        shippingTotal
        total
      }
    }
  }
`;
