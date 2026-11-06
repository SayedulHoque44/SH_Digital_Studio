// MongoDB duplicate key error (code 11000) -> human readable message.
// Prefer the structured keyValue (e.g. { slug: "aurum" }); fall back to the
// quoted value inside the driver message for older driver versions.
export const handleDupliacteError = (err: any) => {
  const field = err?.keyValue ? Object.keys(err.keyValue)[0] : undefined;
  if (field) {
    return `This ${field} is already in use. Please choose another one.`;
  }

  const match = String(err?.message || "").match(/"([^"]*)"/);
  const extractMessage = match && match[1];
  return `${extractMessage || "Value"} is already taken!`;
};
