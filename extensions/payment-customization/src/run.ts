import type {
  RunInput,
  FunctionRunResult,
} from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

type Configuration = {
  countryCode: string,
  paymentMethod: string,
};

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(
    input?.paymentCustomization?.metafield?.value ?? "{}"
  );

  console.log("🛠 Configured Country:", configuration.countryCode);
  console.log("🛠 Current Country:", input.localization.country.isoCode);

  if(configuration.countryCode !== input.localization.country.isoCode){

    console.log("✅ Country Matched!");

    console.log("🛠 Available Payment Methods:", JSON.stringify(input.paymentMethods, null, 2));
    // console.log("🛠 Configured Payment Method:", configuration.paymentMethod);

    const mondidoMethod = input.paymentMethods.find((method) =>
      method.name.includes("Mondido Payment Staging")
    );

    if (mondidoMethod) {
      console.log("🛠 Mondido Payment Method Details:", JSON.stringify(mondidoMethod));
    }

    const paymentMethodId = input.paymentMethods.find(
    (method) => method.name.includes(configuration.paymentMethod)
      )?.id;

    console.log("🛠 Found Payment Method:", paymentMethodId);

    if (paymentMethodId){
      return {
        operations: [
          {
            hide: {
              paymentMethodId,
            }
          },
        ],
      };
    }
  }

  console.log("⚠️ No changes applied.");

  return NO_CHANGES;
};