import dadJokes from "dad-jokes";
import { jokes } from "jokes";
import jsonJokes from "@dolezel/jokes";
import oneLinerJoke from "one-liner-joke";

function getRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class FunnyJokeStreamer {
  private delayMs: number;

  constructor(delayMs = 300) {
    this.delayMs = delayMs;
  }

  private getRandomJoke(): string {
    const sources = [
      () => oneLinerJoke.getRandomJoke().body,
      () => jokes.chuckNorris(),
      () => jokes.yoMomma(),
      () => dadJokes.random(),
      () => getRandomFromArray(jsonJokes),
    ];

    const jokeFn = getRandomFromArray(sources);
    return jokeFn();
  }

  public async *stream(): AsyncGenerator<string> {
    const numJokes = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < numJokes; i++) {
      const joke = this.getRandomJoke();
      yield joke;
      await new Promise((res) => setTimeout(res, this.delayMs));
    }
  }
}
