export const failureTemplate = ({ webhookUrl, eventType }) => {
  return `
    <h2> Webhook Delivery Failed</h2>
    <p><strong>Event:</strong> ${eventType}</p>
    <p><strong>Webhook URL:</strong> ${webhookUrl}</p>
    <p>Retries have been exhausted. Please check your endpoint.</p>
  `;
};