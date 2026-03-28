export const html = (
  str: TemplateStringsArray,
  ...rest: Array<string | number>
) => {
  const htmlString = str.reduce((acc, part, index) => {
    const value = rest[index] ?? "";
    return acc + part + String(value);
  }, "");
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  const fragment = template.content.cloneNode(true) as HTMLElement;
  if (fragment.childNodes.length === 1) {
    return fragment.firstChild as HTMLElement;
  }
  return fragment;
};
