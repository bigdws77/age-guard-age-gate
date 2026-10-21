// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function cartValidationsGenerateRun(input) {
  // Age verification is handled by the storefront Age Guard popup before the
  // customer can add an item to cart or use "Buy it now". The server-side cart
  // validation is kept as a no-op because dynamic checkout (Buy it now, Shop Pay,
  // Apple Pay, etc.) creates a fresh checkout session that does not carry over
  // cart attributes set via /cart.js, which would cause false "Transaction failed"
  // errors for verified customers.
  return {
    operations: [
      {
        validationAdd: {
          errors: [],
        },
      },
    ],
  };
}
