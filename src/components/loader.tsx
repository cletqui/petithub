import { JSX } from "hono/jsx/jsx-runtime";

export const Loader = (): JSX.Element => {
  return (
    <div class="lds-ripple">
      <div />
      <div />
    </div>
  );
};
