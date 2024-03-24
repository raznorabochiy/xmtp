import cli from "cli";
import { Wallet } from "ethers";
import sample from "lodash/sample";
import { Client } from "@xmtp/xmtp-js";
import { MESSAGES_FILENAME, RECIPIENTS_FILENAME } from "./constants";
import { loadFromFile } from "./utils";

const messages = await loadFromFile(MESSAGES_FILENAME);
const recipients = await loadFromFile(RECIPIENTS_FILENAME);

export async function activateAccount(key: string) {
  const wallet = new Wallet(key);
  const { address } = wallet;

  cli.spinner(`Активирую адрес ${address}`);

  const isActivated = await Client.canMessage(address, { env: "production" });

  if (isActivated) {
    cli.spinner(`Адрес ${address} был активирован ранее`, true);
    return;
  }

  await Client.create(wallet, { env: "production" });
  cli.spinner(`Адрес ${address} активирован`, true);
}

export async function sendMessage(key: string) {
  const wallet = new Wallet(key);
  const { address } = wallet;

  console.log(`Адрес: ${address}`);

  const recipient = sample(recipients.filter((item) => item !== address));

  if (!recipient) {
    console.log("Нет подходящего получателя");
    return;
  }

  const message = sample(messages);

  if (!message) {
    console.log("Нет подходящего сообщения");
    return;
  }

  const xmtp = await Client.create(wallet, { env: "production" });
  const conversation = await xmtp.conversations.newConversation(recipient);

  cli.spinner("Отправляю сообщение");
  await conversation.send(message);
  cli.spinner(`Отправлено сообщение ${message} -> ${recipient}`, true);
}
