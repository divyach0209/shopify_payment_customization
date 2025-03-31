import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Form,
  TextField,
  FormLayout,
  Select,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const paymentMethodId = formData.get("paymentMethodId");
  
  console.log("Hiding payment method:", paymentMethodId);

  const response = await admin.graphql(
    `mutation HidePaymentMethod($input: PaymentCustomizationInput!) {
      paymentCustomizationCreate(paymentCustomization: $input) {
        paymentCustomization {
          id
        }
        userErrors {
          message
        }
      }
    }`,
    {
      variables: {
        functionId: process.env.SHOPIFY_PAYMENT_CUSTOMIZATION_ID,
        title: `Hide Payment Method`,
        enabled: true,
        operations: [{
          hide: {
            paymentMethodId: paymentMethodId,
          },
        }],
      },
    }
  );

  const data = await response.json();
  console.log(data);
  return null;
};

export default function Index() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const submit = useSubmit();

  useEffect(() => {
    async function fetchPaymentMethods() {
      const response = await fetch("/shopify/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query GetPaymentMethods {
            cart {
              cost {
                totalAmount {
                  amount
                }
              }
            }
            paymentCustomization {
              paymentMethods {
                id
                name
              }
            }
          }`,
        }),
      });
      const result = await response.json();
      setPaymentMethods(result.data.paymentCustomization.paymentMethods);
    }

    fetchPaymentMethods();
  }, []);

  const handleHidePaymentMethod = () => {
    submit({ paymentMethodId: selectedPaymentMethod }, { method: "post" });
  };

  return (
    <Page title="Payment Method Customization">
      <Layout>
        <Layout.Section>
          <Card title="Hide Payment Method" sectioned>
            <Form>
              <FormLayout>
                <Select
                  label="Select Payment Method"
                  options={paymentMethods.map((method) => ({
                    label: method.name,
                    value: method.id,
                  }))}
                  onChange={setSelectedPaymentMethod}
                  value={selectedPaymentMethod}
                />
                <Button primary onClick={handleHidePaymentMethod} disabled={!selectedPaymentMethod}>
                  Hide Selected Payment Method
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
