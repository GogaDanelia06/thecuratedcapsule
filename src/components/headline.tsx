type HeadlineProps = {
  text: string;
  emphasis?: string;
};

export function Headline({ text, emphasis }: HeadlineProps) {
  const start = emphasis ? text.lastIndexOf(emphasis) : -1;
  if (!emphasis || start === -1) return text;

  return (
    <>
      {text.slice(0, start)}
      <em>{emphasis}</em>
      {text.slice(start + emphasis.length)}
    </>
  );
}
