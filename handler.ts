"use strict";
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
import {
  SQSEvent,
  SQSBatchResponse,
  SQSBatchItemFailure,
  SQSRecord,
} from "aws-lambda";

import { config } from "./config";

export const sendMessage = async (event: SQSEvent) => {
  try {
    const client = new SQSClient({
      region: "eu-central-1",
    });

    for (let i = 0; i < 100; i++) {
      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: config.queueUrl,
        MessageBody: JSON.stringify({ id: i, message: `Message ${i}` }),
      });

      await client.send(sendMessageCommand);
    }

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: config.queueUrl,
      MessageBody: JSON.stringify({ id: 1, error: `Message error` }),
    });

    await client.send(sendMessageCommand);
    console.log("Message sent");
  } catch (error) {
    console.error("Error sending messages:", error);
  }
};

export const receiveMessage = async (
  event: SQSEvent
): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processMessageAsync(record);
    } catch (error) {
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures: batchItemFailures };
};

async function processMessageAsync(record: SQSRecord): Promise<void> {
  const parsedRecord = JSON.parse(record.body);
  if (parsedRecord.hasOwnProperty("error")) {
    throw new Error("There is an error in the SQS Message.");
  }
  console.log(`Processed message ${record.body}`);
}
