const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });

const suffixes: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
};

export const ordinalizeNumber = (number: number) => {
  const category = ordinalRules.select(number);
  const suffix = suffixes[category];

  return `${number}${suffix}`;
};
