import { FC } from "react";

const Button: FC<{
  text: string;
  onClick: () => Promise<void>;
  className: string;
  disabled?: boolean;
}> = ({ text, onClick, className, disabled = false }) => {
  const buttonOpts = { onClick, className, disabled };
  return <button {...buttonOpts}>{text}</button>;
};

export const LightButton: FC<{
  text: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
}> = (props) => {
  const buttonOpts = {
    className: "p-2 border border-slate-800 rounded bg-slate-200 text-slate-800 w-full",
    ...props,
  };
  return <Button {...buttonOpts} />;
};

export const DarkButton: FC<{
  text: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
}> = (props) => {
  const buttonOpts = { className: "p-2 rounded border border-slate-200 w-full", ...props };
  return <Button {...buttonOpts} />;
};

export const MainButton: FC<{
  text: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
}> = (props) => {
  const buttonOpts = { className: "p-2 rounded border bg-violet-800 border-violet-600 w-full", ...props };
  return <Button {...buttonOpts} />;
};
