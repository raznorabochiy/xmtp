import cli from "cli";
import inquirer from "inquirer";
import random from "lodash/random";
import shuffle from "lodash/shuffle";
import {
  DELAY_SEC,
  KEYS_FILENAME,
  MESSAGES_FILENAME,
  RECIPIENTS_FILENAME,
  SHUFFLE_KEYS,
} from "./constants";
import { delayProgress, loadFromFile } from "./utils";
import { activateAccount, sendMessage } from "./xmtp";

async function getModule() {
  const questions = [
    {
      name: "choice",
      type: "list",
      message: "Действие:",
      choices: [
        {
          name: `1. Активировать аккаунты из ${KEYS_FILENAME}`,
          value: activateAccount,
        },
        {
          name:
            `2. Отправить случайное сообщение из ${MESSAGES_FILENAME} на случайный адрес из ${RECIPIENTS_FILENAME}`,
          value: sendMessage,
        },
      ],
      loop: false,
    },
  ];

  const result = await inquirer.prompt(questions);
  return result.choice;
}

let keys = await loadFromFile(KEYS_FILENAME);

if (SHUFFLE_KEYS) {
  keys = shuffle(keys);
}

const lastKey = [...keys].pop();
const module = await getModule();

for (const key of keys) {
  try {
    await module(key);
  } catch (error) {
    console.log(error.message);
    cli.spinner("", true);
  }

  if (key !== lastKey) {
    const [min, max] = DELAY_SEC;
    const delayTimeout = random(min, max);
    await delayProgress(delayTimeout);
    console.log("=============");
  }
}
