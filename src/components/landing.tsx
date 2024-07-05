import { JSX } from "hono/jsx/jsx-runtime";

export const Login = ({ message }: { message: string }): JSX.Element => {
  return (
    <div class="container">
      <div class="container-title">{"Login"}</div>
      <p>{message}</p>
      <button>
        <a href={"/github/login"}>{"Login with Github"}</a>
      </button>
    </div>
  );
}; // TODO fix UI

export const Welcome = ({}): JSX.Element => {
  return (
    <div class="container">
      <div class="container-title">{"Welcome to PetitHub"}</div>
      <p>{"You are now connected"}</p>
      <button>
        <a href="/">{"Browse random GitHub repositories"}</a>
      </button>
      <button>
        <a href="/api">{"Browse API"}</a>
      </button>
    </div>
  );
}; // TODO fix UI
